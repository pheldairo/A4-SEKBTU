// Practice #08 regression tests for the two controlled defects.
// R-A*: BUG-A (touching endpoints wrongly treated as an overlap, AC4)
// R-B*: BUG-B (availability check modifies the original bookings array, AC5)
// Fixed clock (now = 540 = 09:00) and a fresh, NOT frozen fixture per test,
// so a mutation shows up as changed data instead of a thrown TypeError.
import { describe, it, expect } from "vitest";
import { checkAvailability, intervalsOverlap, type Booking, type Room } from "./availability";

const NOW = 540;

function freshRoom(bookings: Booking[]): Room {
  return {
    id: "reg-room",
    name: "Regression Room",
    building: "Test Building",
    capacity: 10,
    blocked: false,
    bookings: bookings.map((b) => ({ ...b })),
  };
}

const twoBookings = (): Booking[] => [
  { start: 600, end: 660, label: "Morning" },
  { start: 720, end: 780, label: "Noon" },
];

describe("BUG-A regression: touching endpoints are not conflicts (AC4)", () => {
  it("R-A1: intervalsOverlap(660, 720, 600, 660) is false (touches previous end)", () => {
    expect(intervalsOverlap(660, 720, 600, 660)).toBe(false);
  });
  it("R-A2: intervalsOverlap(540, 600, 600, 660) is false (touches next start)", () => {
    expect(intervalsOverlap(540, 600, 600, 660)).toBe(false);
  });
  it("R-A3: 660-720 filling the exact gap between two bookings is available", () => {
    const result = checkAvailability(freshRoom(twoBookings()), { start: 660, end: 720, now: NOW });
    expect(result).toEqual({ status: "available" });
  });
  it("R-A4: 659-720 (one minute into the first booking) is still rejected", () => {
    const result = checkAvailability(freshRoom(twoBookings()), { start: 659, end: 720, now: NOW });
    expect(result).toMatchObject({ status: "unavailable", code: "overlaps_booking" });
  });
});

describe("BUG-B regression: checking never changes booking data (AC5)", () => {
  it("R-B1: an available check keeps the same array length and contents", () => {
    const room = freshRoom(twoBookings());
    const before = JSON.parse(JSON.stringify(room.bookings));
    checkAvailability(room, { start: 660, end: 720, now: NOW });
    expect(room.bookings).toHaveLength(2);
    expect(room.bookings).toEqual(before);
  });
  it("R-B2: the same slot checked twice gives the same answer both times", () => {
    const room = freshRoom(twoBookings());
    const first = checkAvailability(room, { start: 660, end: 720, now: NOW });
    const second = checkAvailability(room, { start: 660, end: 720, now: NOW });
    expect(first).toEqual({ status: "available" });
    expect(second).toEqual(first);
  });
  it("R-B3: the bookings array reference and booking objects are not replaced", () => {
    const room = freshRoom(twoBookings());
    const ref = room.bookings;
    const first = room.bookings[0];
    checkAvailability(room, { start: 800, end: 860, now: NOW });
    expect(room.bookings).toBe(ref);
    expect(room.bookings[0]).toBe(first);
  });
});
