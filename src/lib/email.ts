import { Resend } from "resend";

const KEY = process.env.RESEND_API_KEY;
const FROM =
  process.env.EMAIL_FROM ?? "Xperience Padel <onboarding@resend.dev>";

/**
 * Adresse de réponse par défaut. Quel que soit l'expéditeur technique, une
 * réponse d'un client doit arriver dans une boîte que quelqu'un relève.
 */
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "info@padelxp.be";

const resend = KEY ? new Resend(KEY) : null;

export type SendResult = { sent: boolean; skipped?: string; error?: string };

/**
 * Envoi d'un e-mail. Si RESEND_API_KEY n'est pas défini (dev), l'envoi est
 * ignoré et loggé — l'application continue de fonctionner normalement.
 */
export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const to = (Array.isArray(opts.to) ? opts.to : [opts.to]).filter(Boolean);
  if (to.length === 0) return { sent: false, skipped: "aucun destinataire" };

  if (!resend) {
    console.info(`[email:dev] à ${to.join(", ")} — « ${opts.subject} »`);
    return { sent: false, skipped: "RESEND_API_KEY absent" };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo ?? REPLY_TO,
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : String(e) };
  }
}
