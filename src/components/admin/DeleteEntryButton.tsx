"use client";

import { useTransition, useState } from "react";
import { deleteEntry } from "@/app/actions/entry";
import { Trash2, AlertTriangle } from "lucide-react";

export function DeleteEntryButton({
  id,
  name,
  onDeleted,
}: {
  id: string;
  name: string;
  onDeleted?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteEntry(id);
      if (result?.error) {
        alert(result.error);
      } else {
        setShowModal(false);
        onDeleted?.();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gmart-red)]/30 text-[var(--gmart-red)] hover:text-[var(--gmart-red-hover)] hover:bg-[#fff5f6] h-8 w-8 disabled:opacity-50 border border-transparent hover:border-[#ffd0d5]"
        title="Delete entry"
        aria-label={`Delete entry for ${name}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-entry-title"
          onClick={() => !isPending && setShowModal(false)}
        >
          <div
            className="bg-[var(--gmart-surface)] rounded-xl shadow-lg max-w-sm w-full p-5 space-y-4 border border-[var(--gmart-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-11 w-11 rounded-full bg-[#fff5f6] flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-[var(--gmart-red)]" />
              </div>
              <h3 id="delete-entry-title" className="text-base font-semibold text-[var(--gmart-title)]">
                Delete entry?
              </h3>
              <p className="text-sm text-[var(--gmart-muted)]">
                This permanently removes{" "}
                <span className="font-semibold text-[var(--gmart-title)] break-words">{name}</span> from the draw.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="admin-btn-secondary flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="admin-btn-primary flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50"
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
