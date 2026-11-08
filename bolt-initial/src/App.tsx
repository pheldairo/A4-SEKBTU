import { useMemo, useState } from "react";
import { Building2, Search } from "lucide-react";
import { ROOMS } from "@/lib/data";
import {
  checkAvailability,
  formatTime,
  parseTime,
  type AvailabilityResult,
} from "@/lib/availability";
import { RoomCard } from "@/components/RoomCard";
import { Timeline } from "@/components/Timeline";
import { ResultPanel } from "@/components/ResultPanel";

// Practice #07 manual UI checks: optional fixed clock, e.g. ?now=09:00.
// Without the parameter the real clock is used (unchanged behaviour).
const FIXED_NOW = parseTime(
  new URLSearchParams(window.location.search).get("now") ?? "",
);

function nowMinutes(): number {
  if (FIXED_NOW !== null) return FIXED_NOW;
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export default function App() {
  const [roomIndex, setRoomIndex] = useState(0);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [checkedRange, setCheckedRange] = useState<{
    start: number | null;
    end: number | null;
  }>({ start: null, end: null });

  const [testBlocked, setTestBlocked] = useState(false);

  const baseRoom = ROOMS[roomIndex];
  // Test toggle for AC3: a shallow copy of the room marked as blocked.
  // The bookings array is shared by reference and never modified (AC5).
  const room =
    testBlocked && !baseRoom.blocked
      ? {
          ...baseRoom,
          blocked: true,
          blockedReason: "Blocked with the test toggle (Practice #07).",
        }
      : baseRoom;
  const nowLabel = useMemo(() => formatTime(nowMinutes()), []);

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    if (start === null || end === null) {
      setFieldError("Enter times as HH:MM (24-hour), e.g. 13:30.");
      setResult(null);
      setCheckedRange({ start: start ?? null, end: end ?? null });
      return;
    }
    setFieldError(null);
    const res = checkAvailability(room, { start, end, now: nowMinutes() });
    setResult(res);
    setCheckedRange({ start, end });
  }

  function handleRoomChange(idx: number) {
    setRoomIndex(idx);
    setResult(null);
    setCheckedRange({ start: null, end: null });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white">
            <Building2 className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight sm:text-lg">
              Smart Campus Room Availability Checker
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Check when a room is free. No booking is created.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Room selector */}
        <div className="mb-6">
          <label
            htmlFor="room-select"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Select a room
          </label>
          <select
            id="room-select"
            value={roomIndex}
            onChange={(e) => handleRoomChange(Number(e.target.value))}
            className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            {ROOMS.map((r, i) => (
              <option key={r.id} value={i}>
                {r.name}
                {r.blocked ? " (blocked)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <RoomCard room={room} />
            <Timeline roomIndex={roomIndex} />
          </div>

          <div className="space-y-6">
            <form
              onSubmit={handleCheck}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              noValidate
            >
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Check a time
                </h2>
                <span className="text-xs text-slate-400">Now: {nowLabel}</span>
              </div>
              <p className="mb-4 text-xs text-slate-500">
                Times are 24-hour (HH:MM). Max duration 120 minutes.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="start-time"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Start time
                  </label>
                  <input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="end-time"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    End time
                  </label>
                  <input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>
              </div>

              {fieldError && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {fieldError}
                </p>
              )}

              <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={testBlocked}
                  onChange={(e) => setTestBlocked(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Mark this room as blocked (test toggle)
              </label>

              <button
                type="submit"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 active:scale-[.99]"
              >
                <Search className="h-4 w-4" aria-hidden /> Check Availability
              </button>
            </form>

            <ResultPanel
              result={result}
              requestStart={checkedRange.start}
              requestEnd={checkedRange.end}
            />
          </div>
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
          Availability checking only — no bookings are created or stored.
        </footer>
      </main>
    </div>
  );
}
