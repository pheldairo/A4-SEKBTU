// Assignment #04 - regression (AC1-AC5) and new feature (F1-F5) tests.
// Expected values come from the acceptance criteria, not from the code.
// Fixed clock: NOW = 540 (09:00). Every test works on a fresh deep copy of
// the fictional catalog, so no test can leak state into another.
import { describe, it, expect } from "vitest";
import { checkAvailability } from "./availability";
import { filterRooms, hasAllEquipment, meetsCapacity } from "./filters";
import { ROOMS } from "./data";
import type { Room } from "./types";

const NOW = 540;

function catalog(): Room[] {
  return JSON.parse(JSON.stringify(ROOMS)) as Room[];
}

function room(id: string): Room {
  const found = catalog().find((r) => r.id === id);
  if (!found) throw new Error(`fixture room ${id} missing`);
  return found;
}

const ids = (rooms: Room[]) => rooms.map((r) => r.id);

describe("Catalog shape", () => {
  it("C1: has at least four fictional rooms, each with id, name, capacity, equipment, blocked flag and own bookings", () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
    for (const r of ROOMS) {
      expect(typeof r.id).toBe("string");
      expect(typeof r.name).toBe("string");
      expect(Number.isInteger(r.capacity)).toBe(true);
      expect(Array.isArray(r.equipment)).toBe(true);
      expect(typeof r.blocked).toBe("boolean");
      expect(Array.isArray(r.bookings)).toBe(true);
    }
    expect(new Set(ids(ROOMS)).size).toBe(ROOMS.length); // ids are unique
    // bookings arrays are not shared between rooms
    expect(new Set(ROOMS.map((r) => r.bookings)).size).toBe(ROOMS.length);
  });
});

describe("Regression AC1-AC5 on catalog rooms (now = 09:00)", () => {
  it("R1 AC1: start equal to end is rejected as invalid_range", () => {
    expect(checkAvailability(room("hub-12"), { start: 700, end: 700, now: NOW })).toMatchObject({
      status: "unavailable",
      code: "invalid_range",
    });
  });

  it("R2 AC1: start equal to now is rejected, one minute later is available", () => {
    expect(checkAvailability(room("hub-12"), { start: 540, end: 600, now: NOW })).toMatchObject({
      status: "unavailable",
      code: "not_in_future",
    });
    expect(checkAvailability(room("hub-12"), { start: 541, end: 600, now: NOW })).toEqual({
      status: "available",
    });
  });

  it("R3 AC2 boundary: exactly 120 minutes is available, 121 minutes is rejected", () => {
    expect(checkAvailability(room("hub-12"), { start: 600, end: 720, now: NOW })).toEqual({
      status: "available",
    });
    expect(checkAvailability(room("hub-12"), { start: 600, end: 721, now: NOW })).toMatchObject({
      status: "unavailable",
      code: "duration_too_long",
    });
  });

  it("R4 AC3: the blocked library room is rejected even for a completely free slot", () => {
    expect(checkAvailability(room("lib-110"), { start: 600, end: 660, now: NOW })).toMatchObject({
      status: "unavailable",
      code: "room_blocked",
    });
  });

  it("R5 AC4 boundary: touching a booking is allowed, one minute of overlap is not", () => {
    const sem = room("sem-101"); // booking 10:00-11:00
    expect(checkAvailability(sem, { start: 660, end: 720, now: NOW })).toEqual({ status: "available" });
    expect(checkAvailability(sem, { start: 541, end: 600, now: NOW })).toEqual({ status: "available" });
    expect(checkAvailability(sem, { start: 659, end: 720, now: NOW })).toMatchObject({
      status: "unavailable",
      code: "overlaps_booking",
    });
    expect(checkAvailability(sem, { start: 570, end: 601, now: NOW })).toMatchObject({
      status: "unavailable",
      code: "overlaps_booking",
    });
  });

  it("R6 AC5: checking every room leaves the whole catalog unchanged (values and references)", () => {
    const snapshot = JSON.stringify(ROOMS);
    const bookingRefs = ROOMS.map((r) => r.bookings);
    for (const r of ROOMS) {
      checkAvailability(r, { start: 600, end: 660, now: NOW });
      checkAvailability(r, { start: 660, end: 720, now: NOW });
    }
    expect(JSON.stringify(ROOMS)).toBe(snapshot);
    ROOMS.forEach((r, i) => expect(r.bookings).toBe(bookingRefs[i]));
  });
});

describe("F1 capacity filter (capacity >= attendees)", () => {
  it("F1-a boundary: exact capacity matches, one more attendee does not", () => {
    const sem = room("sem-101"); // 16 seats
    expect(meetsCapacity(sem, 16)).toBe(true);
    expect(meetsCapacity(sem, 17)).toBe(false);
  });

  it("F1-b: filterRooms keeps only rooms that can seat the group, in catalog order", () => {
    expect(ids(filterRooms(catalog(), { attendees: 16, equipment: [] }))).toEqual([
      "eng-204",
      "sem-101",
      "lab-310",
    ]);
    expect(ids(filterRooms(catalog(), { attendees: 17, equipment: [] }))).toEqual([
      "eng-204",
      "lab-310",
    ]);
  });
});

describe("F2 equipment filter (room must contain ALL selected items)", () => {
  it("F2-a: one item matches every room that has it", () => {
    expect(ids(filterRooms(catalog(), { attendees: 1, equipment: ["projector"] }))).toEqual([
      "eng-204",
      "sem-101",
      "lab-310",
    ]);
  });

  it("F2-b: two items require both (ALL, not ANY)", () => {
    expect(
      ids(filterRooms(catalog(), { attendees: 1, equipment: ["projector", "video_conference"] })),
    ).toEqual(["sem-101"]);
    expect(hasAllEquipment(room("eng-204"), ["projector", "video_conference"])).toBe(false);
  });

  it("F2-c: no selected equipment matches every room", () => {
    expect(filterRooms(catalog(), { attendees: 1, equipment: [] })).toHaveLength(ROOMS.length);
  });

  it("F2-d: filtering never mutates the input array or the rooms", () => {
    const input = catalog();
    const before = JSON.stringify(input);
    const out = filterRooms(input, { attendees: 20, equipment: ["projector"] });
    expect(JSON.stringify(input)).toBe(before);
    expect(out).not.toBe(input);
  });
});

describe("F3 blocked room is never reported as available", () => {
  it("F3-a: the blocked room can appear in the filtered list but every valid slot is rejected", () => {
    const visible = filterRooms(catalog(), { attendees: 8, equipment: ["whiteboard"] });
    const blocked = visible.find((r) => r.blocked);
    expect(blocked?.id).toBe("lib-110");
    for (let start = 600; start <= 1320; start += 30) {
      expect(checkAvailability(blocked!, { start, end: start + 60, now: NOW }).status).toBe(
        "unavailable",
      );
    }
  });
});

describe("F4 empty result", () => {
  it("F4-a: requirements that no room satisfies return an empty list", () => {
    expect(filterRooms(catalog(), { attendees: 31, equipment: [] })).toEqual([]);
    expect(filterRooms(catalog(), { attendees: 7, equipment: ["smart_board"] })).toEqual([]);
    expect(filterRooms(catalog(), { attendees: 1, equipment: ["projector", "smart_board"] })).toEqual([]);
  });
});

describe("F5 the check uses the chosen room's own bookings", () => {
  it("F5-a: the same slot gives different answers for different rooms", () => {
    const slot = { start: 810, end: 870, now: NOW }; // 13:30-14:30
    expect(checkAvailability(room("eng-204"), slot)).toMatchObject({ code: "overlaps_booking" });
    expect(checkAvailability(room("lab-310"), slot)).toMatchObject({ code: "overlaps_booking" });
    expect(checkAvailability(room("sem-101"), slot)).toEqual({ status: "available" });
    expect(checkAvailability(room("hub-12"), slot)).toEqual({ status: "available" });
  });

  it("F5-b: the rejection reason names a booking of the chosen room only", () => {
    const res = checkAvailability(room("lab-310"), { start: 840, end: 900, now: NOW });
    expect(res).toMatchObject({ status: "unavailable", code: "overlaps_booking" });
    if (res.status === "unavailable") {
      expect(res.reason).toContain("Data Structures Workshop");
      expect(res.reason).not.toContain("Project Review"); // eng-204's booking at the same time
    }
  });
});
