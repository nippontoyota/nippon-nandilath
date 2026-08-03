"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus, Check, X } from "lucide-react";
import { addModel, deleteModel } from "@/app/actions/models";

type Model = { id: string; name: string };

export function ModelsClient({ initialModels }: { initialModels: Model[] }) {
  const [models, setModels] = useState<Model[]>(initialModels);
  const [addingModel, setAddingModel] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = () => window.location.reload();

  const handleAddModel = () => {
    if (!newModelName.trim()) return;
    const fd = new FormData();
    fd.set("name", newModelName.trim());
    startTransition(async () => {
      const res = await addModel(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setAddingModel(false);
      setNewModelName("");
      refresh();
    });
  };

  const handleDeleteModel = (id: string, name: string) => {
    if (!confirm(`Delete model "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteModel(id);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setModels((prev) => prev.filter((m) => m.id !== id));
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <X className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1 min-w-0 break-words">{error}</span>
          <button type="button" className="shrink-0 p-0.5" onClick={() => setError(null)} aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          {models.length} {models.length === 1 ? "model" : "models"} on the entry form
        </p>
        {addingModel ? (
          <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
            <input
              autoFocus
              type="text"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddModel()}
              placeholder="Model name"
              className="h-9 flex-1 sm:w-48 min-w-0 text-sm px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
            />
            <button
              type="button"
              onClick={handleAddModel}
              disabled={isPending}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 shrink-0"
              aria-label="Save model"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingModel(false);
                setNewModelName("");
              }}
              disabled={isPending}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 shrink-0"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingModel(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 self-start"
          >
            <Plus className="w-4 h-4" />
            Add model
          </button>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm">
        {models.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-sm font-medium text-gray-900">No models yet</p>
            <p className="text-sm text-gray-600 mt-1">
              Add the Toyota models customers can choose on the entry form.
            </p>
          </div>
        )}
        {models.map((model) => (
          <div key={model.id} className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50/80 group min-w-0">
            <span className="font-semibold text-gray-900 flex-1 text-left truncate min-w-0" title={model.name}>
              {model.name}
            </span>
            <button
              type="button"
              onClick={() => handleDeleteModel(model.id, model.name)}
              disabled={isPending}
              className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-30 shrink-0"
              title="Delete model"
              aria-label={`Delete ${model.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
