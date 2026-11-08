import type { Room } from "@/lib/types";
import { formatRange } from "@/lib/time";

// Visual timeline of the day (00:00–24:00) showing existing bookings.
// Purely informational; does not affect the check logic.
export function Timeline({ room }: { room: Room }) {

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Today's schedule</h3>
        <span className="text-xs text-slate-400">00:00 — 24:00</span>
      </div>

      <div className="mt-3">
        <div className="relative h-10 w-full overflow-hidden rounded-lg bg-slate-100">
          {room.bookings.map((b) => {
            const leftPct = (b.start / 1440) * 100;
            const widthPct = ((b.end - b.start) / 1440) * 100;
            return (
              <div
                key={`${b.start}-${b.end}`}
                className="absolute top-0 h-full bg-sky-500/85"
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                title={`${b.label}: ${formatRange(b.start, b.end)}`}
              />
            );
          })}
        </div>

        <div className="mt-1 flex justify-between text-[10px] tabular-nums text-slate-400">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>

      {room.bookings.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {room.bookings.map((b) => (
            <span key={`${b.start}-${b.end}`} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" aria-hidden />
              {b.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
