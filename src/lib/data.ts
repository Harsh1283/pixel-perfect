import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Client = Tables<"clients">;
export type Project = Tables<"projects">;
export type Task = Tables<"tasks">;
export type Invoice = Tables<"invoices">;
export type InvoiceItem = Tables<"invoice_items">;
export type FileRow = Tables<"files">;
export type Notification = Tables<"notifications">;
export type Message = Tables<"messages">;
export type Activity = Tables<"activities">;
export type Profile = Tables<"profiles">;

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

/* ------------- queries ------------- */

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: () =>
      unwrap<Client[]>(supabase.from("clients").select("*").order("created_at", { ascending: false })),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      return data as Client | null;
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () =>
      unwrap<Project[]>(
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
      ),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      return data as Project | null;
    },
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () =>
      unwrap<Task[]>(supabase.from("tasks").select("*").order("created_at", { ascending: false })),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: () =>
      unwrap<Invoice[]>(
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      ),
  });
}

export function useInvoiceItems() {
  return useQuery({
    queryKey: ["invoice_items"],
    queryFn: () => unwrap<InvoiceItem[]>(supabase.from("invoice_items").select("*")),
  });
}

export function useFiles() {
  return useQuery({
    queryKey: ["files"],
    queryFn: () =>
      unwrap<FileRow[]>(supabase.from("files").select("*").order("created_at", { ascending: false })),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      unwrap<Notification[]>(
        supabase.from("notifications").select("*").order("created_at", { ascending: false }),
      ),
  });
}

export function useMessages() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: () =>
      unwrap<Message[]>(
        supabase.from("messages").select("*").order("created_at", { ascending: true }),
      ),
  });
}

export function useActivities() {
  return useQuery({
    queryKey: ["activities"],
    queryFn: () =>
      unwrap<Activity[]>(
        supabase.from("activities").select("*").order("created_at", { ascending: false }),
      ),
  });
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Profile | null;
    },
  });
}

/* ------------- mutations ------------- */

type TableName =
  | "clients"
  | "projects"
  | "tasks"
  | "invoices"
  | "invoice_items"
  | "files"
  | "notifications"
  | "messages"
  | "activities";

const related: Record<string, string[]> = {
  clients: ["clients", "projects", "invoices"],
  projects: ["projects", "activities", "tasks"],
  tasks: ["tasks", "activities"],
  invoices: ["invoices", "invoice_items"],
  invoice_items: ["invoice_items", "invoices"],
  files: ["files"],
  notifications: ["notifications"],
  messages: ["messages"],
  activities: ["activities"],
};

export function useInvalidate() {
  const qc = useQueryClient();
  return (table: TableName) => {
    for (const key of related[table] ?? [table]) {
      qc.invalidateQueries({ queryKey: [key] });
    }
  };
}

export async function logActivity(
  userId: string,
  projectId: string | null,
  type: string,
  description: string,
) {
  await supabase.from("activities").insert({
    user_id: userId,
    project_id: projectId,
    type,
    description,
  });
}

export async function notify(userId: string, type: string, title: string, body?: string) {
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body: body ?? null,
  });
}

export function useInsert<T extends TableName>(table: T) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (values: TablesInsert<T>) => {
      const { data, error } = await supabase
        .from(table)
        .insert(values as never)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => invalidate(table),
  });
}

export function useUpdate<T extends TableName>(table: T) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: TablesUpdate<T> }) => {
      const query = supabase.from(table) as unknown as {
        update: (v: unknown) => {
          eq: (c: string, v: string) => { select: () => { single: () => Promise<{ data: unknown; error: { message: string } | null }> } };
        };
      };
      const { data, error } = await query.update(values).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => invalidate(table),
  });
}

export function useRemove<T extends TableName>(table: T) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const query = supabase.from(table) as unknown as {
        delete: () => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> };
      };
      const { error } = await query.delete().eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => invalidate(table),
  });
}

/* ------------- derived helpers ------------- */

export function invoiceTotal(invoice: Invoice, items: InvoiceItem[]) {
  const subtotal = items
    .filter((i) => i.invoice_id === invoice.id)
    .reduce((sum, i) => sum + Number(i.quantity) * Number(i.unit_price), 0);
  const tax = subtotal * (Number(invoice.tax_rate) / 100);
  return { subtotal, tax, total: subtotal + tax };
}

export function isOverdue(invoice: Invoice) {
  if (invoice.status === "Paid" || invoice.status === "Draft") return false;
  if (!invoice.due_date) return false;
  return new Date(invoice.due_date).getTime() < Date.now();
}

export function effectiveInvoiceStatus(invoice: Invoice) {
  return isOverdue(invoice) ? "Overdue" : invoice.status;
}
