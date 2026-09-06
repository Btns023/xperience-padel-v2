import { requireUser, getCurrentProfile } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ComptePage() {
  await requireUser();
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mon espace</h1>
        <p className="text-muted-foreground">
          Bienvenue{profile?.first_name ? `, ${profile.first_name}` : ""}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Socle en place</CardTitle>
          <CardDescription>
            Lot 0 livré : compte, connexion, rôles. Les modules suivants
            (joueurs, inscriptions, factures) arrivent aux prochains lots.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-foreground">Rôle</dt>
              <dd>{profile?.role}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Téléphone</dt>
              <dd>{profile?.phone ?? "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
