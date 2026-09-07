"use client";

import { useFormStatus } from "react-dom";
import { markAttendance } from "./actions";
import { Button } from "@/components/ui/button";

function P({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="sm"
      variant={active ? "default" : "outline"}
      disabled={pending}
    >
      {label}
    </Button>
  );
}

export function AttendanceRow({
  sessionId,
  groupId,
  registrationId,
  name,
  present,
}: {
  sessionId: string;
  groupId: string;
  registrationId: string;
  name: string;
  present: boolean | null;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
      <span className="font-medium">{name}</span>
      <div className="flex items-center gap-2">
        <form
          action={markAttendance.bind(
            null,
            sessionId,
            groupId,
            registrationId,
            true,
          )}
        >
          <P label="Présent" active={present === true} />
        </form>
        <form
          action={markAttendance.bind(
            null,
            sessionId,
            groupId,
            registrationId,
            false,
          )}
        >
          <P label="Absent" active={present === false} />
        </form>
      </div>
    </li>
  );
}
