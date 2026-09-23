import { supabase } from "@/integrations/supabase/client";

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function seedDemoData(userId: string) {
  const clients = [
    {
      user_id: userId,
      name: "Nadia Osei",
      company: "Nordic Drift",
      email: "nadia@nordicdrift.com",
      phone: "+1 415 555 0132",
      status: "active",
      notes: "E-commerce brand. Prefers Friday check-ins.",
    },
    {
      user_id: userId,
      name: "Marcus Kim",
      company: "Maple & Co",
      email: "marcus@mapleandco.com",
      phone: "+1 212 555 0178",
      status: "active",
      notes: "Rebrand in progress. Very design-literate.",
    },
    {
      user_id: userId,
      name: "Priya Raman",
      company: "Copper Wave",
      email: "priya@copperwave.io",
      phone: "+44 20 7946 0210",
      status: "active",
      notes: "SaaS product team. Sprint cadence, 2 weeks.",
    },
    {
      user_id: userId,
      name: "Elena Fischer",
      company: "Fern & Bloom Studio",
      email: "elena@fernbloom.co",
      phone: "+49 30 5555 214",
      status: "lead",
      notes: "Marketing site refresh — waiting on budget sign-off.",
    },
  ];

  const { data: insertedClients, error: clientError } = await supabase
    .from("clients")
    .insert(clients)
    .select();
  if (clientError) throw new Error(clientError.message);

  const byCompany = (company: string) =>
    insertedClients?.find((c) => c.company === company)?.id ?? null;

  const projects = [
    {
      user_id: userId,
      client_id: byCompany("Nordic Drift"),
      name: "Nordic Drift Storefront",
      description: "Full Shopify rebuild with a custom product configurator.",
      status: "In Progress",
      priority: "High",
      start_date: iso(-42),
      deadline: iso(18),
      budget: 38500,
      progress: 64,
    },
    {
      user_id: userId,
      client_id: byCompany("Maple & Co"),
      name: "Maple & Co Rebrand",
      description: "Identity system, guidelines and launch assets.",
      status: "Review",
      priority: "High",
      start_date: iso(-70),
      deadline: iso(6),
      budget: 24000,
      progress: 82,
    },
    {
      user_id: userId,
      client_id: byCompany("Copper Wave"),
      name: "Copper Wave Dashboard",
      description: "Analytics dashboard redesign and design system.",
      status: "In Progress",
      priority: "Medium",
      start_date: iso(-25),
      deadline: iso(34),
      budget: 42000,
      progress: 41,
    },
    {
      user_id: userId,
      client_id: byCompany("Fern & Bloom Studio"),
      name: "Fern & Bloom Marketing Site",
      description: "Five-page marketing site with CMS.",
      status: "Planning",
      priority: "Low",
      start_date: iso(-4),
      deadline: iso(55),
      budget: 12400,
      progress: 12,
    },
    {
      user_id: userId,
      client_id: byCompany("Nordic Drift"),
      name: "Nordic Drift Campaign Kit",
      description: "Seasonal campaign templates and email design.",
      status: "Completed",
      priority: "Medium",
      start_date: iso(-120),
      deadline: iso(-30),
      budget: 9800,
      progress: 100,
    },
  ];

  const { data: insertedProjects, error: projectError } = await supabase
    .from("projects")
    .insert(projects)
    .select();
  if (projectError) throw new Error(projectError.message);

  const projectId = (name: string) => insertedProjects?.find((p) => p.name === name)?.id ?? null;

  const tasks = [
    ["Nordic Drift Storefront", "Build product configurator UI", "High", "in_progress", 5],
    ["Nordic Drift Storefront", "QA checkout on mobile", "High", "todo", 9],
    ["Nordic Drift Storefront", "Migrate legacy product data", "Medium", "done", -3],
    ["Maple & Co Rebrand", "Final logo review with client", "High", "in_progress", 2],
    ["Maple & Co Rebrand", "Prepare brand guideline PDF", "Medium", "todo", 8],
    ["Maple & Co Rebrand", "Deliver social templates", "Low", "done", -6],
    ["Copper Wave Dashboard", "Design chart component set", "Medium", "in_progress", 11],
    ["Copper Wave Dashboard", "Audit accessibility contrast", "Low", "todo", 21],
    ["Fern & Bloom Marketing Site", "Draft homepage copy", "Medium", "todo", 14],
  ] as const;

  await supabase.from("tasks").insert(
    tasks.map(([project, title, priority, status, due]) => ({
      user_id: userId,
      project_id: projectId(project),
      title,
      priority,
      status,
      due_date: iso(due),
      completed_at: status === "done" ? new Date().toISOString() : null,
    })),
  );

  const invoices = [
    {
      user_id: userId,
      client_id: byCompany("Nordic Drift"),
      project_id: projectId("Nordic Drift Storefront"),
      invoice_number: "INV-0421",
      issue_date: iso(-20),
      due_date: iso(10),
      status: "Sent",
      tax_rate: 8,
      notes: "Milestone 2 of 3.",
    },
    {
      user_id: userId,
      client_id: byCompany("Maple & Co"),
      project_id: projectId("Maple & Co Rebrand"),
      invoice_number: "INV-0418",
      issue_date: iso(-45),
      due_date: iso(-12),
      status: "Sent",
      tax_rate: 8,
      notes: "Awaiting payment.",
    },
    {
      user_id: userId,
      client_id: byCompany("Copper Wave"),
      project_id: projectId("Copper Wave Dashboard"),
      invoice_number: "INV-0415",
      issue_date: iso(-60),
      due_date: iso(-30),
      status: "Paid",
      tax_rate: 0,
      notes: "Kick-off payment.",
    },
    {
      user_id: userId,
      client_id: byCompany("Fern & Bloom Studio"),
      project_id: projectId("Fern & Bloom Marketing Site"),
      invoice_number: "INV-0424",
      issue_date: iso(-2),
      due_date: iso(28),
      status: "Draft",
      tax_rate: 8,
      notes: "Deposit.",
    },
  ];

  const { data: insertedInvoices, error: invoiceError } = await supabase
    .from("invoices")
    .insert(invoices)
    .select();
  if (invoiceError) throw new Error(invoiceError.message);

  const invId = (num: string) => insertedInvoices?.find((i) => i.invoice_number === num)?.id;

  const items = [
    ["INV-0421", "Frontend development — sprint 4", 60, 145],
    ["INV-0421", "Product configurator build", 1, 6800],
    ["INV-0418", "Brand identity system", 1, 14500],
    ["INV-0418", "Guideline documentation", 12, 130],
    ["INV-0415", "Discovery workshop", 2, 1800],
    ["INV-0415", "Design system foundations", 1, 7400],
    ["INV-0424", "Project deposit (30%)", 1, 3720],
  ] as const;

  await supabase.from("invoice_items").insert(
    items
      .filter(([num]) => !!invId(num))
      .map(([num, description, quantity, unit_price]) => ({
        user_id: userId,
        invoice_id: invId(num)!,
        description,
        quantity,
        unit_price,
      })),
  );

  await supabase.from("activities").insert([
    {
      user_id: userId,
      project_id: projectId("Maple & Co Rebrand"),
      type: "milestone",
      description: "Milestone 3 approved by client",
    },
    {
      user_id: userId,
      project_id: projectId("Nordic Drift Storefront"),
      type: "update",
      description: "Configurator prototype shared for review",
    },
    {
      user_id: userId,
      project_id: projectId("Copper Wave Dashboard"),
      type: "update",
      description: "Sprint 2 planning completed",
    },
  ]);

  await supabase.from("notifications").insert([
    {
      user_id: userId,
      type: "invoice",
      title: "Invoice INV-0418 is overdue",
      body: "Maple & Co — 12 days past due.",
    },
    {
      user_id: userId,
      type: "deadline",
      title: "Maple & Co Rebrand is due soon",
      body: "Deadline in 6 days.",
    },
    {
      user_id: userId,
      type: "message",
      title: "New message from Priya Raman",
      body: "Can we review the chart set on Thursday?",
    },
  ]);

  await supabase.from("messages").insert([
    {
      user_id: userId,
      client_id: byCompany("Copper Wave"),
      project_id: projectId("Copper Wave Dashboard"),
      sender: "client",
      body: "Can we review the chart set on Thursday?",
    },
    {
      user_id: userId,
      client_id: byCompany("Copper Wave"),
      project_id: projectId("Copper Wave Dashboard"),
      sender: "owner",
      body: "Thursday works — I'll send a Figma link beforehand.",
    },
  ]);
}
