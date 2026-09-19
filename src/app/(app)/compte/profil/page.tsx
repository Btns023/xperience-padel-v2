import { redirect } from "next/navigation";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { missingProfileFields } from "@/lib/profile";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Mon profil" };

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ completer?: string; next?: string }>;
}) {
  const { completer, next } = await searchParams;
  const [user, profile] = await Promise.all([
    getCurrentUser(),
    getCurrentProfile(),
  ]);
  if (!user || !profile) redirect("/connexion");

  const missing = missingProfileFields(profile);
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {completer ? "Complète ton profil" : "Mon profil"}
        </h1>
        <p className="text-muted-foreground">
          Tes coordonnées figurent sur tes factures : nom et adresse sont
          obligatoires.
        </p>
      </div>

      {completer && missing.length > 0 ? (
        <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          Encore une étape avant de continuer — il manque : {missing.join(", ")}.
        </p>
      ) : null}

      <ProfileForm
        key={profile.updated_at}
        profile={profile}
        email={user.email ?? ""}
        next={safeNext}
      />
    </div>
  );
}
