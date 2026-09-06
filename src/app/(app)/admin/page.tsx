import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: seasons }, { count: products }, { count: slots }, { count: openSlots }] =
    await Promise.all([
      supabase.from("seasons").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("slots").select("*", { count: "exact", head: true }),
      supabase
        .from("slots")
        .select("*", { count: "exact", head: true })
        .eq("status", "open"),
    ]);

  const stats = [
    { label: "Saisons", value: seasons ?? 0, href: "/admin/saisons" },
    { label: "Produits", value: products ?? 0, href: "/admin/produits" },
    { label: "Créneaux", value: slots ?? 0, href: "/admin/creneaux" },
    { label: "Créneaux ouverts", value: openSlots ?? 0, href: "/admin/creneaux" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Lot 1 — catalogue de la saison. Les indicateurs de facturation et de
          paiement arriveront avec les lots suivants.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:border-foreground/20">
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-3xl tabular-nums">{s.value}</CardTitle>
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
