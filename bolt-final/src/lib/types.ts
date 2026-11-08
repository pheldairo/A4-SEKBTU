export type Equipment =
  | "projector"
  | "whiteboard"
  | "video_conference"
  | "computers"
  | "smart_board";

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
  equipment?: Equipment[];
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
