import { Capacitor } from "@capacitor/core";

// Legacy repeating reminder id (pre one-shot scheme) — always cancelled so
// users who updated don't get doubled notifications.
const LEGACY_REMINDER_ID = 1001;

// One-shot daily reminders for the next week. Re-armed on every app open and
// after every saved log, so a day that's already logged never fires a nag.
const DAILY_IDS = [1010, 1011, 1012, 1013, 1014, 1015, 1016];

// Late-evening "streak on the line" nudge — only armed when there's a real
// streak to lose.
const STREAK_SAVER_ID = 1020;
const STREAK_SAVER_MIN_STREAK = 3;

const REMINDER_HOUR = 18; // 6:00 pm
const SAVER_HOUR = 20; // 8:45 pm
const SAVER_MINUTE = 45;

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

function at(daysFromNow: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/**
 * Schedules (or refreshes) the arm-log reminders.
 *
 * - One reminder per day at 6pm for the next 7 days, as one-shots. When
 *   today's log is already saved (`loggedToday`), today's reminder is skipped
 *   entirely — a nag about something you already did teaches you to ignore
 *   (or disable) notifications.
 * - When a streak of 3+ is on the line, an extra 8:45pm "streak saver" fires
 *   on the first un-logged day.
 *
 * Safe to call on every app open and after every log save — it cancels and
 * re-arms everything.
 */
export async function scheduleArmLogReminder(streak = 0, loggedToday = false): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const { LocalNotifications } = await import("@capacitor/local-notifications");

  const permResult = await LocalNotifications.requestPermissions();
  if (permResult.display !== "granted") return;

  await LocalNotifications.cancel({
    notifications: [LEGACY_REMINDER_ID, ...DAILY_IDS, STREAK_SAVER_ID].map((id) => ({ id })),
  });

  const now = new Date();
  const todayStillNeedsLog = !loggedToday && now.getHours() < REMINDER_HOUR;
  const firstDay = todayStillNeedsLog ? 0 : 1;

  const notifications = DAILY_IDS.map((id, i) => {
    const day = firstDay + i;
    // Only the first reminder can speak to the live streak — beyond that the
    // streak state is unknowable at schedule time, so stay generic.
    const { title, body } = day === firstDay ? reminderCopy(streak) : reminderCopy(0);
    return {
      id,
      title,
      body,
      schedule: { at: at(day, REMINDER_HOUR), allowWhileIdle: true },
      iconColor: "#3B82F6",
    };
  });

  if (streak >= STREAK_SAVER_MIN_STREAK) {
    notifications.push({
      id: STREAK_SAVER_ID,
      title: `${streak}-day streak on the line 🚨`,
      body: "One 60-second log saves it. Tomorrow it's gone.",
      schedule: { at: at(firstDay, SAVER_HOUR, SAVER_MINUTE), allowWhileIdle: true },
      iconColor: "#3B82F6",
    });
  }

  await LocalNotifications.schedule({ notifications });
}
