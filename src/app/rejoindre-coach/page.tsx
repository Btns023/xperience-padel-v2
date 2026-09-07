import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AcceptButton, CoachSignupForm } from "./join-form";

export const metadata = { title: "Rejoindre l'équipe coach" };

export default async function RejoindreCoachPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const supabase = await createClient();

  const shell = (children: React.ReactNode) => (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        Équipe coach — Xperience Padel
      </h1>
      {children}
    </div>
  );

  if (!token) {
    return shell(<p className="text-muted-foreground">Lien invalide.</p>);
  }

  const { data: infoRows } = await supabase.rpc("coach_invite_info", {
    p_token: token,
  });
  const info = (infoRows ?? [])[0] as
    | { coach_name: string; email: string; valid: boolean; accepted: boolean }
    | undefined;

  if (!info) {
    return shell(
      <p className="text-muted-foreground">
        Cette invitation n&apos;existe pas ou a été révoquée.
      </p>,
    );
  }
  if (info.accepted) {
    return shell(
      <p className="text-muted-foreground">
        Cette invitation a déjà été utilisée.{" "}
        <Link href="/connexion" className="underline">
          Se connecter
        </Link>
        .
      </p>,
    );
  }
  if (!info.valid) {
    return shell(
      <p className="text-muted-foreground">
        Ce lien a expiré. Demande un nouveau lien à l&apos;académie.
      </p>,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const sameEmail =
      (user.email ?? "").toLowerCase() === info.email.toLowerCase();
    return shell(
      sameEmail ? (
        <>
          <p className="text-muted-foreground">
            Bonjour {info.coach_name}. Confirme pour activer ton accès coach.
          </p>
          <AcceptButton token={token} />
        </>
      ) : (
        <p className="text-muted-foreground">
          Ce lien est destiné à <strong>{info.email}</strong>, mais tu es
          connecté avec <strong>{user.email}</strong>. Déconnecte-toi puis rouvre
          ce lien.
        </p>
      ),
    );
  }

  return shell(
    <>
      <p className="text-muted-foreground">
        {info.coach_name}, crée ton compte pour accéder à tes groupes.
      </p>
      <CoachSignupForm token={token} email={info.email} />
    </>,
  );
}
