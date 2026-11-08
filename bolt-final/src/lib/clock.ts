import { parseTime } from "./time";

// Optional fixed clock for manual UI checks, e.g. ?now=09:00.
// Without the parameter the real clock is used (unchanged behaviour).
const FIXED_NOW = parseTime(
  new URLSearchParams(window.location.search).get("now") ?? "",
);

export function nowMinutes(): number {
  if (FIXED_NOW !== null) return FIXED_NOW;
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
