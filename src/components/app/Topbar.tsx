import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Moon, Search, Sun, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useClients, useInvoices, useNotifications, useProjects, useTasks, useProfile } from "@/lib/data";
import { initials } from "@/lib/format";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const clients = useClients();
  const projects = useProjects();
  const tasks = useTasks();
  const invoices = useInvoices();
  const notifications = useNotifications();
  const profile = useProfile(user?.id);

  const unread = useMemo(
    () => (notifications.data ?? []).filter((n) => !n.read).length,
    [notifications.data],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const name = profile.data?.full_name ?? user?.email?.split("@")[0] ?? "You";

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <button
        onClick={() => setOpen(true)}
        className="flex flex-1 items-center gap-2 rounded-full bg-muted px-4 py-2.5 text-left text-sm font-semibold text-muted-foreground sm:max-w-md"
      >
        <Search className="size-4" />
        <span className="truncate">Search clients, projects, tasks, invoices…</span>
        <kbd className="ml-auto hidden rounded-md bg-card px-1.5 py-0.5 text-[10px] font-bold sm:block">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggle}
          aria-label="Toggle dark mode"
          className="grid size-10 place-items-center rounded-2xl bg-muted"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative grid size-10 place-items-center rounded-2xl bg-muted"
        >
          <Bell className="size-4" />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-on-coral">
              {unread}
            </span>
          ) : null}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="grid size-10 place-items-center rounded-full bg-grape font-display text-sm font-bold text-on-grape">
              {initials(name)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl">
            <DropdownMenuLabel>
              <div className="font-bold">{name}</div>
              <div className="truncate text-xs font-semibold text-muted-foreground">
                {user?.email}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
              <User className="mr-2 size-4" /> Profile & settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                navigate({ to: "/auth" });
              }}
            >
              <LogOut className="mr-2 size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search everything…" />
        <CommandList>
          <CommandEmpty>No matches found.</CommandEmpty>
          <CommandGroup heading="Clients">
            {(clients.data ?? []).map((c) => (
              <CommandItem
                key={c.id}
                value={`client ${c.name} ${c.company ?? ""}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/clients/$clientId", params: { clientId: c.id } });
                }}
              >
                {c.name}
                <span className="ml-2 text-xs text-muted-foreground">{c.company}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Projects">
            {(projects.data ?? []).map((p) => (
              <CommandItem
                key={p.id}
                value={`project ${p.name}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/projects/$projectId", params: { projectId: p.id } });
                }}
              >
                {p.name}
                <span className="ml-2 text-xs text-muted-foreground">{p.status}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Tasks">
            {(tasks.data ?? []).slice(0, 20).map((t) => (
              <CommandItem
                key={t.id}
                value={`task ${t.title}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/tasks" });
                }}
              >
                {t.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Invoices">
            {(invoices.data ?? []).map((i) => (
              <CommandItem
                key={i.id}
                value={`invoice ${i.invoice_number}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/invoices/$invoiceId", params: { invoiceId: i.id } });
                }}
              >
                {i.invoice_number}
                <span className="ml-2 text-xs text-muted-foreground">{i.status}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
