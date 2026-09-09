"use client";

import { useEffect, useRef, useState } from "react";

/** Apparition douce quand l'élément entre dans le viewport.
 *  Visible par défaut (SSR / sans JS), filet de sécurité de 1,5 s. */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "hidden" | "in">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
    const t = setTimeout(() => setPhase("in"), 1500);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);

  const cls =
    phase === "idle" ? "" : phase === "in" ? "reveal is-in" : "reveal";
  return (
    <div
      ref={ref}
      className={`${cls} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
