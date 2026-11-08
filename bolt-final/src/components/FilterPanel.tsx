import type { Equipment } from "@/lib/types";
import { EQUIPMENT_OPTIONS } from "@/lib/data";

interface FilterPanelProps {
  attendees: number;
  equipment: Equipment[];
  onAttendeesChange: (value: number) => void;
  onEquipmentChange: (value: Equipment) => void;
}

export function FilterPanel({
  attendees,
  equipment,
  onAttendeesChange,
  onEquipmentChange,
}: FilterPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Filter rooms</h2>
      <p className="mb-4 text-xs text-slate-500">
        Narrow the list by capacity and equipment.
      </p>

      <div className="mb-4">
        <label
          htmlFor="attendees"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Attendees
        </label>
        <input
          id="attendees"
          type="number"
          min={1}
          value={attendees}
          onChange={(e) => onAttendeesChange(Math.max(1, Number(e.target.value)))}
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Equipment
        </span>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {EQUIPMENT_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="inline-flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={equipment.includes(opt.id)}
                onChange={() => onEquipmentChange(opt.id)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-300"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
