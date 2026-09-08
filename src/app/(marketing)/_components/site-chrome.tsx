import Link from "next/link";

const NAV = [
  { href: "/cours-adultes", label: "Cours adultes" },
  { href: "/cours-enfants", label: "Cours enfants" },
  { href: "/cours-prives", label: "Cours privés" },
  { href: "/stages-ete", label: "Stages été" },
  { href: "/ete-indien", label: "Été indien" },
  { href: "/coachs", label: "Coachs" },
  { href: "/sponsors", label: "Sponsors" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0b0c]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-8 w-8 invert" />
          <span className="text-sm font-semibold tracking-[0.14em] text-white">
            XPERIENCE
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/connexion"
            className="hidden text-sm text-white/70 transition-colors hover:text-white sm:inline"
          >
            Se connecter
          </Link>
          <Link
            href="/inscription"
            className="rounded-md bg-[#c9a24b] px-4 py-2 text-sm font-semibold text-[#0b0b0c] transition-colors hover:bg-[#d8b566]"
          >
            Réserver
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-[#0b0b0c]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="h-7 w-7 invert" />
            <span className="text-sm font-semibold tracking-[0.14em] text-white">
              XPERIENCE PADEL ACADEMY
            </span>
          </div>
          <p className="mt-3 text-sm text-white/55">
            Cours et stages de padel à Gembloux. Encadrement par des joueurs
            classés P1000, P700 et P500.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white">Nos formules</span>
            {NAV.slice(0, 5).map((n) => (
              <Link key={n.href} href={n.href} className="text-white/60 hover:text-white">
                {n.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white">Contact</span>
            <a href="tel:+32473607207" className="text-white/60 hover:text-white">
              0473 / 607 207
            </a>
            <a
              href="mailto:info@padelxp.be"
              className="text-white/60 hover:text-white"
            >
              info@padelxp.be
            </a>
            <span className="text-white/60">Padel Smash Gembloux</span>
            <Link href="/confidentialite" className="text-white/60 hover:text-white">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Xperience Padel Academy · Gembloux, Belgique
      </div>
    </footer>
  );
}
