import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { AvailabilityResult } from "@/lib/availability";
import { formatTime } from "@/lib/availability";

interface ResultPanelProps {
  result: AvailabilityResult | null;
  requestStart: number | null;
  requestEnd: number | null;
}

export function ResultPanel({ result, requestStart, requestEnd }: ResultPanelProps) {
  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
        Enter a start and end time, then check availability.
      </div>
    );
  }

  const range =
    requestStart !== null && requestEnd !== null
      ? `${formatTime(requestStart)} – ${formatTime(requestEnd)}`
      : "";

  if (result.status === "available") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
      >
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
        <div>
          <p className="text-base font-semibold text-emerald-900">Available</p>
          <p className="mt-0.5 text-sm text-emerald-800">
            {range && (
              <>
                {range} is free to book.{" "}
                <span className="text-emerald-700">(Availability only — no booking is created.)</span>
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  const icon =
    result.code === "room_blocked" ? (
      <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" aria-hidden />
    ) : (
      <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" aria-hidden />
    );

  const tone =
    result.code === "room_blocked" || result.code === "overlaps_booking"
      ? "border-red-200 bg-red-50"
      : "border-amber-200 bg-amber-50";
  const titleTone =
    result.code === "room_blocked" || result.code === "overlaps_booking"
      ? "text-red-900"
      : "text-amber-900";
  const bodyTone =
    result.code === "room_blocked" || result.code === "overlaps_booking"
      ? "text-red-800"
      : "text-amber-800";

  return (
    <div role="alert" className={`flex items-start gap-3 rounded-2xl border p-5 ${tone}`}>
      {icon}
      <div>
        <p className={`text-base font-semibold ${titleTone}`}>Unavailable</p>
        <p className={`mt-0.5 text-sm ${bodyTone}`}>
          {range && <span className="font-medium">{range}: </span>}
          {result.reason}
        </p>
        {range && (
          <p className={`mt-1 inline-flex items-center gap-1 text-xs ${bodyTone} opacity-80`}>
            <Clock className="h-3 w-3" aria-hidden /> Availability check only.
          </p>
        )}
      </div>
    </div>
  );
}
