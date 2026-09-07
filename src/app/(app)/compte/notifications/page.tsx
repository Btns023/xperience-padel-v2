import { getCurrentProfile } from "@/lib/auth";
import { NotifForm } from "./notif-form";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  const prefs = (profile?.notif_prefs ?? {}) as Record<string, boolean>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Choisis les e-mails que tu souhaites recevoir.
        </p>
      </div>
      <NotifForm prefs={prefs} />
    </div>
  );
}
