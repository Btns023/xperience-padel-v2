import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentProfile, homePathForRole } from "@/lib/auth";

export default async function Home() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-24 text-center">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Xperience Padel Academy · Gembloux
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Plateforme d&apos;inscription &amp; de facturation
        </h1>
        <p className="mx-auto max-w-xl text-pretty text-muted-foreground">
          Version 2 en construction. Le socle (comptes, connexion, rôles) est en
          place — la vitrine et les modules d&apos;inscription arrivent lot par
          lot.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {profile ? (
          <Link
            href={homePathForRole(profile.role)}
            className={buttonVariants()}
          >
            Accéder à mon espace
          </Link>
        ) : (
          <>
            <Link href="/inscription" className={buttonVariants()}>
              Créer un compte
            </Link>
            <Link
              href="/connexion"
              className={buttonVariants({ variant: "outline" })}
            >
              Se connecter
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
