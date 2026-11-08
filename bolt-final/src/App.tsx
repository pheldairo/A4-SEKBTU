import { useMemo, useState } from "react";
import { Building2, Search } from "lucide-react";
import { ROOMS } from "@/lib/data";
import {
  checkAvailability,
  parseTime,
  type AvailabilityResult,
} from "@/lib/availability";
import { formatTime } from "@/lib/time";
import { nowMinutes } from "@/lib/clock";
import { filterRooms, type FilterCriteria } from "@/lib/filters";
import type { Equipment } from "@/lib/types";
import { RoomCard } from "@/components/RoomCard";
import { Timeline } from "@/components/Timeline";
import { ResultPanel } from "@/components/ResultPanel";
import { FilterPanel } from "@/components/FilterPanel";
import { RoomList } from "@/components/RoomList";

interface AppProps {
  now?: number;
}

export default function App({ now }: AppProps = {}) {
  const [attendees, setAttendees] = useState(1);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(ROOMS[0].id);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [checkedRange, setCheckedRange] = useState<{
    start: number | null;
    end: number | null;
  }>({ start: null, end: null });

  const currentNow = now ?? nowMinutes();

  const criteria: FilterCriteria = { attendees, equipment };
  const visibleRooms = useMemo(() => filterRooms(ROOMS, criteria), [attendees, equipment]);

  const room = selectedRoomId
    ? ROOMS.find((r) => r.id === selectedRoomId) ?? null
    : null;

  const nowLabel = useMemo(() => formatTime(currentNow), [currentNow]);

  function clearResult() {
    setResult(null);
    setCheckedRange({ start: null, end: null });
  }

  // F5: when the filters change, commit the new selection to state so a room
  // hidden by a filter does not silently reappear when the filter is relaxed.
  function resyncSelection(next: FilterCriteria) {
    const nextRooms = filterRooms(ROOMS, next);
    setSelectedRoomId((prev) =>
      nextRooms.some((r) => r.id === prev) ? prev : nextRooms[0]?.id ?? null,
    );
    clearResult();
  }

  function handleSelectRoom(id: string) {
    setSelectedRoomId(id);
    clearResult();
  }

  function handleAttendeesChange(value: number) {
    setAttendees(value);
    resyncSelection({ attendees: value, equipment });
  }

  function toggleEquipment(value: Equipment) {
    const nextEquipment = equipment.includes(value)
      ? equipment.filter((e) => e !== value)
      : [...equipment, value];
    setEquipment(nextEquipment);
    resyncSelection({ attendees, equipment: nextEquipment });
  }

  function clearFilters() {
    const next: FilterCriteria = { attendees: 1, equipment: [] };
    setAttendees(1);
    setEquipment([]);
    resyncSelection(next);
  }

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!room) return;
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    if (start === null || end === null) {
      setFieldError("Enter times as HH:MM (24-hour), e.g. 13:30.");
      setResult(null);
      setCheckedRange({ start: start ?? null, end: end ?? null });
      return;
    }
    setFieldError(null);
    const res = checkAvailability(room, { start, end, now: currentNow });
    setResult(res);
    setCheckedRange({ start, end });
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
        <div className="mb-6">
          <FilterPanel
            attendees={attendees}
            equipment={equipment}
            onAttendeesChange={handleAttendeesChange}
            onEquipmentChange={toggleEquipment}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <RoomList
              rooms={visibleRooms}
              selectedRoomId={selectedRoomId}
              onSelect={handleSelectRoom}
              onClearFilters={clearFilters}
            />
            {room && <RoomCard room={room} />}
            {room && <Timeline room={room} />}
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

              <button
                type="submit"
                disabled={!room}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 active:scale-[.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:bg-slate-300"
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
