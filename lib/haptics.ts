// Safe haptic helpers — no-op on web, fire native taptic engine in the app.
// All calls are fire-and-forget and never throw.

import { Capacitor } from "@capacitor/core";

type Style = "light" | "medium" | "heavy";

async function impact(style: Style) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    const map = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    } as const;
    await Haptics.impact({ style: map[style] });
  } catch {
    /* non-fatal */
  }
}

/** Light tick — selections, slider steps, tab switches. */
export function tapLight() {
  void impact("light");
}

/** Medium tap — primary button presses. */
export function tapMedium() {
  void impact("medium");
}

/** Success buzz — log saved, milestone hit. */
export async function notifySuccess() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    /* non-fatal */
  }
}
