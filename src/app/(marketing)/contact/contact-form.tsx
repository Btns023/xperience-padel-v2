"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendContactMessage, type ContactState } from "./actions";

const SUJETS = [
  "Inscription à un cycle",
  "Cours pour mon enfant",
  "Cours privé",
  "Stage ou préparation interclubs",
  "Une facture ou un paiement",
  "Sponsoring / partenariat",
  "Autre",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--gold" disabled={pending}>
      {pending ? "Envoi…" : "Envoyer le message"}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState<ContactState, FormData>(
    sendContactMessage,
    {},
  );

  if (state.sent) {
    return (
      <div className="card card--gold p-6 sm:p-8">
        <div className="pop">
          <h3 className="d text-2xl sm:text-3xl">
            Message <span className="gold">bien reçu</span>
          </h3>
          <p className="mt-3 text-[var(--ink-55)]">
            Merci — nous vous répondons en général dans les 48 heures, sur
            l&apos;adresse que vous venez d&apos;indiquer. Si c&apos;est urgent,
            appelez-nous plutôt : le téléphone est toujours plus rapide.
          </p>
        </div>
      </div>
    );
  }

  // React réinitialise le formulaire sur les valeurs par défaut dès que
  // l'action rend la main : on lui redonne ce que le visiteur avait écrit.
  const v = state.values;

  return (
    <form action={formAction} className="card p-6 sm:p-8">
      {/* Piège à robots : masqué aux humains et aux lecteurs d'écran. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Ne remplissez pas ce champ</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            Votre nom
          </label>
          <input
            id="name"
            name="name"
            className="field"
            autoComplete="name"
            required
            maxLength={120}
            placeholder="Prénom et nom"
            defaultValue={v?.name ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Votre e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="field"
            autoComplete="email"
            required
            placeholder="vous@exemple.be"
            defaultValue={v?.email ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Téléphone <span className="normal-case tracking-normal">(facultatif)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="field"
            autoComplete="tel"
            maxLength={40}
            placeholder="0470 00 00 00"
            defaultValue={v?.phone ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="subject">
            Objet
          </label>
          <select
            id="subject"
            name="subject"
            className="field"
            defaultValue={v?.subject || SUJETS[0]}
          >
            {SUJETS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label className="label" htmlFor="message">
          Votre message
        </label>
        <textarea
          id="message"
          name="message"
          className="field"
          rows={6}
          required
          minLength={10}
          maxLength={4000}
          placeholder="Votre niveau, vos disponibilités, l'âge de votre enfant… tout ce qui nous aidera à vous répondre précisément."
          defaultValue={v?.message ?? ""}
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="mt-4 rounded-[3px] border border-[rgba(220,80,80,0.45)] bg-[rgba(220,80,80,0.1)] px-4 py-3 text-sm text-[#ffb4b4]"
        >
          {state.error}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <SubmitButton />
        <span className="text-xs text-[var(--ink-40)]">
          Vos coordonnées servent uniquement à vous répondre.
        </span>
      </div>
    </form>
  );
}
