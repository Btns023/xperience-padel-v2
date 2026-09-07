"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { runDunningNow } from "@/app/(app)/admin/factures/payment-actions";

function Inner() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "…" : "Lancer les relances éligibles"}
    </Button>
  );
}

export function RunDunningButton() {
  return (
    <form action={runDunningNow}>
      <Inner />
    </form>
  );
}
