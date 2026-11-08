import type {
  Booking,
  Room,
  CheckInput,
  AvailabilityResult,
  UnavailableCode,
} from "./types";
import { formatTime, formatRange, MINUTES_PER_DAY } from "./time";

// Re-export so every existing import from "./availability" still compiles.
export type { Booking, Room, CheckInput, AvailabilityResult, UnavailableCode };
export { formatTime, formatRange, parseTime, MINUTES_PER_DAY } from "./time";

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

function isInteger(value: number): boolean {
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
        reason: `Overlaps existing booking "${booking.label}" (${formatRange(booking.start, booking.end)}).`,
      };
    }
  }

  // AC5: available.
  return { status: "available" };
}
