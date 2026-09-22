import Link from "next/link";
import { requireRole } from "@/lib/auth";

const NAV = [
  { href: "/compta", label: "Journal" },
  { href: "/compta/pieces-manquantes", label: "Pièces manquantes" },
  { href: "/compta/annexe-b", label: "Annexe B" },
  { href: "/compta/factures", label: "Factures émises" },
];

/** Espace comptabilité : l'académie (lecture + saisie) et le comptable (lecture). */
export default async function ComptaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["admin", "comptable"]);

  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-10">
      <nav className="md:w-48 md:shrink-0">
        <ul className="flex flex-wrap gap-1 md:flex-col">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
          {profile.role === "admin" ? (
            <li className="md:mt-4 md:border-t md:pt-4">
              <Link
                href="/admin"
                className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                ← Administration
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
