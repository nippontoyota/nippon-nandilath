"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight, Check, X } from "lucide-react";
import { addModel, deleteModel, addColour, editColour, deleteColour } from "@/app/actions/models";

type Colour = { id: string; name: string; modelId: string };
type Model = { id: string; name: string; colours: Colour[] };

export function ModelsClient({ initialModels }: { initialModels: Model[] }) {
  const [models, setModels] = useState<Model[]>(initialModels);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(initialModels.map((m) => m.id))
  );
  const [editingColourId, setEditingColourId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [addingColourToModel, setAddingColourToModel] = useState<string | null>(null);
  const [newColourName, setNewColourName] = useState("");
  const [addingModel, setAddingModel] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = () => window.location.reload();

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

  const handleAddColour = (modelId: string) => {
    if (!newColourName.trim()) return;
    const fd = new FormData();
    fd.set("modelId", modelId);
    fd.set("name", newColourName.trim());
    startTransition(async () => {
      const res = await addColour(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setAddingColourToModel(null);
      setNewColourName("");
      refresh();
    });
  };

  const handleEditColour = (id: string) => {
    if (!editName.trim()) return;
    const fd = new FormData();
    fd.set("name", editName.trim());
    startTransition(async () => {
      const res = await editColour(id, fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setEditingColourId(null);
      setEditName("");
      refresh();
    });
  };

  const handleDeleteColour = (id: string, name: string) => {
    if (!confirm(`Delete colour "${name}"?`)) return;
    startTransition(async () => {
      const res = await deleteColour(id);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setModels((prev) =>
        prev.map((m) => ({ ...m, colours: m.colours.filter((c) => c.id !== id) }))
      );
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
        {models.map((model) => {
          const isExpanded = expandedIds.has(model.id);
          return (
            <div key={model.id} className="min-w-0">
              <div className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50/80 group">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-700 transition-colors shrink-0 p-1 -ml-1 rounded"
                  onClick={() => toggleExpand(model.id)}
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? `Collapse ${model.name}` : `Expand ${model.name}`}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  className="font-semibold text-gray-900 flex-1 text-left truncate min-w-0"
                  onClick={() => toggleExpand(model.id)}
                  title={model.name}
                >
                  {model.name}
                </button>
                <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
                  {model.colours.length} {model.colours.length === 1 ? "colour" : "colours"}
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

              {isExpanded && (
                <div className="bg-gray-50/70 border-t border-gray-100 px-4 py-2 space-y-0.5">
                  {model.colours.length === 0 && (
                    <p className="text-xs text-gray-500 py-2 pl-7">No colours yet. Add at least one.</p>
                  )}
                  {model.colours.map((colour) => (
                    <div key={colour.id} className="flex items-center gap-2 py-1.5 pl-1 min-w-0">
                      {editingColourId === colour.id ? (
                        <>
                          <input
                            autoFocus
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleEditColour(colour.id)}
                            className="flex-1 min-w-0 h-8 text-sm px-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                          />
                          <button
                            type="button"
                            onClick={() => handleEditColour(colour.id)}
                            disabled={isPending}
                            className="p-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 shrink-0"
                            aria-label="Save colour"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingColourId(null)}
                            className="p-1.5 rounded-md border border-gray-200 hover:bg-white shrink-0"
                            aria-label="Cancel edit"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0 ml-1" />
                          <span className="flex-1 text-sm text-gray-700 truncate min-w-0" title={colour.name}>
                            {colour.name}
                          </span>
                          <div className="flex gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingColourId(colour.id);
                                setEditName(colour.name);
                              }}
                              className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500"
                              title="Rename colour"
                              aria-label={`Rename ${colour.name}`}
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteColour(colour.id, colour.name)}
                              disabled={isPending}
                              className="p-1.5 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-600 disabled:opacity-30"
                              title="Delete colour"
                              aria-label={`Delete ${colour.name}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {addingColourToModel === model.id ? (
                    <div className="flex items-center gap-2 py-1.5 pl-1">
                      <span className="w-2 shrink-0 ml-1" />
                      <input
                        autoFocus
                        type="text"
                        value={newColourName}
                        onChange={(e) => setNewColourName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddColour(model.id)}
                        placeholder="Colour name"
                        className="flex-1 min-w-0 h-8 text-sm px-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddColour(model.id)}
                        disabled={isPending}
                        className="p-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 shrink-0"
                        aria-label="Save colour"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingColourToModel(null);
                          setNewColourName("");
                        }}
                        className="p-1.5 rounded-md border border-gray-200 hover:bg-white shrink-0"
                        aria-label="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingColourToModel(model.id);
                        setNewColourName("");
                      }}
                      className="flex items-center gap-1.5 py-2 pl-7 text-xs font-medium text-gray-700 hover:text-gray-900"
                    >
                      <Plus className="w-3 h-3" />
                      Add colour
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
