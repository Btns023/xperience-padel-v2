"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { homePathForRole } from "@/lib/auth";
import type { AppRole } from "@/lib/types";

export type AuthState = { error?: string; message?: string };

const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

// --- Connexion ------------------------------------------------------------
const signInSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-mail ou mot de passe incorrect." };
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .single();

  redirect(homePathForRole((data?.role as AppRole) ?? "client"));
}

// --- Inscription --------------------------------------------------------
const signUpSchema = z
  .object({
    first_name: z.string().min(1, "Prénom requis"),
    last_name: z.string().min(1, "Nom requis"),
    phone: z.string().min(6, "Téléphone requis"),
    email: z.string().email("Adresse e-mail invalide"),
    password: z.string().min(8, "8 caractères minimum"),
  })
  .strict();

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const { email, password, first_name, last_name, phone } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/confirm`,
      data: { first_name, last_name, phone },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Si la confirmation d'e-mail est désactivée (dev), une session est déjà
  // ouverte : on entre directement dans l'espace.
  if (data.session) {
    redirect("/compte");
  }

  return {
    message:
      "Compte créé. Vérifie ta boîte mail : un lien d'activation vient de t'être envoyé.",
  };
}

// --- Déconnexion -------------------------------------------------------
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
