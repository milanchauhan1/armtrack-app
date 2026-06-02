import { Capacitor } from "@capacitor/core";

const REMINDER_ID = 1001;

export async function scheduleArmLogReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const { LocalNotifications } = await import("@capacitor/local-notifications");

  const permResult = await LocalNotifications.requestPermissions();
  if (permResult.display !== "granted") return;

  // Cancel any existing reminder before re-scheduling to avoid duplicates
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });

  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: "Log your arm today 💪",
        body: "Takes 60 seconds. Know if your arm is ready.",
        schedule: {
          on: { hour: 18, minute: 0 },
          repeats: true,
          allowWhileIdle: true,
        },
        iconColor: "#3B82F6",
      },
    ],
  });
}
