// Local-timezone date helpers. Log dates are stored as the player's local
// YYYY-MM-DD, so every date computation must stay in local time — going
// through toISOString() shifts the date for users far from UTC.

/** Format a Date as YYYY-MM-DD in the user's local timezone. */
export function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Today's date as a local-time YYYY-MM-DD string. */
export function todayString(): string {
  return toLocalDateString(new Date());
}

/** Shift a YYYY-MM-DD string by n days, anchored at noon to dodge DST edges. */
export function shiftDay(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return toLocalDateString(d);
}

/** Local date string for the day `n` days before today (n=0 is today). */
export function daysAgoString(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalDateString(d);
}
