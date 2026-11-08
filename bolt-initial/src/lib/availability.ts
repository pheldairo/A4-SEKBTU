// Availability logic for the Smart Campus Room Availability Checker.
// Times are represented as integer minutes after midnight (0..1440).
// All functions are pure: they never mutate the provided bookings.

export interface Booking {
  start: number; // minutes after midnight, inclusive
  end: number;   // minutes after midnight, exclusive
  label: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  blockedReason?: string;
  bookings: Booking[];
}

export interface CheckInput {
  start: number;
  end: number;
  now: number; // minutes after midnight
}

export type AvailabilityResult =
  | { status: "available" }
  | { status: "unavailable"; reason: string; code: UnavailableCode };

export type UnavailableCode =
  | "room_blocked"
  | "invalid_range"
  | "not_in_future"
  | "duration_too_long"
  | "overlaps_booking";

export const MINUTES_PER_DAY = 1440;
export const MAX_DURATION_MINUTES = 120;

// Intervals touching at an endpoint do NOT overlap.
// Overlap requires a shared span of strictly positive length.
export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

// Validates the raw candidate input and room state, returning a clear result.
// Follows AC1-AC5. Does not mutate bookings.
export function checkAvailability(
  room: Room,
  input: CheckInput,
): AvailabilityResult {
  const { start, end, now } = input;

  // AC1: integer minutes after midnight.
  if (!isInteger(start) || !isInteger(end) || !isInteger(now)) {
    return {
      status: "unavailable",
      code: "invalid_range",
      reason: "Start and end times must be whole minutes.",
    };
  }

  // AC1: 0 <= start < end <= 1440.
  if (start < 0 || end > MINUTES_PER_DAY || start >= end) {
    return {
      status: "unavailable",
      code: "invalid_range",
      reason:
        "Start must be earlier than end, and both must fall between 00:00 and 24:00.",
    };
  }

  // AC1: start must be strictly greater than now.
  if (start <= now) {
    return {
      status: "unavailable",
      code: "not_in_future",
      reason: "Start time must be in the future.",
    };
  }

  // AC2: duration must not exceed 120 minutes (120 is permitted).
  const duration = end - start;
  if (duration > MAX_DURATION_MINUTES) {
    return {
      status: "unavailable",
      code: "duration_too_long",
      reason: `Duration is ${duration} minutes. Maximum allowed is ${MAX_DURATION_MINUTES} minutes.`,
    };
  }

  // AC3: reject when the room is blocked.
  if (room.blocked) {
    return {
      status: "unavailable",
      code: "room_blocked",
      reason: room.blockedReason ?? "This room is currently blocked for booking.",
    };
  }

  // AC4: reject overlap with any existing booking (touching endpoints allowed).
  for (const booking of room.bookings) {
    if (intervalsOverlap(start, end, booking.start, booking.end)) {
      return {
        status: "unavailable",
        code: "overlaps_booking",
        reason: `Overlaps existing booking "${booking.label}" (${formatTime(booking.start)}–${formatTime(booking.end)}).`,
      };
    }
  }

  // AC5: available.
  return { status: "available" };
}

// Format minutes-after-midnight as HH:MM (24-hour).
export function formatTime(minutes: number): string {
  const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
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
