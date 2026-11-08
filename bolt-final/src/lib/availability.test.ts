// Improved suite (Practice #07, Task 05/06) for the real booking logic used by
// the page: checkAvailability(room, { start, end, now }) in ./availability.ts.
// Review changes vs. the first AI-generated suite are listed in the report.
//  - every case asserts the exact decision AND the exact rejection code
//    (no conditional `if (...) expect(...)` assertions)
//  - every case asserts that the booking data is unchanged (AC5)
//  - bookings are deep-frozen, so any in-place mutation throws
//  - fresh fixture per test, fixed clock (now = 540 = 09:00)
import { describe, it, expect } from "vitest";
import { checkAvailability, type Booking, type Room } from "./availability";
import { ROOMS } from "./data";

const NOW = 540; // 09:00, fixed - never the real clock

type Fixture = {
  start: number;
  end: number;
  now?: number;
  blocked?: boolean;
  bookings?: Booking[];
};

// Fresh, deep-frozen room for every call (no shared state between tests).
function makeRoom(blocked: boolean, bookings: Booking[]): Room {
  const frozen = bookings.map((b) => Object.freeze({ ...b }));
  return {
    id: "test-room",
    name: "Test Room",
    building: "Test Building",
    capacity: 10,
    blocked,
    bookings: Object.freeze(frozen) as Booking[],
  };
}

const defaultBookings = (): Booking[] => [{ start: 600, end: 660, label: "Sample" }];

// Arrange + Act + Assert data preservation. Returns the full result object.
function check(f: Fixture) {
  const room = makeRoom(f.blocked ?? false, f.bookings ?? defaultBookings());
  const before = JSON.stringify(room.bookings);
  const result = checkAvailability(room, { start: f.start, end: f.end, now: f.now ?? NOW });
  expect(JSON.stringify(room.bookings)).toBe(before); // AC5: unchanged data
  return result;
}

const AVAILABLE = { status: "available" };
const rejected = (code: string) => ({ status: "unavailable", code });

describe("Case table T01-T14 (expected results derived from AC1-AC4)", () => {
  it("T01 AC4: 660-720 touching the booking end is available", () => {
    expect(check({ start: 660, end: 720 })).toEqual(AVAILABLE);
  });
  it("T02 AC1: 540-570 starting exactly at now is unavailable", () => {
    expect(check({ start: 540, end: 570 })).toMatchObject(rejected("not_in_future"));
  });
  it("T03 AC1: 720-720 zero duration is unavailable", () => {
    expect(check({ start: 720, end: 720 })).toMatchObject(rejected("invalid_range"));
  });
  it("T04 AC1: 750-720 reversed range is unavailable", () => {
    expect(check({ start: 750, end: 720 })).toMatchObject(rejected("invalid_range"));
  });
  it("T05 AC1: 1380-1441 past the end of day is unavailable", () => {
    expect(check({ start: 1380, end: 1441 })).toMatchObject(rejected("invalid_range"));
  });
  it("T06 AC2: 720-840 exactly 120 minutes is available", () => {
    expect(check({ start: 720, end: 840 })).toEqual(AVAILABLE);
  });
  it("T07 AC2: 720-841 121 minutes is unavailable", () => {
    expect(check({ start: 720, end: 841 })).toMatchObject(rejected("duration_too_long"));
  });
  it("T08 AC4: 570-600 touching the booking start is available", () => {
    expect(check({ start: 570, end: 600 })).toEqual(AVAILABLE);
  });
  it("T09 AC4: 630-690 partial overlap is unavailable", () => {
    expect(check({ start: 630, end: 690 })).toMatchObject(rejected("overlaps_booking"));
  });
  it("T10 AC4: 570-690 containing the booking is unavailable", () => {
    expect(check({ start: 570, end: 690 })).toMatchObject(rejected("overlaps_booking"));
  });
  it("T11 AC4: 615-645 inside the booking is unavailable", () => {
    expect(check({ start: 615, end: 645 })).toMatchObject(rejected("overlaps_booking"));
  });
  it("T12 AC4: 600-660 identical interval is unavailable", () => {
    expect(check({ start: 600, end: 660 })).toMatchObject(rejected("overlaps_booking"));
  });
  it("T13 AC3: 660-720 in a blocked room is unavailable", () => {
    expect(check({ start: 660, end: 720, blocked: true })).toMatchObject(rejected("room_blocked"));
  });
  it("T14 AC4: 630-690 with no bookings is available", () => {
    expect(check({ start: 630, end: 690, bookings: [] })).toEqual(AVAILABLE);
  });
});

describe("AC5: clear result and booking data preservation", () => {
  it("AC5-a: repeated checks (available, overlap, blocked) leave bookings deep-equal to the original", () => {
    const original = defaultBookings();
    const room = makeRoom(false, original.map((b) => ({ ...b })));
    checkAvailability(room, { start: 660, end: 720, now: NOW });
    checkAvailability(room, { start: 630, end: 690, now: NOW });
    checkAvailability({ ...room, blocked: true }, { start: 660, end: 720, now: NOW });
    expect(room.bookings).toEqual(original);
    expect(room.bookings).toHaveLength(1);
  });
  it("AC5-b: an unavailable result always carries a non-empty human-readable reason", () => {
    const r = check({ start: 630, end: 690 });
    expect(r.status).toBe("unavailable");
    expect("reason" in r && r.reason.length > 0).toBe(true);
  });
  it("AC5-c: an available result is exactly { status: 'available' } (no ambiguous extra state)", () => {
    expect(check({ start: 700, end: 760 })).toStrictEqual({ status: "available" });
  });
});

describe("Additional justified cases", () => {
  // Pairs with T02: start == now is rejected, start == now + 1 must be accepted.
  // Detects an off-by-one such as start <= now + 1.
  it("T15 AC1: 541-600 starting one minute after now is available", () => {
    expect(check({ start: 541, end: 600 })).toEqual(AVAILABLE);
  });
  // Upper inclusive day boundary (end == 1440) combined with the 120-minute limit.
  // Detects end >= 1440 instead of end > 1440.
  it("T16 AC1+AC2: 1320-1440 ending exactly at midnight with 120 minutes is available", () => {
    expect(check({ start: 1320, end: 1440 })).toEqual(AVAILABLE);
  });
  // Only the SECOND booking overlaps. Detects a loop that checks just bookings[0]
  // or returns early after the first non-overlapping booking.
  it("T17 AC4: 930-990 overlapping the second of two bookings is unavailable", () => {
    const bookings = [
      { start: 600, end: 660, label: "Sample" },
      { start: 900, end: 960, label: "Second" },
    ];
    expect(check({ start: 930, end: 990, bookings })).toMatchObject(rejected("overlaps_booking"));
  });
  // AC1 "whole minutes": fractional input must be rejected, not rounded.
  it("T18 AC1: 600.5-660 with a fractional start is unavailable", () => {
    expect(check({ start: 600.5, end: 660 })).toMatchObject(rejected("invalid_range"));
  });
  // Integration with the real data module used by the page: the blocked room in
  // ROOMS is rejected and the sample room's bookings are not changed by checks.
  it("T19 AC3+AC5 (integration): page data - blocked ROOMS[1] is rejected, ROOMS[0] bookings unchanged", () => {
    const before = JSON.stringify(ROOMS[0].bookings);
    const blocked = ROOMS.find((r) => r.blocked)!;
    expect(checkAvailability(blocked, { start: 1320, end: 1380, now: NOW })).toMatchObject(
      rejected("room_blocked"),
    );
    checkAvailability(ROOMS[0], { start: 600, end: 660, now: NOW });
    expect(JSON.stringify(ROOMS[0].bookings)).toBe(before);
  });
});
