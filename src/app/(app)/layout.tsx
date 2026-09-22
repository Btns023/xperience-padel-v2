import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/lib/types";

const ROLE_LABEL: Record<AppRole, string> = {
  client: "Espace client",
  coach: "Espace coach",
  admin: "Administration",
  comptable: "Comptabilité",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion");

  const name =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Mon compte";

  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="font-medium tracking-tight">
              Xperience Padel
            </Link>
            <span className="text-sm text-muted-foreground">
              {ROLE_LABEL[profile.role]}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {name}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Se déconnecter
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
