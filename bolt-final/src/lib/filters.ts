import type { Room, Equipment } from "./types";

// F1: a room meets the capacity requirement when it can hold at least the
// requested number of attendees (inclusive — exactly equal is acceptable).
export function meetsCapacity(room: Room, attendees: number): boolean {
  return room.capacity >= attendees;
}

// F2: a room matches the equipment requirement only when it contains ALL of
// the required items. An empty required list matches every room.
export function hasAllEquipment(room: Room, required: Equipment[]): boolean {
  const available = room.equipment ?? [];
  return required.every((item) => available.includes(item));
}

export interface FilterCriteria {
  attendees: number;
  equipment: Equipment[];
}

// Returns matching rooms in catalog order. Never mutates the input array.
// Blocked rooms are NOT hidden here — they stay listed with a badge and are
// rejected by checkAvailability (F3, one rule in one place).
export function filterRooms(rooms: Room[], criteria: FilterCriteria): Room[] {
  return rooms.filter(
    (room) =>
      meetsCapacity(room, criteria.attendees) &&
      hasAllEquipment(room, criteria.equipment),
  );
}
