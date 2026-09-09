"use client";

import { Button } from "@/components/ui/button";
import { confirmCancellation, dismissCancellation } from "./actions";

export function CancellationActions({
  registrationId,
  slotId,
}: {
  registrationId: string;
  slotId?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        CGV art. 6 — préavis de 48 h avant le cours.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <form
          action={confirmCancellation.bind(null, registrationId, false, slotId)}
        >
          <Button type="submit" variant="destructive" size="sm">
            Dans les délais — rembourser
          </Button>
        </form>
        <form
          action={confirmCancellation.bind(null, registrationId, true, slotId)}
        >
          <Button type="submit" variant="outline" size="sm">
            Tardive — montant dû
          </Button>
        </form>
        <form action={dismissCancellation.bind(null, registrationId, slotId)}>
          <button
            type="submit"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Ignorer
          </button>
        </form>
      </div>
    </div>
  );
}
