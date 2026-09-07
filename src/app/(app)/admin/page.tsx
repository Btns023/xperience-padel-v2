import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatEuros } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  const since = monthStart.toISOString().slice(0, 10);

  const [
    { count: pendingReq },
    { count: openSlots },
    { data: monthInvoices },
    { data: unpaidInvoices },
  ] = await Promise.all([
    supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "demande_recue"),
    supabase
      .from("slots")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("invoices")
      .select("total_cents, status, kind, paid_at, issued_on")
      .neq("status", "draft")
      .gte("issued_on", since),
    supabase
      .from("invoices")
      .select("total_cents, dunning_count")
      .eq("kind", "invoice")
      .eq("status", "sent"),
  ]);

  const flagged = (unpaidInvoices ?? []).filter(
    (i) => (i.dunning_count ?? 0) >= 3,
  ).length;

  const billedMonth = (monthInvoices ?? [])
    .filter((i) => i.kind === "invoice")
    .reduce((s, i) => s + i.total_cents, 0);
  const cashedMonth = (monthInvoices ?? [])
    .filter((i) => i.status === "paid" && (i.paid_at ?? "") >= since)
    .reduce((s, i) => s + i.total_cents, 0);
  const unpaidTotal = (unpaidInvoices ?? []).reduce(
    (s, i) => s + i.total_cents,
    0,
  );

  const stats = [
    {
      label: "Demandes en attente",
      value: String(pendingReq ?? 0),
      href: "/admin/demandes",
    },
    {
      label: "Facturé ce mois",
      value: formatEuros(billedMonth),
      href: "/admin/factures",
    },
    {
      label: "Encaissé ce mois",
      value: formatEuros(cashedMonth),
      href: "/admin/factures",
    },
    {
      label: `Impayés (${(unpaidInvoices ?? []).length})`,
      value: formatEuros(unpaidTotal),
      href: "/admin/relances",
    },
    {
      label: "Factures signalées",
      value: String(flagged),
      href: "/admin/relances",
    },
    {
      label: "Créneaux ouverts",
      value: String(openSlots ?? 0),
      href: "/admin/creneaux",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble : demandes, facturation, paiements du mois en
          cours.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:border-foreground/20">
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{s.value}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pour démarrer une saison</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ol className="list-decimal space-y-1 pl-4">
            <li>
              Créer la <Link href="/admin/saisons" className="underline">saison</Link>{" "}
              et la passer en « active ».
            </li>
            <li>
              Vérifier les{" "}
              <Link href="/admin/produits" className="underline">produits &amp; tarifs</Link>{" "}
              (pré-remplis d&apos;après le site actuel).
            </li>
            <li>
              Renseigner{" "}
              <Link href="/admin/lieux" className="underline">lieux</Link> et{" "}
              <Link href="/admin/coachs" className="underline">coachs</Link>.
            </li>
            <li>
              Créer les{" "}
              <Link href="/admin/creneaux" className="underline">créneaux</Link> et
              les ouvrir.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
