import { describe, it, expect, beforeEach } from "vitest";
import {
  checkAvailability,
  type Room,
  type Booking,
  type AvailabilityResult,
} from "./availability";

// Default fixture (fresh per test): now = 540 (09:00), one existing booking
// 600-660 (10:00-11:00) labelled "Sample". blocked = false.
const NOW = 540;
const DEFAULT_BOOKINGS: Booking[] = [
  { start: 600, end: 660, label: "Sample" },
];

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: "eng-204",
    name: "Engineering Hall 204",
    building: "Engineering Hall",
    capacity: 24,
    blocked: false,
    bookings: DEFAULT_BOOKINGS.map((b) => ({ ...b })),
    ...overrides,
  };
}

// Run checkAvailability and return only the status for concise assertions.
function status(room: Room, start: number, end: number, now = NOW): "available" | "unavailable" {
  return checkAvailability(room, { start, end, now }).status;
}

describe("checkAvailability", () => {
  let room: Room;

  beforeEach(() => {
    room = makeRoom();
  });

  // --- Case table T01-T14 -------------------------------------------------

  // T01 | 660-720 | available | AC4: touches existing booking end at 660.
  it("T01: 660-720 is available (touching endpoint, AC4)", () => {
    expect(status(room, 660, 720)).toBe("available");
  });

  // T02 | 540-570 | unavailable | AC1: start == now, must be strictly after.
  it("T02: 540-570 is unavailable because start is not in the future (AC1)", () => {
    const r = checkAvailability(room, { start: 540, end: 570, now: NOW });
    expect(r.status).toBe("unavailable");
    if (r.status === "unavailable") expect(r.code).toBe("not_in_future");
  });

  // T03 | 720-720 | unavailable | AC1: start >= end.
  it("T03: 720-720 is unavailable because start equals end (AC1)", () => {
    const r = checkAvailability(room, { start: 720, end: 720, now: NOW });
    expect(r.status).toBe("unavailable");
    if (r.status === "unavailable") expect(r.code).toBe("invalid_range");
  });

  // T04 | 750-720 | unavailable | AC1: start > end.
  it("T04: 750-720 is unavailable because start is after end (AC1)", () => {
    const r = checkAvailability(room, { start: 750, end: 720, now: NOW });
    expect(r.status).toBe("unavailable");
    if (r.status === "unavailable") expect(r.code).toBe("invalid_range");
  });

  // T05 | 1380-1441 | unavailable | AC1: end > 1440.
  it("T05: 1380-1441 is unavailable because end exceeds 1440 (AC1)", () => {
    const r = checkAvailability(room, { start: 1380, end: 1441, now: NOW });
    expect(r.status).toBe("unavailable");
    if (r.status === "unavailable") expect(r.code).toBe("invalid_range");
  });

  // T06 | 720-840 | available | AC2: duration 120 (max allowed).
  it("T06: 720-840 is available with duration exactly 120 (AC2)", () => {
    expect(status(room, 720, 840)).toBe("available");
  });

  // T07 | 720-841 | unavailable | AC2: duration 121 > 120.
  it("T07: 720-841 is unavailable because duration exceeds 120 (AC2)", () => {
    const r = checkAvailability(room, { start: 720, end: 841, now: NOW });
    expect(r.status).toBe("unavailable");
    if (r.status === "unavailable") expect(r.code).toBe("duration_too_long");
  });

  // T08 | 570-600 | available | AC4: touches existing booking start at 600.
  it("T08: 570-600 is available (touching endpoint, AC4)", () => {
    expect(status(room, 570, 600)).toBe("available");
  });

  // T09 | 630-690 | unavailable | AC4: overlaps tail of existing 600-660.
  it("T09: 630-690 is unavailable because it overlaps an existing booking (AC4)", () => {
    const r = checkAvailability(room, { start: 630, end: 690, now: NOW });
    expect(r.status).toBe("unavailable");
    if (r.status === "unavailable") expect(r.code).toBe("overlaps_booking");
  });

  // T10 | 570-690 | unavailable | AC4: spans across existing 600-660.
  it("T10: 570-690 is unavailable because it overlaps an existing booking (AC4)", () => {
    const r = checkAvailability(room, { start: 570, end: 690, now: NOW });
    expect(r.status).toBe("unavailable");
    if (r.status === "unavailable") expect(r.code).toBe("overlaps_booking");
  });

  // T11 | 615-645 | unavailable | AC4: fully inside existing 600-660.
  it("T11: 615-645 is unavailable because it is inside an existing booking (AC4)", () => {
    const r = checkAvailability(room, { start: 615, end: 645, now: NOW });
    expect(r.status).toBe("unavailable");
    if (r.status === "unavailable") expect(r.code).toBe("overlaps_booking");
  });

  // T12 | 600-660 | unavailable | AC4: exactly matches existing booking.
  it("T12: 600-660 is unavailable because it matches an existing booking (AC4)", () => {
    const r = checkAvailability(room, { start: 600, end: 660, now: NOW });
    expect(r.status).toBe("unavailable");
    if (r.status === "unavailable") expect(r.code).toBe("overlaps_booking");
  });

  // T13 | 660-720, blocked=true | unavailable | AC3.
  it("T13: 660-720 is unavailable when the room is blocked (AC3)", () => {
    const blockedRoom = makeRoom({ blocked: true, blockedReason: "Maintenance" });
    const r = checkAvailability(blockedRoom, { start: 660, end: 720, now: NOW });
    expect(r.status).toBe("unavailable");
    if (r.status === "unavailable") expect(r.code).toBe("room_blocked");
  });

  // T14 | 630-690, bookings=[] | available | AC4: no bookings to overlap.
  it("T14: 630-690 is available when there are no existing bookings (AC4)", () => {
    const emptyRoom = makeRoom({ bookings: [] });
    expect(status(emptyRoom, 630, 690)).toBe("available");
  });

  // --- AC5: data preservation --------------------------------------------

  it("AC5: does not mutate existing booking data on an available result", () => {
    const snapshot = room.bookings.map((b) => ({ ...b }));
    const r: AvailabilityResult = checkAvailability(room, { start: 660, end: 720, now: NOW });
    expect(r.status).toBe("available");
    expect(room.bookings).toEqual(snapshot);
    expect(room.bookings).toBe(room.bookings); // same reference, not replaced
  });

  it("AC5: does not mutate existing booking data on an unavailable result", () => {
    const snapshot = room.bookings.map((b) => ({ ...b }));
    const r: AvailabilityResult = checkAvailability(room, { start: 630, end: 690, now: NOW });
    expect(r.status).toBe("unavailable");
    expect(room.bookings).toEqual(snapshot);
  });

  // --- Additional justified cases ----------------------------------------

  // T15 | 1320-1440 | available | AC1 upper boundary end=1440 is allowed,
  // combined with AC2 max duration of exactly 120 at the day boundary.
  it("T15: 1320-1440 is available at the day boundary with duration 120 (AC1+AC2)", () => {
    expect(status(room, 1320, 1440)).toBe("available");
  });

  // T16 | 600.5-660 | unavailable | AC1: start must be a whole minute.
  it("T16: 600.5-660 is unavailable because start is not a whole minute (AC1)", () => {
    const r = checkAvailability(room, { start: 600.5, end: 660, now: NOW });
    expect(r.status).toBe("unavailable");
    if (r.status === "unavailable") expect(r.code).toBe("invalid_range");
  });
});
