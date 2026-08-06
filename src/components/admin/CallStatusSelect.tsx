"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { updateCallStatus } from "@/app/actions/entry";
import { ChevronDown, Loader2 } from "lucide-react";

const OUTCOMES = {
  "Connected": ["Interested to Buy vehicle", "Not interested", "Need more details", "TD Required", "DND"],
  "Not Connected": ["RNR", "Call me back", "Switch off", "Busy", "Number doesn't exist"],
};

function CustomSelect({
  value,
  options,
  placeholder,
  onChange,
  disabled
}: {
  value: string | null;
  options: string[];
  placeholder: string;
  onChange: (val: string) => void;
  disabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs bg-white border border-[var(--gmart-border)] rounded px-2 py-1.5 outline-none focus:border-[var(--gmart-red)] focus:ring-1 focus:ring-[var(--gmart-red)]/20 text-left disabled:opacity-50 transition-all"
      >
        <span className={value ? "text-[var(--gmart-title)] font-medium" : "text-[var(--gmart-muted)]"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-3 h-3 text-[var(--gmart-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--gmart-border)] rounded-md shadow-lg py-1 max-h-40 overflow-y-auto min-w-[120px]">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#fff5f6] transition-colors ${
                value === opt ? "bg-[#fff5f6] text-[var(--gmart-red)] font-semibold" : "text-[var(--gmart-title)]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      await updateCallStatus(entryId, newStatus, null);
    });
  };

  const handleOutcomeChange = (newOutcome: string) => {
    startTransition(async () => {
      await updateCallStatus(entryId, initialStatus, newOutcome);
    });
  };

  const availableOutcomes = initialStatus ? OUTCOMES[initialStatus as keyof typeof OUTCOMES] || [] : [];

  return (
    <div className="flex flex-col gap-1.5 min-w-[150px] relative">
      <CustomSelect
        value={initialStatus}
        options={["Connected", "Not Connected"]}
        placeholder="Select status..."
        onChange={handleStatusChange}
        disabled={isPending}
      />

      {initialStatus && (
        <CustomSelect
          value={initialOutcome}
          options={availableOutcomes}
          placeholder="Select outcome..."
          onChange={handleOutcomeChange}
          disabled={isPending}
        />
      )}
      
      {isPending && (
        <div className="absolute -left-5 top-2">
          <Loader2 className="w-3 h-3 animate-spin text-[var(--gmart-red)]" />
        </div>
      )}
    </div>
  );
}
