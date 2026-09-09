"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-[var(--line)] bg-[#070707]/90 backdrop-blur"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2.5">
        <Link
          href="/"
          className="flex items-center"
          aria-label="Xperience Padel Academy — accueil"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-white.svg"
            alt="Xperience Padel Academy"
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-x-5 gap-y-1 xl:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-55)] transition-colors hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/connexion"
            className="hidden text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-55)] transition-colors hover:text-white sm:inline"
          >
            Se connecter
          </Link>
          <Link href="/inscription" className="btn btn--gold">
            Réserver
          </Link>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[var(--line-3)] text-white xl:hidden"
          >
            <span className="text-lg leading-none">{open ? "✕" : "≡"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-[var(--line)] bg-[#070707] px-5 py-3 xl:hidden">
          <ul className="flex flex-col">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-55)]"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-[var(--bg-2)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-white.svg"
            alt="Xperience Padel Academy"
            className="h-9 w-auto"
          />
          <p className="mt-4 text-sm text-[var(--ink-40)]">
            Cours et stages de padel à Gembloux. Encadrement par des joueurs
            classés P1000, P700 et P500.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm">
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">
              Formules
            </span>
            {NAV.slice(0, 5).map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-[var(--ink-40)] hover:text-white"
              >
                {n.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">
              Contact
            </span>
            <a
              href="tel:+32473607207"
              className="text-[var(--ink-40)] hover:text-white"
            >
              0473 / 607 207
            </a>
            <a
              href="mailto:info@padelxp.be"
              className="text-[var(--ink-40)] hover:text-white"
            >
              info@padelxp.be
            </a>
            <span className="text-[var(--ink-40)]">Padel Smash Gembloux</span>
            <Link
              href="/conditions"
              className="text-[var(--ink-40)] hover:text-white"
            >
              Conditions générales
            </Link>
            <Link
              href="/confidentialite"
              className="text-[var(--ink-40)] hover:text-white"
            >
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--line)] px-5 py-5 text-center text-xs text-[var(--ink-40)]">
        © {new Date().getFullYear()} Xperience Padel Academy · Gembloux, Belgique
      </div>
    </footer>
  );
}
