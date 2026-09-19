import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { missingProfileFields, needsProfileCompletion } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Mon espace" };

export default async function ComptePage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ count: playerCount }, { count: activeReg }] = await Promise.all([
    supabase.from("players").select("*", { count: "exact", head: true }),
    supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .neq("status", "annulee"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mon espace</h1>
        <p className="text-muted-foreground">
          Bonjour{profile?.first_name ? ` ${profile.first_name}` : ""}.
        </p>
      </div>

      {needsProfileCompletion(profile) ? (
        <Link
          href="/compte/profil?completer=1"
          className="rounded-lg border border-amber-400 bg-amber-50 p-4 text-sm transition-colors hover:bg-amber-100 dark:border-amber-500/50 dark:bg-amber-500/10"
        >
          <span className="font-medium">Complète ton profil</span> — il manque :{" "}
          {missingProfileFields(profile).join(", ")}. Ces informations figurent
          sur tes factures et sont nécessaires pour t&apos;inscrire. →
        </Link>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/compte/joueurs">
          <Card className="transition-colors hover:border-foreground/20">
            <CardHeader>
              <CardDescription>Mes joueurs</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {playerCount ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/compte/inscriptions">
          <Card className="transition-colors hover:border-foreground/20">
            <CardHeader>
              <CardDescription>Inscriptions en cours</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {activeReg ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">S&apos;inscrire à un cours</CardTitle>
          <CardDescription>
            1. Ajoute les joueurs · 2. Choisis un créneau · 3. Envoie la demande.
            Une facture suit après constitution du groupe (paiement par virement).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/compte/inscription"
            className="text-sm underline underline-offset-4"
          >
            Voir les créneaux ouverts →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
