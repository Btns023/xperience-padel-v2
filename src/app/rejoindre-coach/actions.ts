"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type JoinState = { error?: string; message?: string };

/** Coach déjà connecté (bon e-mail) : rattache le compte. */
export async function acceptInvite(token: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_coach_invite", {
    p_token: token,
  });
  if (error) throw new Error(error.message);
  redirect("/coach");
}

const signupSchema = z.object({
  first_name: z.string().trim().min(1, "Prénom requis"),
  last_name: z.string().trim().min(1, "Nom requis"),
  password: z.string().min(8, "8 caractères minimum"),
});

/** Coach non connecté : crée le compte (e-mail de l'invitation) puis rattache. */
export async function joinAsCoach(
  token: string,
  email: string,
  _prev: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const parsed = signupSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
      },
    },
  });
  if (error) return { error: error.message };

  if (!data.session) {
    return {
      message:
        "Compte créé. Confirme ton e-mail, puis rouvre ce lien pour finaliser.",
    };
  }

  const { error: acceptErr } = await supabase.rpc("accept_coach_invite", {
    p_token: token,
  });
  if (acceptErr) return { error: acceptErr.message };

  redirect("/coach");
}
