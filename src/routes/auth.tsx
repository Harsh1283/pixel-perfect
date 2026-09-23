import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — ClientFlow" },
      {
        name: "description",
        content: "Sign in or create your ClientFlow studio account to manage clients and projects.",
      },
      { property: "og:title", content: "Sign in — ClientFlow" },
      {
        property: "og:description",
        content: "Sign in or create your ClientFlow studio account.",
      },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

const emailSchema = z.string().trim().email("Enter a valid email address");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");
const nameSchema = z.string().trim().min(2, "Please enter your name").max(80, "Name is too long");

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard" });
  }, [session, loading, navigate]);

  function validate() {
    const next: Record<string, string> = {};
    const e = emailSchema.safeParse(email);
    if (!e.success) next["email"] = e.error.issues[0]?.message ?? "Invalid email";
    if (mode !== "forgot") {
      const p = passwordSchema.safeParse(password);
      if (!p.success) next["password"] = p.error.issues[0]?.message ?? "Invalid password";
    }
    if (mode === "signup") {
      const n = nameSchema.safeParse(name);
      if (!n.success) next["name"] = n.error.issues[0]?.message ?? "Invalid name";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: "/dashboard" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: name.trim() },
          },
        });
        if (error) throw error;
        toast.success("Account created — check your inbox to confirm your email.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/settings`,
        });
        if (error) throw error;
        toast.success("Password reset link sent. Check your email.");
        setMode("signin");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "signin" ? "Welcome back" : mode === "signup" ? "Start your studio" : "Reset password";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-grape p-10 text-on-grape lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-coral text-on-coral">
            <span className="font-display text-2xl font-extrabold">C</span>
          </div>
          <span className="font-display text-2xl font-extrabold">ClientFlow</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-extrabold leading-tight">
            Every client, project and invoice in one console.
          </h2>
          <p className="mt-4 max-w-md text-sm font-semibold opacity-80">
            Track deadlines, send invoices, share files and keep clients in the loop — without
            juggling five tools.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-cream/15 px-3 py-1.5 text-xs font-bold">
              Client portal
            </span>
            <span className="rounded-full bg-cream/15 px-3 py-1.5 text-xs font-bold">
              Invoicing
            </span>
            <span className="rounded-full bg-cream/15 px-3 py-1.5 text-xs font-bold">
              Deadline tracking
            </span>
          </div>
        </div>
        <p className="text-xs font-semibold opacity-60">Built for freelancers and small agencies.</p>
      </div>

      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-2xl bg-coral text-on-coral">
              <span className="font-display text-xl font-extrabold">C</span>
            </div>
            <span className="font-display text-xl font-extrabold">ClientFlow</span>
          </Link>

          <h1 className="font-display text-3xl font-extrabold">{title}</h1>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            {mode === "signin"
              ? "Sign in to your workspace."
              : mode === "signup"
                ? "Create an account — it takes a minute."
                : "We'll email you a reset link."}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            {mode === "signup" ? (
              <Field label="Full name" error={errors["name"]}>
                <input
                  className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-coral"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Doe"
                  autoComplete="name"
                />
              </Field>
            ) : null}

            <Field label="Email" error={errors["email"]}>
              <input
                type="email"
                className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-coral"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                autoComplete="email"
              />
            </Field>

            {mode !== "forgot" ? (
              <Field label="Password" error={errors["password"]}>
                <input
                  type="password"
                  className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-coral"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </Field>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-coral px-5 py-3.5 font-display text-sm font-bold text-on-coral shadow-chunk transition active:translate-y-1 active:shadow-none disabled:opacity-60"
            >
              {busy
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : "Send reset link"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-sm font-semibold">
            {mode === "signin" ? (
              <>
                <button className="text-coral" onClick={() => setMode("forgot")}>
                  Forgot your password?
                </button>
                <div className="text-muted-foreground">
                  New here?{" "}
                  <button className="text-coral" onClick={() => setMode("signup")}>
                    Create an account
                  </button>
                </div>
              </>
            ) : (
              <button className="text-coral" onClick={() => setMode("signin")}>
                ← Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-xs font-bold text-coral">{error}</span> : null}
    </label>
  );
}
