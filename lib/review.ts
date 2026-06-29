/**
 * Ask for an App Store review at a genuinely good moment — after the player has
 * logged a few sessions (so they've felt the value). Native only, asked once;
 * Apple additionally throttles the real prompt to a few times per year.
 */
export async function maybeRequestReview(logCount: number) {
  if (logCount < 3) return;
  try {
    if (localStorage.getItem("armtrack-review-asked")) return;
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;
    const { InAppReview } = await import("@capacitor-community/in-app-review");
    await InAppReview.requestReview();
    localStorage.setItem("armtrack-review-asked", "1");
  } catch {
    /* plugin unavailable / not native — skip silently */
  }
}
