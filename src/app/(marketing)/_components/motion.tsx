"use client";

import { useEffect, useRef, useState } from "react";

/** Apparition douce quand l'élément entre dans le viewport. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLElement>(null);
  // "idle" = rendu SSR / sans JS : toujours visible.
  const [phase, setPhase] = useState<"idle" | "hidden" | "in">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Déjà (au moins en partie) visible au montage → on n'anime pas.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      setPhase("in");
      return;
    }
    setPhase("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPhase("in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    io.observe(el);
    // Filet de sécurité : jamais invisible plus de 1,5 s.
    const t = setTimeout(() => setPhase("in"), 1500);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);

  const Comp = Tag as "div";
  const cls =
    phase === "idle"
      ? ""
      : phase === "in"
        ? "reveal is-in"
        : "reveal";
  return (
    <Comp
      ref={ref as React.Ref<HTMLDivElement>}
      className={`${cls} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Comp>
  );
}

/** Bandeau défilant. `items` répété 2× pour une boucle continue. */
export function Marquee({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {loop.map((t, i) => (
          <span key={i} className="marquee__item">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Léger effet de parallaxe vertical sur un fond (désactivé si reduced-motion
 *  ou petit écran). */
export function Parallax({
  className = "",
  strength = 0.12,
}: {
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce || window.innerWidth < 768) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) *
          -strength;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.15)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 will-change-transform ${className}`}
    />
  );
}
