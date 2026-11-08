import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { AvailabilityResult } from "@/lib/types";
import { formatRange } from "@/lib/time";

interface ResultPanelProps {
  result: AvailabilityResult | null;
  requestStart: number | null;
  requestEnd: number | null;
}

const SEVERITY: Record<"error" | "warn", {
  tone: string;
  titleTone: string;
  bodyTone: string;
  icon: typeof XCircle;
  iconClass: string;
}> = {
  error: {
    tone: "border-red-200 bg-red-50",
    titleTone: "text-red-900",
    bodyTone: "text-red-800",
    icon: XCircle,
    iconClass: "text-red-600",
  },
  warn: {
    tone: "border-amber-200 bg-amber-50",
    titleTone: "text-amber-900",
    bodyTone: "text-amber-800",
    icon: AlertCircle,
    iconClass: "text-amber-600",
  },
};

const ERROR_CODES = new Set(["room_blocked", "overlaps_booking"]);

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
      ? formatRange(requestStart, requestEnd)
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

  const severity = ERROR_CODES.has(result.code) ? SEVERITY.error : SEVERITY.warn;
  const Icon = severity.icon;

  return (
    <div role="alert" className={`flex items-start gap-3 rounded-2xl border p-5 ${severity.tone}`}>
      <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${severity.iconClass}`} aria-hidden />
      <div>
        <p className={`text-base font-semibold ${severity.titleTone}`}>Unavailable</p>
        <p className={`mt-0.5 text-sm ${severity.bodyTone}`}>
          {range && <span className="font-medium">{range}: </span>}
          {result.reason}
        </p>
        {range && (
          <p className={`mt-1 inline-flex items-center gap-1 text-xs ${severity.bodyTone} opacity-80`}>
            <Clock className="h-3 w-3" aria-hidden /> Availability check only.
          </p>
        )}
      </div>
    </div>
  );
}
