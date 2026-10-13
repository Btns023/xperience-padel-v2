"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ScrollProgress } from "./depth";

type NavItem =
  | { href: string; label: string }
  | { label: string; children: { href: string; label: string }[] };

const NAV: NavItem[] = [
  {
    label: "Cours",
    children: [
      { href: "/cours-adultes", label: "Cours adultes" },
      { href: "/cours-enfants", label: "Cours enfants" },
      { href: "/cours-prives", label: "Cours privés" },
    ],
  },
  // L'Été indien ne figure plus au menu : le cycle est terminé. La page reste
  // en ligne pour les liens déjà partagés, elle réapparaîtra la saison
  // prochaine.
  { href: "/stages-ete", label: "Stage intensif" },
  { href: "/calendrier-tarifs", label: "Calendrier & tarifs" },
  { href: "/coachs", label: "Coachs" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/contact", label: "Contact" },
];

const LINK_CLS =
  "whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-55)] transition-colors hover:text-white";

function DesktopDropdown({ label, items }: { label: string; items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`${LINK_CLS} flex items-center gap-1`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <span className="text-[9px]">▾</span>
      </button>
      {open ? (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
          <ul className="min-w-[190px] rounded-[2px] border border-[var(--line-2)] bg-[#070707] p-1.5 shadow-xl shadow-black/40">
            {items.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="block rounded-[2px] px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-55)] transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

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
      <ScrollProgress />
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

        {/* Le menu déroulé demande de la place : en dessous de 1280 px, on
            bascule sur le menu burger plutôt que de serrer les libellés. */}
        <nav className="hidden items-center gap-x-5 xl:flex">
          {NAV.map((n) =>
            "children" in n ? (
              <DesktopDropdown key={n.label} label={n.label} items={n.children} />
            ) : (
              <Link key={n.href} href={n.href} className={LINK_CLS}>
                {n.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/connexion"
            className="hidden whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-55)] transition-colors hover:text-white sm:inline"
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
            {NAV.map((n) =>
              "children" in n ? (
                <li key={n.label} className="py-1">
                  <span className="block py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                    {n.label}
                  </span>
                  {n.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={() => setOpen(false)}
                      className="block py-2 pl-3 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ink-55)]"
                    >
                      {c.label}
                    </Link>
                  ))}
                </li>
              ) : (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ink-55)]"
                  >
                    {n.label}
                  </Link>
                </li>
              ),
            )}
            <li>
              <Link
                href="/connexion"
                onClick={() => setOpen(false)}
                className="block py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ink-55)]"
              >
                Se connecter
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-[var(--bg-2)] band">
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
            classés P1000, P700, P500 et P300.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm">
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">
              Formules
            </span>
            <Link href="/cours-adultes" className="text-[var(--ink-40)] hover:text-white">
              Cours adultes
            </Link>
            <Link href="/cours-enfants" className="text-[var(--ink-40)] hover:text-white">
              Cours enfants
            </Link>
            <Link href="/cours-prives" className="text-[var(--ink-40)] hover:text-white">
              Cours privés
            </Link>
            <Link href="/stages-ete" className="text-[var(--ink-40)] hover:text-white">
              Stage intensif
            </Link>
            <Link
              href="/calendrier-tarifs"
              className="text-[var(--ink-40)] hover:text-white"
            >
              Calendrier &amp; tarifs
            </Link>
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
            <span className="text-[var(--ink-40)]">Padel Smash Gembloutois</span>
            <a
              href="https://www.instagram.com/xperience_padel_academy/"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--ink-40)] hover:text-white"
            >
              Instagram
            </a>
            <Link href="/contact" className="text-[var(--ink-40)] hover:text-white">
              Nous écrire
            </Link>
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
