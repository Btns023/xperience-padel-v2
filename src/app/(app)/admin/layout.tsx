import Link from "next/link";
import { requireRole } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/planning", label: "Planning" },
  { href: "/admin/demandes", label: "Demandes d'inscription" },
  { href: "/admin/factures", label: "Factures" },
  { href: "/admin/relances", label: "Impayés & relances" },
  { href: "/admin/codes-promo", label: "Codes promo" },
  { href: "/admin/saisons", label: "Saisons" },
  { href: "/admin/produits", label: "Produits & tarifs" },
  { href: "/admin/creneaux", label: "Créneaux" },
  { href: "/admin/lieux", label: "Lieux" },
  { href: "/admin/coachs", label: "Coachs" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");

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
        </ul>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
