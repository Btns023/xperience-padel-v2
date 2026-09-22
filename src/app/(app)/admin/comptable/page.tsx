import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { revokeAccountant } from "./actions";
import { GrantForm } from "./grant-form";

export const metadata = { title: "Accès comptable" };

export default async function AccesComptablePage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("role", "comptable");
  const people = await Promise.all(
    (data ?? []).map(async (p) => {
      const { data: u } = await createAdminClient().auth.admin.getUserById(p.id);
      return { ...p, email: u.user?.email ?? "" };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accès comptable</h1>
        <p className="text-muted-foreground">
          Ton comptable voit toute la comptabilité — journal, pièces
          justificatives, factures, Annexe B — et peut tout exporter. Il ne
          peut rien modifier.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Ouvrir un accès</h2>
        <p className="text-sm text-muted-foreground">
          1. Ton comptable crée un compte sur le site, avec son adresse
          professionnelle. 2. Tu saisis cette adresse ici.
        </p>
        <GrantForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Accès ouverts ({people.length})</h2>
        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun pour l&apos;instant.</p>
        ) : (
          <ul className="flex flex-col divide-y rounded-lg border">
            {people.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span>
                  <span className="font-medium">
                    {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                  </span>{" "}
                  <span className="text-muted-foreground">{p.email}</span>
                </span>
                <form action={revokeAccountant.bind(null, p.id)}>
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                    Retirer l&apos;accès
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
