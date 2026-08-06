"use client";

import { useTransition } from "react";
import { updateCallStatus } from "@/app/actions/entry";

const OUTCOMES = {
  "Connected": ["Interested to Buy vehicle", "Not interested", "Need more details", "TD Required", "DND"],
  "Not Connected": ["RNR", "Call me back", "Switch off", "Busy", "Number doesn't exist"],
};

export function CallStatusSelect({
  entryId,
  initialStatus,
  initialOutcome,
}: {
  entryId: string;
  initialStatus: string | null;
  initialOutcome: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value || null;
    startTransition(async () => {
      await updateCallStatus(entryId, newStatus, null);
    });
  };

  const handleOutcomeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOutcome = e.target.value || null;
    startTransition(async () => {
      await updateCallStatus(entryId, initialStatus, newOutcome);
    });
  };

  const availableOutcomes = initialStatus ? OUTCOMES[initialStatus as keyof typeof OUTCOMES] || [] : [];

  return (
    <div className="flex flex-col gap-1.5 min-w-[140px]" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <select
        value={initialStatus || ""}
        onChange={handleStatusChange}
        disabled={isPending}
        className="text-xs bg-white border border-[var(--gmart-border)] rounded px-1.5 py-1 outline-none focus:border-[var(--gmart-red)]"
      >
        <option value="">Status...</option>
        <option value="Connected">Connected</option>
        <option value="Not Connected">Not Connected</option>
      </select>

      {initialStatus && (
        <select
          value={initialOutcome || ""}
          onChange={handleOutcomeChange}
          disabled={isPending}
          className="text-xs bg-white border border-[var(--gmart-border)] rounded px-1.5 py-1 outline-none focus:border-[var(--gmart-red)]"
        >
          <option value="">Outcome...</option>
          {availableOutcomes.map((outcome) => (
            <option key={outcome} value={outcome}>
              {outcome}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
