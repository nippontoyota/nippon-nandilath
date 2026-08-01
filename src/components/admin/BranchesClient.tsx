"use client";

import { useState, useRef } from "react";
import { createBranch, deleteBranch, deleteBranches } from "@/app/actions/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  MapPin,
  Link as LinkIcon,
  Users,
  AlertTriangle,
  Check,
} from "lucide-react";

interface Branch {
  id: string;
  name: string;
  location: string | null;
  slug: string;
  _count?: {
    entries: number;
  };
}

export function BranchesClient({ branches }: { branches: Branch[] }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const [selectedBranchIds, setSelectedBranchIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; branch: Branch | null }>({
    isOpen: false,
    branch: null,
  });

  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleCreate = async (formData: FormData) => {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);
    setSuccess(false);

    try {
      const result = await createBranch(formData);

      if (result?.error) {
        alert(result.error);
      } else {
        setSuccess(true);
        const form = document.getElementById("create-branch-form") as HTMLFormElement;
        if (form) form.reset();
        setTimeout(() => setSuccess(false), 2500);
      }
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleDelete = async () => {
    const branch = deleteModal.branch;
    if (!branch || deletingId) return;

    setDeletingId(branch.id);
    try {
      const result = await deleteBranch(branch.id);
      if (result?.error) {
        alert(result.error);
      } else {
        setDeleteModal({ isOpen: false, branch: null });
        setDeleteConfirmText("");
        const next = new Set(selectedBranchIds);
        next.delete(branch.id);
        setSelectedBranchIds(next);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBranchIds.size === 0 || bulkDeleting) return;

    setBulkDeleting(true);
    try {
      const result = await deleteBranches(Array.from(selectedBranchIds));
      if (result?.error) {
        alert(result.error);
      } else {
        setBulkDeleteModal(false);
        setDeleteConfirmText("");
        setSelectedBranchIds(new Set());
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedBranchIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBranchIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedBranchIds.size === branches.length) {
      setSelectedBranchIds(new Set());
    } else {
      setSelectedBranchIds(new Set(branches.map((b) => b.id)));
    }
  };

  const openDeleteModal = (branch: Branch) => {
    setDeleteConfirmText("");
    setDeleteModal({ isOpen: true, branch });
  };

  const openBulkDeleteModal = () => {
    setDeleteConfirmText("");
    setBulkDeleteModal(true);
  };

  const entriesCount = deleteModal.branch?._count?.entries || 0;
  const isDeleteButtonDisabled = entriesCount > 0 && deleteConfirmText !== "delete this branch";

  const branchesToDelete = branches.filter((b) => selectedBranchIds.has(b.id));
  const bulkEntriesCount = branchesToDelete.reduce((sum, b) => sum + (b._count?.entries || 0), 0);
  const isBulkDeleteButtonDisabled =
    bulkEntriesCount > 0 && deleteConfirmText !== "delete these branches";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative pb-24 lg:pb-0">
      <div className="lg:col-span-2 space-y-4 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-base font-semibold text-gray-900">
              Branches
              <span className="ml-2 text-sm font-normal text-gray-500">{branches.length}</span>
            </h2>
            {branches.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                {selectedBranchIds.size === branches.length ? "Deselect all" : "Select all"}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {branches.length === 0 ? (
            <div className="p-10 text-center bg-white border border-dashed border-gray-300 rounded-xl">
              <p className="text-sm font-medium text-gray-900">No branches yet</p>
              <p className="text-sm text-gray-600 mt-1">
                Add dealership locations for organizing draws and entries.
              </p>
            </div>
          ) : (
            branches.map((branch) => {
              const isSelected = selectedBranchIds.has(branch.id);
              const entryCount = branch._count?.entries ?? 0;

              return (
                <div
                  key={branch.id}
                  className={`bg-white rounded-xl p-4 transition-colors border flex items-start sm:items-center gap-3 min-w-0 ${
                    isSelected
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSelection(branch.id)}
                    aria-label={isSelected ? `Deselect ${branch.name}` : `Select ${branch.name}`}
                    aria-pressed={isSelected}
                    className={`mt-0.5 sm:mt-0 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-gray-900 border-gray-900 text-white"
                        : "border-gray-300 text-transparent hover:border-gray-500"
                    }`}
                  >
                    <Check size={12} className="stroke-[3]" />
                  </button>

                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate" title={branch.name}>
                          {branch.name}
                        </h3>
                        {entryCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded shrink-0">
                            <Users size={10} />
                            {entryCount}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1 min-w-0 max-w-full">
                          <MapPin size={12} className="shrink-0 text-gray-400" />
                          <span className="truncate">{branch.location || "No location"}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 min-w-0 max-w-full">
                          <LinkIcon size={12} className="shrink-0 text-gray-400" />
                          <span className="font-mono truncate text-gray-600" title={branch.id}>
                            /{branch.id.slice(0, 8)}…
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => openDeleteModal(branch)}
                        aria-label={`Delete ${branch.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="lg:col-span-1 min-w-0">
        <div className="lg:sticky lg:top-6">
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/80">
              <CardTitle className="text-base font-semibold">Add branch</CardTitle>
              <CardDescription>
                Add dealership locations for organizing draws and entries.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form id="create-branch-form" action={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Branch name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. Edappally"
                    className="h-10 bg-white border-gray-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Location <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g. Kochi, Kerala"
                    className="h-10 bg-white border-gray-200"
                  />
                </div>
                <Button
                  type="submit"
                  className={`w-full h-10 gap-2 text-white ${
                    success
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-gray-900 hover:bg-gray-800"
                  }`}
                  disabled={loading || success}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : success ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {loading ? "Creating…" : success ? "Created" : "Create branch"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedBranchIds.size > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-gray-800">
            <div className="bg-white text-gray-900 min-w-6 h-6 px-1.5 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">
              {selectedBranchIds.size}
            </div>
            <span className="font-medium text-sm flex-1 truncate">selected</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedBranchIds(new Set())}
              className="text-gray-300 hover:text-white hover:bg-gray-800 h-8"
            >
              Cancel
            </Button>
            <Button size="sm" variant="destructive" onClick={openBulkDeleteModal} className="gap-1.5 h-8 shrink-0">
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </div>
      )}

      {deleteModal.isOpen && deleteModal.branch && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40"
          onClick={() => {
            if (!deletingId) {
              setDeleteModal({ isOpen: false, branch: null });
              setDeleteConfirmText("");
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl w-full max-w-md shadow-xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-gray-900">Delete branch</h3>
                  <p className="text-sm text-gray-500 truncate" title={deleteModal.branch.name}>
                    {deleteModal.branch.name}
                  </p>
                </div>
              </div>

              {entriesCount > 0 ? (
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
                    <p className="text-sm text-red-800 leading-relaxed">
                      This branch has <strong>{entriesCount}</strong>{" "}
                      {entriesCount === 1 ? "entry" : "entries"}. Deleting it removes those entries
                      and any winners. This cannot be undone.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">
                      Type{" "}
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-red-700 select-all">
                        delete this branch
                      </span>{" "}
                      to confirm
                    </Label>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="h-10 font-mono text-sm"
                      placeholder="delete this branch"
                      autoComplete="off"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No entries on this branch. Safe to delete.
                </p>
              )}
            </div>

            <div className="bg-gray-50 px-5 py-3 flex gap-2 justify-end border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModal({ isOpen: false, branch: null });
                  setDeleteConfirmText("");
                }}
                disabled={!!deletingId}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleteButtonDisabled || !!deletingId}
              >
                {deletingId ? "Deleting…" : "Delete branch"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40"
          onClick={() => {
            if (!bulkDeleting) {
              setBulkDeleteModal(false);
              setDeleteConfirmText("");
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl w-full max-w-md shadow-xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Delete {selectedBranchIds.size} branches
                  </h3>
                  <p className="text-sm text-gray-500">Bulk delete</p>
                </div>
              </div>

              {bulkEntriesCount > 0 ? (
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
                    <p className="text-sm text-red-800 leading-relaxed">
                      These branches hold <strong>{bulkEntriesCount}</strong>{" "}
                      {bulkEntriesCount === 1 ? "entry" : "entries"} total. Deleting removes
                      entries and winners. This cannot be undone.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">
                      Type{" "}
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-red-700 select-all">
                        delete these branches
                      </span>{" "}
                      to confirm
                    </Label>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="h-10 font-mono text-sm"
                      placeholder="delete these branches"
                      autoComplete="off"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  None of these branches have entries. Safe to delete.
                </p>
              )}
            </div>

            <div className="bg-gray-50 px-5 py-3 flex gap-2 justify-end border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => {
                  setBulkDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                disabled={bulkDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isBulkDeleteButtonDisabled || bulkDeleting}
              >
                {bulkDeleting ? "Deleting…" : "Delete selected"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
