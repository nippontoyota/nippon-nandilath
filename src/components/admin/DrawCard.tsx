"use client";

import { useState, useTransition } from "react";
import { drawWinner, clearWinner, redrawWinner } from "@/app/actions/draw";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, RefreshCw, AlertTriangle, CheckCircle2, X, Trash2 } from "lucide-react";

type WinnerWithDetails = {
  id: string;
  place: number;
  entry: {
    name: string;
    phone: string;
    customerLocation: string;
  };
};

interface DrawCardProps {
  winner: WinnerWithDetails | null;
  eligibleCount: number;
}

type ConfirmAction = "clear" | "redraw" | null;

export function DrawCard({ winner, eligibleCount }: DrawCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const runAction = (
    action: () => Promise<{ error?: string; success?: boolean }>,
    successMessage: string
  ) => {
    setError(null);
    setSuccess(null);
    setConfirmAction(null);
    setShowDetails(false);

    startTransition(async () => {
      const result = await action();

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(successMessage);
      setTimeout(() => setSuccess(null), 3000);
    });
  };

  const handleDraw = () => runAction(drawWinner, "Winner drawn.");
  const handleClear = () => runAction(clearWinner, "Winner cleared.");
  const handleRedraw = () => runAction(redrawWinner, "Winner redrawn.");

  return (
    <Card className="w-full min-w-0 overflow-hidden border-gray-200 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0 pb-4">
        <div className="min-w-0">
          <CardTitle className="text-lg font-semibold truncate">Nippon Toyota Lucky Draw</CardTitle>
          <CardDescription>
            {winner
              ? "Draw completed — one winner selected."
              : `${eligibleCount} eligible ${eligibleCount === 1 ? "entry" : "entries"} ready to draw.`}
          </CardDescription>
        </div>

        {!winner ? (
          <Button
            onClick={handleDraw}
            disabled={isPending || eligibleCount < 1}
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
                Draw winner
              </>
            )}
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setConfirmAction("clear")}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              Clear winner
            </Button>
            <Button
              onClick={() => setConfirmAction("redraw")}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Redrawing…
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Redraw
                </>
              )}
            </Button>
          </div>
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
            {success}
          </div>
        )}

        {winner ? (
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="w-full text-left rounded-lg border border-gray-200 overflow-hidden hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4 p-4">
              <span className="flex items-center justify-center w-11 h-11 rounded-full text-sm font-semibold bg-amber-50 text-amber-800 shrink-0">
                <Trophy className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{winner.entry.name}</p>
                <p className="text-sm text-gray-500 truncate">{winner.entry.phone}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {winner.entry.customerLocation}
                </p>
              </div>
            </div>
          </button>
        ) : (
          <div className="py-10 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <Trophy className="mx-auto h-7 w-7 text-gray-300 mb-2" />
            <p className="text-sm text-gray-700 font-medium">No winner yet</p>
            <p className="text-xs text-gray-500 mt-1 px-4">
              Draws one eligible entry at random for Nippon Toyota.
            </p>
          </div>
        )}
      </CardContent>

      {showDetails && winner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setShowDetails(false)}
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
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-md hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex items-center justify-center w-11 h-11 rounded-full text-sm font-semibold bg-amber-50 text-amber-800 shrink-0">
                  <Trophy className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 truncate">{winner.entry.name}</h4>
                  <p className="text-sm text-gray-500 truncate">Nippon Toyota</p>
                </div>
              </div>

              <dl className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
                <div className="grid grid-cols-[5rem_1fr] gap-2">
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="font-medium text-gray-900 break-all">{winner.entry.phone}</dd>
                </div>
                <div className="grid grid-cols-[5rem_1fr] gap-2">
                  <dt className="text-gray-500">Address</dt>
                  <dd className="font-medium text-gray-900 break-words">{winner.entry.customerLocation}</dd>
                </div>
              </dl>
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && winner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-winner-action-title"
          onClick={() => !isPending && setConfirmAction(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg max-w-sm w-full p-5 space-y-4 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className={`h-11 w-11 rounded-full flex items-center justify-center ${
                  confirmAction === "clear" ? "bg-red-100" : "bg-amber-100"
                }`}
              >
                {confirmAction === "clear" ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <RefreshCw className="h-5 w-5 text-amber-700" />
                )}
              </div>
              <h3 id="confirm-winner-action-title" className="text-base font-semibold text-gray-900">
                {confirmAction === "clear" ? "Clear winner?" : "Redraw winner?"}
              </h3>
              <p className="text-sm text-gray-600">
                {confirmAction === "clear" ? (
                  <>
                    Remove{" "}
                    <span className="font-semibold text-gray-900 break-words">{winner.entry.name}</span>{" "}
                    as winner. They stay eligible for a future draw.
                  </>
                ) : (
                  <>
                    Replace the current winner with a new random pick. The previous winner stays
                    eligible and may be selected again.
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={isPending}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction === "clear" ? handleClear : handleRedraw}
                disabled={isPending}
                className={`flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg disabled:opacity-50 transition-colors ${
                  confirmAction === "clear"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-900 hover:bg-gray-800"
                }`}
              >
                {isPending
                  ? confirmAction === "clear"
                    ? "Clearing…"
                    : "Redrawing…"
                  : confirmAction === "clear"
                    ? "Clear"
                    : "Redraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
