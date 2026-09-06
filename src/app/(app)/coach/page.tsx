import { requireRole } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CoachPage() {
  await requireRole(["coach", "admin"]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Espace coach</h1>
      <Card>
        <CardHeader>
          <CardTitle>À venir (Lot 6)</CardTitle>
          <CardDescription>
            Mes groupes, planning des séances, listes de joueurs, présences.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Accès réservé aux rôles <code>coach</code> et <code>admin</code>.
        </CardContent>
      </Card>
    </div>
  );
}
