"use client";

import { useState, useTransition } from "react";
import { toggleExclude } from "@/app/actions/entry";
import { Ban, CheckCircle2 } from "lucide-react";

export function ExcludeEntryButton({ id, excluded }: { id: string; excluded: boolean }) {
  const [isExcluded, setIsExcluded] = useState(excluded);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleExclude(id);
      if (res && "excluded" in res && typeof res.excluded === "boolean") {
        setIsExcluded(res.excluded);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={isExcluded ? "Put back in the draw" : "Remove from the draw"}
      className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-semibold transition-colors disabled:opacity-50 min-h-8 ${
        isExcluded
          ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {isExcluded ? (
        <>
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          Include
        </>
      ) : (
        <>
          <Ban className="w-3 h-3 shrink-0" />
          Exclude
        </>
      )}
    </button>
  );
}
