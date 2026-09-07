import Link from "next/link";
import { requireRole } from "@/lib/auth";

const NAV = [
  { href: "/coach", label: "Mes groupes" },
  { href: "/coach/planning", label: "Planning" },
];

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["coach", "admin"]);

  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-10">
      <nav className="md:w-40 md:shrink-0">
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
