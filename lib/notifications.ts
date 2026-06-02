import { Capacitor } from "@capacitor/core";

const REMINDER_ID = 1001;

/** Builds the daily reminder copy, leaning on the active streak to drive loss aversion. */
function reminderCopy(streak: number): { title: string; body: string } {
  if (streak >= 2) {
    return {
      title: `Keep your ${streak}-day streak alive 🔥`,
      body: "A 60-second log keeps the streak going. Don't break the chain.",
    };
  }
  if (streak === 1) {
    return {
      title: "Make it two days in a row 🔥",
      body: "You logged yesterday — keep the momentum going with today's log.",
    };
  }
  return {
    title: "Log your arm today 💪",
    body: "Takes 60 seconds. Know if your arm is ready — and start a streak.",
  };
}

/**
 * Schedules (or refreshes) the daily 6pm arm-log reminder.
 * Pass the current streak so the copy reflects what the user has to lose.
 * Safe to call on every app open — it cancels and re-arms the single reminder.
 */
export async function scheduleArmLogReminder(streak = 0): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const { LocalNotifications } = await import("@capacitor/local-notifications");

  const permResult = await LocalNotifications.requestPermissions();
  if (permResult.display !== "granted") return;

  // Cancel any existing reminder before re-scheduling to avoid duplicates
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });

  const { title, body } = reminderCopy(streak);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title,
        body,
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
