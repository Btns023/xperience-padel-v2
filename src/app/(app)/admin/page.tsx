import { requireRole } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MODULES = [
  { lot: "Lot 1", title: "Catalogue & créneaux", desc: "Saisons, produits, tarifs, créneaux, niveaux." },
  { lot: "Lot 3", title: "Groupes", desc: "Constitution des groupes, effectifs, validation." },
  { lot: "Lot 4", title: "Facturation", desc: "Factures PDF, numérotation, notes de crédit, promos." },
  { lot: "Lot 5", title: "Paiements", desc: "Pointage des virements, relances, export CSV." },
  { lot: "Lot 6", title: "Coachs", desc: "Invitations, affectation aux créneaux." },
];

export default async function AdminPage() {
  await requireRole("admin");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
      <p className="text-muted-foreground">
        Tableau de bord et gestion. Modules ajoutés lot par lot.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <Card key={m.lot}>
            <CardHeader>
              <CardDescription>{m.lot}</CardDescription>
              <CardTitle className="text-base">{m.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{m.desc}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
