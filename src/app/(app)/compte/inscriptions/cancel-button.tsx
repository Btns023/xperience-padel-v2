"use client";

import { useState } from "react";
import { requestCancellation } from "./actions";
import { Button } from "@/components/ui/button";

export function CancelButton({
  registrationId,
  alreadyRequested,
}: {
  registrationId: string;
  alreadyRequested: boolean;
}) {
  const [done, setDone] = useState(alreadyRequested);
  const [pending, setPending] = useState(false);

  if (done) {
    return (
      <span className="text-sm text-muted-foreground">Annulation demandée</span>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await requestCancellation(registrationId);
          setDone(true);
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? "…" : "Demander l'annulation"}
    </Button>
  );
}
