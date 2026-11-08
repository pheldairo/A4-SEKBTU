import type { Room, Equipment } from "./types";

// Display labels for each equipment option, shown in FilterPanel and as chips.
export const EQUIPMENT_OPTIONS: { id: Equipment; label: string }[] = [
  { id: "projector", label: "Projector" },
  { id: "whiteboard", label: "Whiteboard" },
  { id: "video_conference", label: "Video Conference" },
  { id: "computers", label: "Computers" },
  { id: "smart_board", label: "Smart Board" },
];

// A single fictional campus room with fictional existing bookings.
// Times are minutes after midnight.
export const ROOM: Room = {
  id: "eng-204",
  name: "Engineering Hall 204",
  building: "Engineering Hall",
  capacity: 24,
  equipment: ["projector", "whiteboard"],
  blocked: false,
  bookings: [
    { start: 9 * 60, end: 10 * 60 + 30, label: "CS 101 Lecture" },
    { start: 11 * 60, end: 12 * 60, label: "Faculty Meeting" },
    { start: 14 * 60, end: 15 * 60 + 30, label: "Project Review" },
    { start: 16 * 60 + 30, end: 17 * 60 + 30, label: "Study Group" },
  ],
};

// Fictional campus room catalog. Each room carries its own equipment and
// bookings. Blocked rooms stay listed (F3) — checkAvailability rejects them.
export const ROOMS: Room[] = [
  ROOM,
  {
    id: "lib-110",
    name: "Library Study Room 110",
    building: "Main Library",
    capacity: 8,
    equipment: ["whiteboard"],
    blocked: true,
    blockedReason: "Closed for maintenance until further notice.",
    bookings: [],
  },
  {
    id: "sem-101",
    name: "Seminar Room 101",
    building: "Science Block",
    capacity: 16,
    equipment: ["projector", "whiteboard", "video_conference"],
    blocked: false,
    bookings: [{ start: 10 * 60, end: 11 * 60, label: "Research Sync" }],
  },
  {
    id: "lab-310",
    name: "Computer Lab 310",
    building: "Technology Wing",
    capacity: 30,
    equipment: ["projector", "computers"],
    blocked: false,
    bookings: [
      { start: 8 * 60, end: 9 * 60 + 30, label: "Intro Programming Lab" },
      { start: 13 * 60, end: 15 * 60, label: "Data Structures Workshop" },
    ],
  },
  {
    id: "hub-12",
    name: "Innovation Hub 12",
    building: "Student Center",
    capacity: 6,
    equipment: ["smart_board", "video_conference"],
    blocked: false,
    bookings: [{ start: 15 * 60, end: 16 * 60, label: "Startup Pitch Review" }],
  },
];
