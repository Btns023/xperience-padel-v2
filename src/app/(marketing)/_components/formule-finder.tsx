"use client";

import Link from "next/link";
import { useState } from "react";
import { Tilt } from "./depth";
import { RENTREE } from "./season";

type Who = "adulte" | "enfant";
type Level = "decouvre" | "joue" | "interclubs";
type Format = "groupe" | "prive" | "ete";
type Age = "6-8" | "9-12" | "13-18";
type KidFormat = "groupe" | "prive";

type Answers = {
  who?: Who;
  level?: Level;
  format?: Format;
  age?: Age;
  kidFormat?: KidFormat;
};

type Result = {
  eyebrow: string;
  title: string;
  price: string;
  why: string;
  note?: string;
  href: string;
  hrefLabel: string;
};

/** Créneaux enfants par tranche d'âge (voir la page Cours enfants). */
const KID_SLOTS: Record<Age, string> = {
  "6-8": "Mercredi 13h00",
  "9-12": "Mercredi 14h00 ou samedi 10h00",
  "13-18": "Mercredi 15h00 / 16h00 ou samedi 11h00",
};

function resolve(a: Answers): Result | null {
  if (a.who === "enfant") {
    if (!a.age || !a.kidFormat) return null;
    if (a.kidFormat === "prive") {
      return {
        eyebrow: "Cours enfant à la carte",
        title: "Coaching individuel",
        price: "45 €",
        why: "Un coach pour votre enfant seul, horaire à convenir. Idéal pour rattraper, débloquer un geste ou tester avant de s'engager sur un cycle.",
        note: "1h · terrain et matériel compris · 65 € en 1h30",
        href: "/cours-enfants",
        hrefLabel: "Voir les cours enfants",
      };
    }
    return {
      eyebrow: "Cycle enfants & ados",
      title: "Cours collectifs à l'année",
      price: "dès 150 €",
      why: "Groupe de son âge, encadré par Andréa Maronet (P300, éducatrice physique). Plus le cycle est long, moins la séance coûte cher — 13 € en cycle complet.",
      note: `${KID_SLOTS[a.age]} · séances d'1h · ${RENTREE.enfants.label.toLowerCase()}`,
      href: "/cours-enfants",
      hrefLabel: "Voir les créneaux",
    };
  }

  if (!a.level || !a.format) return null;

  if (a.format === "prive") {
    return {
      eyebrow: "Cours privé",
      title: a.level === "interclubs" ? "Perfectionnement ciblé" : "Un coach pour vous seul",
      price: "60 €",
      why:
        a.level === "decouvre"
          ? "La façon la plus rapide de partir sur de bonnes bases, sans attendre qu'un groupe se forme."
          : a.level === "joue"
            ? "Une heure pour corriger ce qui résiste depuis des mois : le coach ne travaille que sur votre jeu."
            : "On cible vos points faibles avant la saison d'équipe, sans partager le temps de coaching.",
      note: "1h en solo · 70 € à deux · 7 j/7, horaire à convenir",
      href: "/cours-prives",
      hrefLabel: "Voir les cours privés",
    };
  }

  if (a.format === "ete") {
    return {
      eyebrow: "Stage d'été",
      title: "Formule courte et intensive",
      price: "dès 105 €",
      why: "Trois séances de 2h sur une même semaine, en soirée. On progresse vite quand on ne redescend pas entre deux cours.",
      note: "Juillet et août · terrain compris",
      href: "/stages-ete",
      hrefLabel: "Voir les stages",
    };
  }

  if (a.level === "interclubs") {
    return {
      eyebrow: "Été indien",
      title: "Préparation interclubs",
      price: "400 €",
      why: "Cinq cours pour arriver prêts à la saison d'équipe : schémas, placements et automatismes travaillés ensemble.",
      note: "Offre équipe · fin août à septembre",
      href: "/ete-indien",
      hrefLabel: "Voir l'été indien",
    };
  }

  return {
    eyebrow: "Cycle collectif adultes",
    title: a.level === "decouvre" ? "Cycle découverte" : "Cycle groupe de niveau",
    price: "dès 230 €",
    why:
      a.level === "decouvre"
        ? "Neuf séances d'1h30 pour installer les bases dans un groupe de débutants — personne ne joue mieux que vous."
        : "Neuf séances d'1h30 dans un groupe constitué à votre niveau, pour que chaque échange serve à quelque chose.",
    note: `9 séances de 1h30 · ${RENTREE.adultes.label.toLowerCase()} · le prix baisse quand le groupe se remplit`,
    href: "/cours-adultes",
    hrefLabel: "Voir les créneaux",
  };
}

const OPT_CLS =
  "card group flex flex-col items-start gap-1 p-5 text-left transition-colors hover:border-[rgba(200,168,75,0.55)] hover:bg-[var(--gold-tint)]";

function Option({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={OPT_CLS}>
      <span className="d text-xl leading-none transition-colors group-hover:text-[var(--gold-bright)]">
        {label}
      </span>
      <span className="text-sm text-[var(--ink-55)]">{hint}</span>
    </button>
  );
}

export function FormuleFinder() {
  const [a, setA] = useState<Answers>({});
  const result = resolve(a);

  const step = result
    ? 3
    : a.who === "adulte"
      ? a.level
        ? 2
        : 1
      : a.who === "enfant"
        ? a.age
          ? 2
          : 1
        : 0;

  const back = () => {
    setA((p) => {
      if (p.format || p.kidFormat) return { ...p, format: undefined, kidFormat: undefined };
      if (p.level || p.age) return { ...p, level: undefined, age: undefined };
      return {};
    });
  };

  return (
    <div className="card p-6 sm:p-10">
      <div className="flex items-center justify-between gap-4">
        <span className="eyebrow eyebrow--left">
          {result ? "Notre recommandation" : `Question ${step + 1} sur 3`}
        </span>
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1 w-8 rounded-[1px] transition-colors ${
                i <= step ? "bg-[var(--gold)]" : "bg-[var(--line-2)]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question 1 — pour qui ? */}
      {!a.who ? (
        <div className="mt-6">
          <h3 className="d text-3xl sm:text-4xl">C&apos;est pour qui ?</h3>
          <div className="scene mt-6 grid gap-3 sm:grid-cols-2">
            <Option
              label="Un adulte"
              hint="Vous, votre conjoint, un collègue"
              onClick={() => setA({ who: "adulte" })}
            />
            <Option
              label="Un enfant"
              hint="De 6 à 18 ans"
              onClick={() => setA({ who: "enfant" })}
            />
          </div>
        </div>
      ) : null}

      {/* Question 2 — adulte : niveau */}
      {a.who === "adulte" && !a.level ? (
        <div className="mt-6">
          <h3 className="d text-3xl sm:text-4xl">Où en êtes-vous ?</h3>
          <div className="scene mt-6 grid gap-3 sm:grid-cols-3">
            <Option
              label="Je découvre"
              hint="Jamais joué, ou seulement quelques fois"
              onClick={() => setA((p) => ({ ...p, level: "decouvre" }))}
            />
            <Option
              label="Je joue déjà"
              hint="Régulièrement, et je veux progresser"
              onClick={() => setA((p) => ({ ...p, level: "joue" }))}
            />
            <Option
              label="Je vise les interclubs"
              hint="Une équipe à préparer pour la saison"
              onClick={() => setA((p) => ({ ...p, level: "interclubs" }))}
            />
          </div>
        </div>
      ) : null}

      {/* Question 3 — adulte : format */}
      {a.who === "adulte" && a.level && !a.format ? (
        <div className="mt-6">
          <h3 className="d text-3xl sm:text-4xl">Vous préférez…</h3>
          <div className="scene mt-6 grid gap-3 sm:grid-cols-3">
            <Option
              label="Un groupe"
              hint="Un cycle sur plusieurs semaines"
              onClick={() => setA((p) => ({ ...p, format: "groupe" }))}
            />
            <Option
              label="Un coach pour moi"
              hint="Seul ou à deux, quand je veux"
              onClick={() => setA((p) => ({ ...p, format: "prive" }))}
            />
            <Option
              label="Une formule d'été"
              hint="Court et intensif, sur une semaine"
              onClick={() => setA((p) => ({ ...p, format: "ete" }))}
            />
          </div>
        </div>
      ) : null}

      {/* Question 2 — enfant : âge */}
      {a.who === "enfant" && !a.age ? (
        <div className="mt-6">
          <h3 className="d text-3xl sm:text-4xl">Quel âge a-t-il ?</h3>
          <div className="scene mt-6 grid gap-3 sm:grid-cols-3">
            {(
              [
                ["6-8", "6 – 8 ans", "Premiers pas, motricité et jeu"],
                ["9-12", "9 – 12 ans", "Bases techniques et coordination"],
                ["13-18", "13 – 18 ans", "Technique, tactique et compétition"],
              ] as [Age, string, string][]
            ).map(([v, label, hint]) => (
              <Option
                key={v}
                label={label}
                hint={hint}
                onClick={() => setA((p) => ({ ...p, age: v }))}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Question 3 — enfant : format */}
      {a.who === "enfant" && a.age && !a.kidFormat ? (
        <div className="mt-6">
          <h3 className="d text-3xl sm:text-4xl">Plutôt…</h3>
          <div className="scene mt-6 grid gap-3 sm:grid-cols-2">
            <Option
              label="En groupe"
              hint="Avec d'autres enfants de son âge, à l'année"
              onClick={() => setA((p) => ({ ...p, kidFormat: "groupe" }))}
            />
            <Option
              label="En individuel"
              hint="Un coach rien que pour lui"
              onClick={() => setA((p) => ({ ...p, kidFormat: "prive" }))}
            />
          </div>
        </div>
      ) : null}

      {/* Résultat */}
      {result ? (
        <div className="scene mt-6">
          <Tilt max={4}>
            <div className="card card--gold p-6 sm:p-8">
              <div className="pop">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                  {result.eyebrow}
                </span>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="d text-3xl sm:text-4xl">{result.title}</h3>
                  <span className="d text-3xl tabular-nums text-[var(--gold)]">
                    {result.price}
                  </span>
                </div>
                <p className="mt-3 max-w-2xl text-[var(--ink-55)]">
                  {result.why}
                </p>
                {result.note ? (
                  <p className="mt-2 text-xs text-[var(--ink-40)]">
                    {result.note}
                  </p>
                ) : null}
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/inscription" className="btn btn--gold">
                    Réserver ma place
                  </Link>
                  <Link href={result.href} className="btn btn--ghost">
                    {result.hrefLabel}
                  </Link>
                </div>
              </div>
            </div>
          </Tilt>
        </div>
      ) : null}

      {a.who ? (
        <div className="mt-6 flex gap-5">
          <button
            type="button"
            onClick={back}
            className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-40)] transition-colors hover:text-white"
          >
            ← Retour
          </button>
          <button
            type="button"
            onClick={() => setA({})}
            className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-40)] transition-colors hover:text-white"
          >
            Recommencer
          </button>
        </div>
      ) : null}
    </div>
  );
}
