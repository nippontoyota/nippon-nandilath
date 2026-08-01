"use client";

import { useState, useTransition } from "react";
import { drawWinner } from "@/app/actions/draw";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, RefreshCw, AlertTriangle, CheckCircle2, X } from "lucide-react";
import type { Branch } from "@prisma/client";

type WinnerWithDetails = {
  id: string;
  place: number;
  entry: {
    name: string;
    phone: string;
    vin: string;
    model: { name: string };
    colour: { name: string };
  };
};

interface BranchDrawCardProps {
  branch: Branch;
  winners: WinnerWithDetails[];
}

function placeLabel(place: number) {
  if (place === 1) return "1st";
  if (place === 2) return "2nd";
  return "3rd";
}

export function BranchDrawCard({ branch, winners }: BranchDrawCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmRedraw, setShowConfirmRedraw] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<WinnerWithDetails | null>(null);

  const hasWinners = winners.length > 0;

  const handleDraw = async (forceRerun = false) => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await drawWinner(branch.id, forceRerun);

      if (result.error === "WINNERS_EXIST" && !forceRerun) {
        setShowConfirmRedraw(true);
        return;
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setShowConfirmRedraw(false);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  return (
    <Card className="w-full min-w-0 overflow-hidden border-gray-200 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0 pb-4">
        <div className="min-w-0">
          <CardTitle className="text-lg font-semibold truncate">{branch.name}</CardTitle>
          {branch.location ? (
            <CardDescription className="truncate">{branch.location}</CardDescription>
          ) : (
            <CardDescription>No location set</CardDescription>
          )}
        </div>

        {!hasWinners && (
          <Button
            onClick={() => handleDraw()}
            disabled={isPending}
            className="shrink-0 w-full sm:w-auto"
            size="lg"
          >
            {isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Drawing…
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4" />
                Draw 3 winners
              </>
            )}
          </Button>
        )}
      </CardHeader>

      <CardContent className="min-w-0">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
            <span className="min-w-0 break-words">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            Winners drawn.
          </div>
        )}

        {hasWinners ? (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-gray-200 -mx-1 sm:mx-0">
              <table className="w-full text-sm text-left min-w-[560px]">
                <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-2.5 font-medium w-16">Place</th>
                    <th className="px-3 sm:px-4 py-2.5 font-medium">Name</th>
                    <th className="px-3 sm:px-4 py-2.5 font-medium">Phone</th>
                    <th className="px-3 sm:px-4 py-2.5 font-medium">Vehicle</th>
                    <th className="px-3 sm:px-4 py-2.5 font-medium">VIN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {winners.map((winner) => (
                    <tr
                      key={winner.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedWinner(winner)}
                    >
                      <td className="px-3 sm:px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                          {placeLabel(winner.place)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 font-medium text-gray-900 max-w-[140px] truncate" title={winner.entry.name}>
                        {winner.entry.name}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-gray-700 whitespace-nowrap">{winner.entry.phone}</td>
                      <td className="px-3 sm:px-4 py-3 text-gray-600 max-w-[180px] truncate" title={`${winner.entry.model.name} (${winner.entry.colour.name})`}>
                        {winner.entry.model.name}{" "}
                        <span className="text-gray-400">({winner.entry.colour.name})</span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs font-mono text-gray-600 max-w-[120px] truncate" title={winner.entry.vin}>
                        {winner.entry.vin}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-1">
              {showConfirmRedraw ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-red-50 p-3 rounded-lg border border-red-100 w-full sm:w-auto">
                  <span className="text-sm text-red-800 font-medium">
                    Replace these winners with a new draw?
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConfirmRedraw(false)}
                      disabled={isPending}
                      className="bg-white flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDraw(true)}
                      disabled={isPending}
                      className="flex-1 sm:flex-none"
                    >
                      {isPending ? "Redrawing…" : "Yes, redraw"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50"
                  onClick={() => setShowConfirmRedraw(true)}
                  disabled={isPending}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Redraw winners
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <Trophy className="mx-auto h-7 w-7 text-gray-300 mb-2" />
            <p className="text-sm text-gray-700 font-medium">No winners yet</p>
            <p className="text-xs text-gray-500 mt-1 px-4">
              Draws three eligible entries at random for this branch.
            </p>
          </div>
        )}
      </CardContent>

      {selectedWinner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setSelectedWinner(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="winner-details-title"
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 id="winner-details-title" className="text-base font-semibold text-gray-900">
                Winner details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedWinner(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-md hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex items-center justify-center w-11 h-11 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 shrink-0">
                  {placeLabel(selectedWinner.place)}
                </span>
                <div className="min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 truncate">{selectedWinner.entry.name}</h4>
                  <p className="text-sm text-gray-500 truncate">{branch.name}</p>
                </div>
              </div>

              <dl className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
                <div className="grid grid-cols-[5rem_1fr] gap-2">
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="font-medium text-gray-900 break-all">{selectedWinner.entry.phone}</dd>
                </div>
                <div className="grid grid-cols-[5rem_1fr] gap-2">
                  <dt className="text-gray-500">Vehicle</dt>
                  <dd className="font-medium text-gray-900 break-words">{selectedWinner.entry.model.name}</dd>
                </div>
                <div className="grid grid-cols-[5rem_1fr] gap-2">
                  <dt className="text-gray-500">Colour</dt>
                  <dd className="font-medium text-gray-900 break-words">{selectedWinner.entry.colour.name}</dd>
                </div>
                <div className="grid grid-cols-[5rem_1fr] gap-2">
                  <dt className="text-gray-500">VIN</dt>
                  <dd className="font-mono font-medium text-gray-900 break-all">{selectedWinner.entry.vin}</dd>
                </div>
              </dl>
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedWinner(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
