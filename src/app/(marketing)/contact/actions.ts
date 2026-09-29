"use server";

import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { contactMessageMail } from "@/lib/emails";
import { CONTACT_EMAIL, CONTACT_PHONE } from "./coordonnees";

export type ContactState = {
  error?: string;
  /** Vrai quand le message est parti : le formulaire cède la place au merci. */
  sent?: boolean;
  /**
   * Ce que le visiteur avait écrit. React réinitialise un formulaire non
   * contrôlé dès que l'action se termine : sans ça, une simple faute de frappe
   * dans l'adresse e-mail lui ferait tout retaper.
   */
  values?: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  };
};

function submitted(formData: FormData): ContactState["values"] {
  const get = (k: string) => String(formData.get(k) ?? "");
  return {
    name: get("name"),
    email: get("email"),
    phone: get("phone"),
    subject: get("subject"),
    message: get("message"),
  };
}

const schema = z.object({
  name: z.string().trim().min(2, "Merci d'indiquer votre nom.").max(120),
  email: z.string().trim().email("Adresse e-mail invalide."),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(1, "Choisissez un objet."),
  message: z
    .string()
    .trim()
    .min(10, "Votre message est un peu court.")
    .max(4000, "Votre message est trop long (4000 caractères maximum)."),
  /** Piège à robots : un champ caché qu'un humain ne remplit jamais. */
  website: z.string().max(0).optional(),
});

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website") || undefined,
  });

  if (!parsed.success) {
    // Le piège à robots ne mérite pas d'explication : on fait comme si tout
    // s'était bien passé plutôt que d'apprendre au robot à s'ajuster.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) {
      return { sent: true };
    }
    return {
      error: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
      values: submitted(formData),
    };
  }

  const { name, email, phone, subject, message } = parsed.data;
  const mail = contactMessageMail({ name, email, phone, subject, message });

  const result = await sendEmail({
    to: CONTACT_EMAIL,
    subject: mail.subject,
    html: mail.html,
    // Répondre à l'e-mail écrit directement au visiteur.
    replyTo: email,
  });

  if (!result.sent) {
    console.error("[contact] envoi impossible", result.error ?? result.skipped);
    return {
      error: `Votre message n'a pas pu être envoyé. Écrivez-nous directement à ${CONTACT_EMAIL} ou appelez le ${CONTACT_PHONE}.`,
      values: submitted(formData),
    };
  }

  return { sent: true };
}
