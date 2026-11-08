import type { Room } from "./availability";

// A single fictional campus room with fictional existing bookings.
// Times are minutes after midnight.
export const ROOM: Room = {
  id: "eng-204",
  name: "Engineering Hall 204",
  building: "Engineering Hall",
  capacity: 24,
  blocked: false,
  bookings: [
    { start: 9 * 60, end: 10 * 60 + 30, label: "CS 101 Lecture" },
    { start: 11 * 60, end: 12 * 60, label: "Faculty Meeting" },
    { start: 14 * 60, end: 15 * 60 + 30, label: "Project Review" },
    { start: 16 * 60 + 30, end: 17 * 60 + 30, label: "Study Group" },
  ],
};

// A second blocked room, selectable to demonstrate AC3.
export const ROOMS: Room[] = [
  ROOM,
  {
    id: "lib-110",
    name: "Library Study Room 110",
    building: "Main Library",
    capacity: 8,
    blocked: true,
    blockedReason: "Closed for maintenance until further notice.",
    bookings: [],
  },
  // Practice #07 manual UI fixture: one sample booking 10:00-11:00 (600-660),
  // matching the default unit-test fixture.
  {
    id: "sem-101",
    name: "Seminar Room 101 (test fixture)",
    building: "Science Block",
    capacity: 16,
    blocked: false,
    bookings: [{ start: 10 * 60, end: 11 * 60, label: "Sample booking" }],
  },
];
