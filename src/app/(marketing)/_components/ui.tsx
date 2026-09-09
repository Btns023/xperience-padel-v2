import Link from "next/link";

export function Display({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-[family-name:var(--font-display)] uppercase leading-[0.92] tracking-[0.01em] ${className}`}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c9a24b]">
      {children}
    </p>
  );
}

export function CtaLink({
  href,
  children,
  variant = "gold",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "ghost";
}) {
  const cls =
    variant === "gold"
      ? "bg-[#c9a24b] text-[#0b0b0c] hover:bg-[#d8b566]"
      : "border border-white/20 text-white hover:bg-white/10";
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors ${cls}`}
    >
      {children}
    </Link>
  );
}

export function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-6xl px-5 py-16 sm:py-20 ${className}`}>
      {children}
    </section>
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
      className={`flex flex-col rounded-xl border p-6 ${
        highlight
          ? "border-[#c9a24b]/60 bg-[#c9a24b]/[0.07]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      {highlight ? (
        <span className="mb-2 w-fit rounded-full bg-[#c9a24b] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#0b0b0c]">
          {highlight}
        </span>
      ) : null}
      <span className="text-sm text-white/60">{label}</span>
      <span className="mt-2 text-3xl font-bold text-white tabular-nums">
        {price}
        {unit ? (
          <span className="ml-1 text-sm font-normal text-white/50">{unit}</span>
        ) : null}
      </span>
      {note ? <span className="mt-1 text-xs text-white/45">{note}</span> : null}
    </div>
  );
}

export function FeatureCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{text}</p>
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
    <div className="relative overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-[url(/court-bg.jpg)] bg-cover bg-center" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b0b0c]/80 via-[#0b0b0c]/88 to-[#0b0b0c]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(201,162,75,0.18),transparent_70%)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-20 text-center sm:py-28">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mx-auto mt-5 max-w-4xl text-balance text-5xl text-white sm:text-7xl">
          <Display>{title}</Display>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-white/65">{lead}</p>
        {primary || secondary ? (
          <div className="mt-9 flex flex-wrap justify-center gap-3">
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
  );
}
