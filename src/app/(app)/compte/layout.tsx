import Link from "next/link";
import { requireUser } from "@/lib/auth";

const NAV = [
  { href: "/compte", label: "Mon espace" },
  { href: "/compte/joueurs", label: "Mes joueurs" },
  { href: "/compte/inscription", label: "S'inscrire" },
  { href: "/compte/inscriptions", label: "Mes inscriptions" },
];

export default async function CompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

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
