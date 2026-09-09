"use client";

import { useEffect, useRef } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function hasFinePointer() {
  return (
    typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches
  );
}

/**
 * Inclinaison 3D de l'élément sous le curseur, avec reflet doré.
 * Sans effet au clavier, sur écran tactile et en « mouvement réduit ».
 */
export function Tilt({
  children,
  className = "",
  max = 6,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** Amplitude maximale de l'inclinaison, en degrés. */
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || !hasFinePointer()) return;

    let raf = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      raf = 0;
      el.style.setProperty("--ry", `${(x - 0.5) * max * 2}deg`);
      el.style.setProperty("--rx", `${(0.5 - y) * max * 2}deg`);
      el.style.setProperty("--mx", `${x * 100}%`);
      el.style.setProperty("--my", `${y * 100}%`);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = (e.clientX - r.left) / r.width;
      y = (e.clientY - r.top) / r.height;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onEnter = () => {
      el.dataset.on = "1";
    };
    const onLeave = () => {
      delete el.dataset.on;
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);

  return (
    <div className={`scene h-full ${className}`}>
      <div
        ref={ref}
        className={`tilt h-full ${glare ? "tilt--glare" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Déplacement au scroll, plus lent (speed < 0) ou plus rapide que la page.
 * Utilisé pour décoller les plans du hero les uns des autres.
 */
export function Parallax({
  children,
  speed = 0.18,
  className = "",
}: {
  children: React.ReactNode;
  /** Fraction du défilement. 0.2 = le plan bouge 20 % moins vite. */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const centre = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-centre * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

/** Filet doré en haut de page : avancée dans le chapitre en cours. */
export function StoryProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="story-bar w-full"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
