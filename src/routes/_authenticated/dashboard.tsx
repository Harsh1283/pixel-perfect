import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useActivities,
  useClients,
  useInvoiceItems,
  useInvoices,
  useProjects,
  useTasks,
  invoiceTotal,
  effectiveInvoiceStatus,
} from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";
import { seedDemoData } from "@/lib/seed";
import { useQueryClient } from "@tanstack/react-query";
import {
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  Panel,
  PageHeader,
  ProgressBar,
  StatCard,
  projectStatusTone,
  toneFromString,
  Bubble,
} from "@/components/app/ui-kit";
import { currency, formatShortDate, initials, relativeTime, daysUntil } from "@/lib/format";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ClientFlow" },
      {
        name: "description",
        content: "Revenue, active projects, pending invoices and upcoming deadlines at a glance.",
      },
      { property: "og:title", content: "Dashboard — ClientFlow" },
      { property: "og:description", content: "Your studio's numbers at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [seeding, setSeeding] = useState(false);

  const clients = useClients();
  const projects = useProjects();
  const tasks = useTasks();
  const invoices = useInvoices();
  const items = useInvoiceItems();
  const activities = useActivities();

  const loading =
    clients.isLoading || projects.isLoading || invoices.isLoading || tasks.isLoading;
  const error = clients.error ?? projects.error ?? invoices.error ?? tasks.error;

  const stats = useMemo(() => {
    const allProjects = projects.data ?? [];
    const allInvoices = invoices.data ?? [];
    const allItems = items.data ?? [];
    const activeProjects = allProjects.filter((p) => p.status !== "Completed");
    const pending = allInvoices.filter((i) => ["Sent", "Overdue"].includes(effectiveInvoiceStatus(i)));
    const pendingValue = pending.reduce((s, i) => s + invoiceTotal(i, allItems).total, 0);

    const now = new Date();
    const paidThisMonth = allInvoices
      .filter((i) => i.status === "Paid")
      .filter((i) => {
        const d = new Date(i.issue_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, i) => s + invoiceTotal(i, allItems).total, 0);

    const avgProgress = activeProjects.length
      ? Math.round(activeProjects.reduce((s, p) => s + p.progress, 0) / activeProjects.length)
      : 0;

    return {
      clients: (clients.data ?? []).length,
      activeProjects: activeProjects.length,
      pendingCount: pending.length,
      pendingValue,
      paidThisMonth,
      avgProgress,
    };
  }, [projects.data, invoices.data, items.data, clients.data]);

  const revenueSeries = useMemo(() => {
    const allInvoices = invoices.data ?? [];
    const allItems = items.data ?? [];
    const months: { label: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const revenue = allInvoices
        .filter((inv) => inv.status === "Paid")
        .filter((inv) => {
          const id = new Date(inv.issue_date);
          return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear();
        })
        .reduce((s, inv) => s + invoiceTotal(inv, allItems).total, 0);
      months.push({ label, revenue: Math.round(revenue) });
    }
    return months;
  }, [invoices.data, items.data]);

  const deadlines = useMemo(
    () =>
      (projects.data ?? [])
        .filter((p) => p.deadline && p.status !== "Completed")
        .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""))
        .slice(0, 4),
    [projects.data],
  );

  const clientName = (id: string | null) =>
    (clients.data ?? []).find((c) => c.id === id)?.company ?? "Unassigned";

  async function loadDemo() {
    if (!user) return;
    setSeeding(true);
    try {
      await seedDemoData(user.id);
      await qc.invalidateQueries();
      toast.success("Sample workspace loaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load sample data");
    } finally {
      setSeeding(false);
    }
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => void clients.refetch()} />;
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
        <LoadingState rows={3} />
      </div>
    );
  }

  const isEmpty = (clients.data ?? []).length === 0 && (projects.data ?? []).length === 0;

  if (isEmpty) {
    return (
      <div className="space-y-5">
        <PageHeader title="Welcome to ClientFlow" subtitle="Your workspace is ready." />
        <EmptyState
          icon={<Sparkles className="size-6" />}
          title="Nothing here yet"
          description="Add your first client, or load a realistic sample workspace to explore every feature."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={loadDemo}
                disabled={seeding}
                className="rounded-full bg-coral px-5 py-3 font-display text-sm font-bold text-on-coral shadow-chunk transition active:translate-y-1 active:shadow-none disabled:opacity-60"
              >
                {seeding ? "Loading…" : "Load sample workspace"}
              </button>
              <Link
                to="/clients"
                className="rounded-full border border-border px-5 py-3 text-sm font-bold"
              >
                Add a client
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Overview"
        subtitle={`${stats.activeProjects} active projects · ${stats.pendingCount} invoices awaiting payment`}
        action={
          <Link
            to="/invoices"
            className="rounded-full bg-sun px-5 py-3 font-display text-sm font-bold text-on-sun shadow-chunk transition active:translate-y-1 active:shadow-none"
          >
            + New invoice
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          tone="coral"
          label="Total clients"
          value={String(stats.clients)}
          hint={`${(clients.data ?? []).filter((c) => c.status === "active").length} active`}
        />
        <StatCard
          tone="sun"
          label="Active projects"
          value={String(stats.activeProjects)}
          hint={`${stats.avgProgress}% average completion`}
        />
        <StatCard
          tone="teal"
          label="Pending invoices"
          value={String(stats.pendingCount)}
          hint={`${currency(stats.pendingValue)} outstanding`}
        />
        <StatCard
          tone="grape"
          label="Revenue this month"
          value={currency(stats.paidThisMonth)}
          hint="Paid invoices only"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-extrabold">Revenue</h2>
              <p className="text-xs font-semibold text-muted-foreground">Last 6 months · paid</p>
            </div>
          </div>
          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--coral)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fontWeight: 700, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)" }}
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontWeight: 700,
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                  formatter={(v: number) => [currency(v), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--coral)"
                  strokeWidth={3}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <h2 className="font-display text-xl font-extrabold">Project progress</h2>
          <div className="mt-5 space-y-4">
            {(projects.data ?? [])
              .filter((p) => p.status !== "Completed")
              .slice(0, 5)
              .map((p) => (
                <div key={p.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: p.id }}
                      className="truncate font-bold hover:text-coral"
                    >
                      {p.name}
                    </Link>
                    <span className="font-bold text-muted-foreground">{p.progress}%</span>
                  </div>
                  <ProgressBar
                    value={p.progress}
                    tone={projectStatusTone[p.status] ?? "coral"}
                  />
                </div>
              ))}
            {(projects.data ?? []).filter((p) => p.status !== "Completed").length === 0 ? (
              <p className="text-sm font-semibold text-muted-foreground">No active projects.</p>
            ) : null}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold">Recent activity</h2>
            <span className="text-xs font-bold text-muted-foreground">
              {(activities.data ?? []).length} events
            </span>
          </div>
          <div className="mt-4 divide-y divide-border">
            {(activities.data ?? []).slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <span className="size-2.5 shrink-0 rounded-full bg-coral" />
                <p className="flex-1 text-sm font-semibold">{a.description}</p>
                <span className="shrink-0 text-xs font-bold text-muted-foreground">
                  {relativeTime(a.created_at)}
                </span>
              </div>
            ))}
            {(activities.data ?? []).length === 0 ? (
              <p className="py-6 text-sm font-semibold text-muted-foreground">
                Activity from your projects will show up here.
              </p>
            ) : null}
          </div>
        </Panel>

        <Panel>
          <h2 className="font-display text-xl font-extrabold">Upcoming deadlines</h2>
          <div className="mt-4 space-y-3">
            {deadlines.map((p) => {
              const left = daysUntil(p.deadline);
              return (
                <Link
                  key={p.id}
                  to="/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="flex items-center gap-3 rounded-2xl bg-muted p-3 transition-colors hover:bg-muted/70"
                >
                  <Bubble text={initials(clientName(p.client_id))} tone={toneFromString(p.name)} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{p.name}</div>
                    <div className="text-xs font-semibold text-muted-foreground">
                      {formatShortDate(p.deadline)} ·{" "}
                      {left !== null && left < 0
                        ? `${Math.abs(left)}d overdue`
                        : `in ${left ?? 0}d`}
                    </div>
                  </div>
                  <Chip tone={projectStatusTone[p.status] ?? "neutral"}>{p.status}</Chip>
                </Link>
              );
            })}
            {deadlines.length === 0 ? (
              <p className="text-sm font-semibold text-muted-foreground">
                No deadlines scheduled.
              </p>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}
