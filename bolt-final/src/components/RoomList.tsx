import { Lock, Users, MapPin } from "lucide-react";
import type { Room } from "@/lib/types";
import { EQUIPMENT_OPTIONS } from "@/lib/data";

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelect: (id: string) => void;
  onClearFilters: () => void;
}

export function RoomList({
  rooms,
  selectedRoomId,
  onSelect,
  onClearFilters,
}: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
        <p className="text-sm font-medium text-slate-700">
          No rooms match these requirements
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Try lowering the attendee count or removing equipment filters.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-3 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">
        Matching rooms
      </h2>
      <ul className="space-y-2">
        {rooms.map((room) => {
          const selected = room.id === selectedRoomId;
          return (
            <li key={room.id}>
              <button
                type="button"
                onClick={() => onSelect(room.id)}
                aria-pressed={selected}
                className={`w-full rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-200 ${
                  selected
                    ? "border-sky-500 bg-sky-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {room.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden /> {room.building}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" aria-hidden /> {room.capacity}
                      </span>
                    </div>
                  </div>
                  {room.blocked && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-200">
                      <Lock className="h-3 w-3" aria-hidden /> Blocked
                    </span>
                  )}
                </div>
                {(room.equipment ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(room.equipment ?? []).map((eq) => {
                      const label =
                        EQUIPMENT_OPTIONS.find((o) => o.id === eq)?.label ?? eq;
                      return (
                        <span
                          key={eq}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
