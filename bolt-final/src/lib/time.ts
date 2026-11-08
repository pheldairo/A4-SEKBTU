export const MINUTES_PER_DAY = 1440;

// Format minutes-after-midnight as HH:MM (24-hour).
export function formatTime(minutes: number): string {
  const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

// Format an interval as "HH:MM–HH:MM" (en dash, no spaces).
export function formatRange(start: number, end: number): string {
  return `${formatTime(start)}\u2013${formatTime(end)}`;
}

// Parse "HH:MM" into minutes after midnight, or null if invalid.
export function parseTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const min = Number(match[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}
