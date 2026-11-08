import { Clock, MapPin, Users, Lock } from "lucide-react";
import type { Room } from "@/lib/availability";
import { formatTime } from "@/lib/availability";

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{room.name}</h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden /> {room.building}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden /> {room.capacity} seats
            </span>
          </div>
        </div>
        {room.blocked ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
            <Lock className="h-3.5 w-3.5" aria-hidden /> Blocked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <Clock className="h-3.5 w-3.5" aria-hidden /> Open today
          </span>
        )}
      </div>

      {room.blocked && room.blockedReason && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {room.blockedReason}
        </p>
      )}

      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Existing bookings today
        </h3>
        {room.bookings.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No bookings scheduled.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {room.bookings.map((b) => (
              <li
                key={`${b.start}-${b.end}`}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-700">{b.label}</span>
                <span className="tabular-nums text-slate-500">
                  {formatTime(b.start)} – {formatTime(b.end)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
