"use client";

import { useState, useRef, useEffect } from "react";
import { updateCallStatus } from "@/app/actions/entry";
import { ChevronDown, Loader2 } from "lucide-react";

export const OUTCOMES = {
  "Connected": ["Interested to Buy vehicle", "Not interested", "Need more details", "TD Required", "Follow up", "DND"],
  "Not Connected": ["RNR", "Call me back", "Switch off", "Busy", "Number doesn't exist"],
};

export function CustomSelect({
  value,
  options,
  placeholder,
  onChange,
  disabled,
  colorMap
}: {
  value: string | null;
  options: string[];
  placeholder: string;
  onChange: (val: string) => void;
  disabled: boolean;
  colorMap?: Record<string, string>;
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

  const buttonColorClass = (value && colorMap && colorMap[value]) 
    ? colorMap[value] 
    : "bg-white border-[var(--gmart-border)]";

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-xs border rounded px-2 py-1.5 outline-none focus:border-[var(--gmart-red)] focus:ring-1 focus:ring-[var(--gmart-red)]/20 text-left disabled:opacity-50 transition-all ${buttonColorClass}`}
      >
        <span className={value ? (colorMap && colorMap[value] ? "font-medium" : "text-[var(--gmart-title)] font-medium") : "text-[var(--gmart-muted)]"}>
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
              className={`w-full flex items-center gap-2 text-left px-3 py-1.5 text-xs hover:bg-[#fff5f6] transition-colors ${
                value === opt ? "bg-[#fff5f6] text-[var(--gmart-red)] font-semibold" : "text-[var(--gmart-title)]"
              }`}
            >
              {colorMap && colorMap[opt] && (
                <span className={`w-2 h-2 rounded-full border bg-current ${colorMap[opt].replace(/bg-[^\s]+/g, "")}`} />
              )}
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const STATUS_COLORS = {
  "Connected": "bg-green-100 text-green-800 border-green-400",
  "Not Connected": "bg-yellow-100 text-yellow-800 border-yellow-400",
};

export function CallStatusSelect({
  entryId,
  initialStatus,
  initialOutcome,
  initialRemark,
}: {
  entryId: string;
  initialStatus: string | null;
  initialOutcome: string | null;
  initialRemark: string | null;
}) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [currentOutcome, setCurrentOutcome] = useState(initialOutcome);
  const [currentRemark, setCurrentRemark] = useState(initialRemark || "");
  const [isSaving, setIsSaving] = useState(false);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === "Clear Status") {
      setCurrentStatus(null);
      setCurrentOutcome(null);
      setCurrentRemark("");
      setIsSaving(true);
      saveQueueRef.current = saveQueueRef.current.then(async () => {
        await updateCallStatus(entryId, null, null, null);
        setIsSaving(false);
      });
      return;
    }

    setCurrentStatus(newStatus);
    setCurrentOutcome(null);
    setIsSaving(true);
    
    saveQueueRef.current = saveQueueRef.current.then(async () => {
      await updateCallStatus(entryId, newStatus, null, currentRemark);
      setIsSaving(false);
    });
  };

  const handleOutcomeChange = (newOutcome: string) => {
    setCurrentOutcome(newOutcome);
    setIsSaving(true);
    
    saveQueueRef.current = saveQueueRef.current.then(async () => {
      await updateCallStatus(entryId, currentStatus, newOutcome, currentRemark);
      setIsSaving(false);
    });
  };

  const handleRemarkBlur = () => {
    if (currentRemark === (initialRemark || "")) return;
    setIsSaving(true);
    saveQueueRef.current = saveQueueRef.current.then(async () => {
      await updateCallStatus(entryId, currentStatus, currentOutcome, currentRemark);
      setIsSaving(false);
    });
  };

  const availableOutcomes = currentStatus ? OUTCOMES[currentStatus as keyof typeof OUTCOMES] || [] : [];

  return (
    <div 
      className="flex flex-col gap-1.5 min-w-[150px] relative"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <CustomSelect
        value={currentStatus}
        options={["Connected", "Not Connected", "Clear Status"]}
        placeholder="Select status..."
        onChange={handleStatusChange}
        disabled={false}
        colorMap={STATUS_COLORS}
      />

      {currentStatus && (
        <>
          <CustomSelect
            value={currentOutcome}
            options={availableOutcomes}
            placeholder="Select outcome..."
            onChange={handleOutcomeChange}
            disabled={false}
          />
          <input
            type="text"
            value={currentRemark}
            onChange={(e) => setCurrentRemark(e.target.value)}
            onBlur={handleRemarkBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            placeholder="Add remark..."
            className="w-full text-xs border border-[var(--gmart-border)] rounded px-2 py-1.5 outline-none focus:border-[var(--gmart-red)] focus:ring-1 focus:ring-[var(--gmart-red)]/20 transition-all text-[var(--gmart-title)]"
          />
        </>
      )}
      
      {isSaving && (
        <div className="absolute -left-5 top-2">
          <Loader2 className="w-3 h-3 animate-spin text-[var(--gmart-red)]" />
        </div>
      )}
    </div>
  );
}
