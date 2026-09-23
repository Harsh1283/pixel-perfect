import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  Receipt,
  Files,
  Bell,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/files", label: "Files", icon: Files },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <nav className="space-y-1">
      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeProps={{ className: "bg-ink text-cream" }}
          inactiveProps={{ className: "text-foreground/70 hover:bg-muted" }}
          className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition-colors"
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-coral text-on-coral">
        <span className="font-display text-xl font-extrabold">C</span>
      </div>
      <div>
        <div className="font-display text-lg font-extrabold leading-none">ClientFlow</div>
        <div className="text-[11px] font-semibold text-muted-foreground">Studio console</div>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile bar */}
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 lg:hidden">
        <Brand />
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-2xl bg-muted"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-b border-border bg-sidebar px-4 pb-4 lg:hidden">
          <NavList onNavigate={() => setOpen(false)} />
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-6 lg:flex",
        )}
      >
        <div className="px-1.5">
          <Brand />
        </div>
        <div className="mt-8">
          <NavList />
        </div>
        <div className="mt-auto rounded-3xl bg-grape p-4 text-on-grape">
          <div className="font-display text-base font-extrabold">Client portal</div>
          <p className="mt-1.5 text-xs font-semibold opacity-80">
            Share progress, files and invoices with each client.
          </p>
          <Link
            to="/clients"
            className="mt-4 block rounded-full bg-cream px-4 py-2 text-center text-xs font-bold text-grape"
          >
            Pick a client
          </Link>
        </div>
      </aside>
    </>
  );
}
