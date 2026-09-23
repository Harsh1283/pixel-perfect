import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------- Cards & layout ---------------- */

export function Panel({
  children,
  className,
  tone = "surface",
}: {
  children: ReactNode;
  className?: string;
  tone?: "surface" | "coral" | "sun" | "teal" | "grape" | "muted";
}) {
  const tones: Record<string, string> = {
    surface: "bg-card text-card-foreground outline-1 -outline-offset-1 outline-border",
    coral: "bg-coral text-on-coral",
    sun: "bg-sun text-on-sun",
    teal: "bg-teal text-on-teal",
    grape: "bg-grape text-on-grape",
    muted: "bg-muted text-foreground",
  };
  return <div className={cn("rounded-3xl p-5 sm:p-6", tones[tone], className)}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/* ---------------- Stat card ---------------- */

export function StatCard({
  label,
  value,
  hint,
  tone = "coral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "coral" | "sun" | "teal" | "grape";
}) {
  const tones = {
    coral: "bg-coral text-on-coral",
    sun: "bg-sun text-on-sun",
    teal: "bg-teal text-on-teal",
    grape: "bg-grape text-on-grape",
  } as const;
  return (
    <div className={cn("rounded-3xl p-5 transition-transform hover:-translate-y-0.5", tones[tone])}>
      <div className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</div>
      <div className="mt-2 font-display text-3xl font-extrabold leading-none">{value}</div>
      {hint ? <div className="mt-3 text-xs font-semibold opacity-80">{hint}</div> : null}
    </div>
  );
}

/* ---------------- Status chips ---------------- */

const chipTones: Record<string, string> = {
  coral: "bg-coral/15 text-coral",
  sun: "bg-sun/25 text-on-sun dark:text-sun",
  teal: "bg-teal/15 text-teal",
  grape: "bg-grape/15 text-grape",
  neutral: "bg-muted text-muted-foreground",
};

export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof chipTones | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        chipTones[tone] ?? chipTones['neutral'],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const projectStatusTone: Record<string, string> = {
  Planning: "grape",
  "In Progress": "coral",
  Review: "sun",
  Completed: "teal",
};

export const priorityTone: Record<string, string> = {
  Low: "neutral",
  Medium: "sun",
  High: "coral",
  Urgent: "coral",
};

export const invoiceStatusTone: Record<string, string> = {
  Draft: "neutral",
  Sent: "grape",
  Paid: "teal",
  Overdue: "coral",
};

export const clientStatusTone: Record<string, string> = {
  active: "teal",
  lead: "sun",
  archived: "neutral",
};

/* ---------------- States ---------------- */

export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-3xl bg-coral/10 p-6 text-center">
      <div className="font-display text-lg font-extrabold text-coral">Something went wrong</div>
      <p className="mx-auto mt-1 max-w-md text-sm font-semibold text-muted-foreground">
        {message ?? "We couldn't load this right now."}
      </p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-4 rounded-full bg-coral px-4 py-2 text-sm font-bold text-on-coral"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-muted/60 px-6 py-14 text-center">
      {icon ? (
        <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-card text-coral">
          {icon}
        </div>
      ) : null}
      <div className="font-display text-xl font-extrabold">{title}</div>
      <p className="mt-2 max-w-sm text-sm font-semibold text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* ---------------- Progress ---------------- */

export function ProgressBar({ value, tone = "coral" }: { value: number; tone?: string }) {
  const tones: Record<string, string> = {
    coral: "bg-coral",
    sun: "bg-sun",
    teal: "bg-teal",
    grape: "bg-grape",
  };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-cream/15">
      <div
        className={cn("h-full rounded-full transition-all", tones[tone] ?? tones['coral'])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ---------------- Avatar bubble ---------------- */

export function Bubble({
  text,
  tone = "coral",
  className,
}: {
  text: string;
  tone?: "coral" | "sun" | "teal" | "grape";
  className?: string;
}) {
  const tones = {
    coral: "bg-coral text-on-coral",
    sun: "bg-sun text-on-sun",
    teal: "bg-teal text-on-teal",
    grape: "bg-grape text-on-grape",
  } as const;
  return (
    <div
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-2xl font-display text-sm font-bold",
        tones[tone],
        className,
      )}
    >
      {text}
    </div>
  );
}

export function toneFromString(seed: string): "coral" | "sun" | "teal" | "grape" {
  const tones = ["coral", "sun", "teal", "grape"] as const;
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return tones[sum % tones.length] ?? "coral";
}
