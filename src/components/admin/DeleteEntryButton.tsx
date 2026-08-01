"use client";

import { useTransition, useState } from "react";
import { deleteEntry } from "@/app/actions/entry";
import { Trash2, AlertTriangle } from "lucide-react";

export function DeleteEntryButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteEntry(id);
      if (result?.error) {
        alert(result.error);
      } else {
        setShowModal(false);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 disabled:opacity-50 border border-transparent hover:border-red-100"
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
            className="bg-white rounded-xl shadow-lg max-w-sm w-full p-5 space-y-4 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-11 w-11 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 id="delete-entry-title" className="text-base font-semibold text-gray-900">
                Delete entry?
              </h3>
              <p className="text-sm text-gray-600">
                This permanently removes{" "}
                <span className="font-semibold text-gray-900 break-words">{name}</span> from the draw.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
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
