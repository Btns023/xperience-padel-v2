import Link from "next/link";
import { Parallax, Reveal } from "./motion";

export function Display({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-[family-name:var(--font-display)] uppercase leading-[0.88] tracking-[-0.01em] ${className}`}
      style={{ textWrap: "balance" }}
    >
      {children}
    </span>
  );
}

export function Eyebrow({
  n,
  children,
}: {
  n?: string;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
      {n ? <span className="tabular-nums text-[var(--ink-faint)]">{n}</span> : null}
      <span className="h-px w-6 bg-[var(--gold-deep)]" />
      {children}
    </p>
  );
}

export function CtaLink({
  href,
  children,
  variant = "gold",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "ghost";
  className?: string;
}) {
  const cls =
    variant === "gold"
      ? "bg-[var(--gold)] text-[#0a0a0b] hover:bg-[var(--gold-bright)]"
      : "border border-[var(--line-strong)] text-[var(--ink)] hover:border-[var(--gold)] hover:text-[var(--gold-bright)]";
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${cls} ${className}`}
    >
      {children}
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`mx-auto max-w-6xl px-5 py-20 sm:py-28 ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHead({
  n,
  eyebrow,
  title,
  lead,
}: {
  n?: string;
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
}) {
  return (
    <Reveal className="flex flex-col gap-4">
      <Eyebrow n={n}>{eyebrow}</Eyebrow>
      <h2 className="max-w-3xl text-4xl text-[var(--ink)] sm:text-6xl">
        <Display>{title}</Display>
      </h2>
      {lead ? (
        <p className="max-w-2xl text-pretty text-[var(--ink-dim)]">{lead}</p>
      ) : null}
    </Reveal>
  );
}

export function XWatermark({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.svg"
      alt=""
      aria-hidden="true"
      className={`x-watermark ${className}`}
    />
  );
}

export function PriceCard({
  label,
  price,
  unit,
  highlight,
  note,
}: {
  label: string;
  price: string;
  unit?: string;
  highlight?: string;
  note?: string;
}) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-6 transition-colors ${
        highlight
          ? "border-[var(--gold)]/60 bg-[var(--gold-glow)]"
          : "border-[var(--line)] bg-white/[0.03] hover:border-[var(--line-strong)]"
      }`}
    >
      {highlight ? (
        <span className="mb-3 w-fit rounded-full bg-[var(--gold)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0a0a0b]">
          {highlight}
        </span>
      ) : null}
      <span className="text-sm text-[var(--ink-dim)]">{label}</span>
      <span className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] tabular-nums">
        {price}
        {unit ? (
          <span className="ml-1.5 text-sm font-normal text-[var(--ink-faint)]">
            {unit}
          </span>
        ) : null}
      </span>
      {note ? (
        <span className="mt-2 text-xs text-[var(--ink-faint)]">{note}</span>
      ) : null}
    </div>
  );
}

export function FeatureCard({
  n,
  title,
  text,
}: {
  n?: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white/[0.03] p-6 transition-colors hover:border-[var(--gold)]/40">
      {n ? (
        <div className="font-[family-name:var(--font-display)] text-3xl text-[var(--gold)]">
          {n}
        </div>
      ) : null}
      <h3 className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--ink)]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-dim)]">{text}</p>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <div className="relative overflow-hidden border-b border-[var(--line)]">
      <div className="absolute inset-0 overflow-hidden">
        <Parallax className="bg-[url(/court-bg.jpg)] bg-cover bg-center" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/82 via-[#0a0a0b]/90 to-[var(--bg)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(58%_48%_at_50%_0%,var(--gold-glow),transparent_70%)]" />
      <XWatermark className="left-1/2 top-1/2 w-[min(90vw,640px)] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-24 text-center sm:py-32">
        <div className="hero-rise flex flex-col items-center gap-6">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-5xl text-[var(--ink)] sm:text-7xl">
            <Display>{title}</Display>
          </h1>
          <p className="max-w-2xl text-pretty text-[var(--ink-dim)]">{lead}</p>
          {primary || secondary ? (
            <div className="flex flex-wrap justify-center gap-3">
              {primary ? (
                <CtaLink href={primary.href}>{primary.label}</CtaLink>
              ) : null}
              {secondary ? (
                <CtaLink href={secondary.href} variant="ghost">
                  {secondary.label}
                </CtaLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
