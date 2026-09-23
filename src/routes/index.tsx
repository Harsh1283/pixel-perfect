import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClientFlow — Studio console for clients, projects & invoices" },
      {
        name: "description",
        content:
          "ClientFlow is a client and project management console for freelancers and small agencies: projects, tasks, invoices, files and a client portal.",
      },
      { property: "og:title", content: "ClientFlow — Studio console" },
      {
        property: "og:description",
        content:
          "Clients, projects, tasks, invoices and a client portal in one bold, fast console.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        <header className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-coral text-on-coral">
              <span className="font-display text-2xl font-extrabold">C</span>
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold leading-none">ClientFlow</div>
              <div className="text-xs font-semibold text-ink/50">Studio console</div>
            </div>
          </div>
          <div className="ml-auto">
            <Link
              to={session ? "/dashboard" : "/auth"}
              className="rounded-full bg-ink px-5 py-3 font-display text-sm font-bold text-cream"
            >
              {session ? "Open dashboard" : "Sign in"}
            </Link>
          </div>
        </header>

        <section className="mt-16 max-w-3xl">
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Run every client, project and invoice from one bold console.
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold text-ink/60">
            ClientFlow gives freelancers and small agencies a clear view of the work: deadlines,
            progress, money in, and a portal clients actually enjoy using.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={session ? "/dashboard" : "/auth"}
              className="rounded-full bg-sun px-6 py-3.5 font-display text-sm font-bold text-on-sun shadow-chunk transition active:translate-y-1 active:shadow-none"
            >
              {session ? "Go to dashboard" : "Start free"}
            </Link>
            <span className="rounded-full bg-teal/10 px-4 py-2 text-sm font-bold text-teal">
              No credit card needed
            </span>
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { tone: "bg-coral text-on-coral", k: "Clients", v: "Profiles, notes, status" },
            { tone: "bg-sun text-on-sun", k: "Projects", v: "Budget, deadline, progress" },
            { tone: "bg-teal text-on-teal", k: "Invoices", v: "Items, tax, totals" },
            { tone: "bg-grape text-on-grape", k: "Portal", v: "Files, updates, messages" },
          ].map((c) => (
            <div key={c.k} className={`rounded-3xl p-5 ${c.tone}`}>
              <div className="font-display text-xl font-extrabold">{c.k}</div>
              <div className="mt-2 text-xs font-semibold opacity-80">{c.v}</div>
            </div>
          ))}
        </section>

        <footer className="mt-20 border-t border-ink/10 pt-6 text-xs font-semibold text-ink/40">
          ClientFlow — built for studios that ship.
        </footer>
      </div>
    </div>
  );
}
