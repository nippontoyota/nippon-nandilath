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
    <Card className="admin-product-card w-full min-w-0 shadow-none ring-0 border-[var(--gmart-border)] py-0 gap-0 rounded-xl">
      <div className="bg-[var(--gmart-navy)] px-5 py-2.5 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[var(--gmart-cream)]">
          Hot draw
        </p>
        <span className="admin-sale-badge">{eligibleCount} eligible</span>
      </div>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0 px-5 pt-5 pb-4">
        <div className="min-w-0">
          <CardTitle className="text-lg font-bold tracking-tight text-[var(--gmart-title)] truncate">
            Nippon Toyota Lucky Draw
          </CardTitle>
          <CardDescription className="text-[var(--gmart-muted)]">
            {winner
              ? "Draw completed — one winner selected."
              : `${eligibleCount} eligible ${eligibleCount === 1 ? "entry" : "entries"} ready to draw.`}
          </CardDescription>
        </div>

        {!winner ? (
          <Button
            onClick={handleDraw}
            disabled={isPending || eligibleCount < 1}
            className="admin-btn-primary shrink-0 w-full sm:w-auto rounded-md"
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
              className="admin-btn-secondary w-full sm:w-auto rounded-md"
            >
              <Trash2 className="h-4 w-4" />
              Clear winner
            </Button>
            <Button
              onClick={() => setConfirmAction("redraw")}
              disabled={isPending}
              className="admin-btn-primary w-full sm:w-auto rounded-md"
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

      <CardContent className="min-w-0 px-5 pb-5">
        {error && (
          <div className="mb-4 p-3 rounded-md bg-[#fff5f6] border border-[#ffd0d5] flex items-start gap-2 text-sm text-[var(--gmart-red)]">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="min-w-0 break-words">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-md bg-[#f0faf4] border border-[#b7e4c7] flex items-center gap-2 text-sm text-[var(--gmart-success)]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        {winner ? (
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="w-full text-left rounded-md border border-[var(--gmart-border)] overflow-hidden hover:border-[var(--gmart-red)]/40 hover:bg-[#fff5f6]/40 transition-colors"
          >
            <div className="flex items-center gap-4 p-4">
              <span className="flex items-center justify-center w-11 h-11 rounded-full text-sm font-semibold bg-[var(--gmart-red)] text-white shrink-0">
                <Trophy className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--gmart-title)] truncate">{winner.entry.name}</p>
                <p className="text-sm text-[var(--gmart-muted)] truncate">{winner.entry.phone}</p>
                <p className="text-xs text-[var(--gmart-muted)] mt-0.5 truncate">
                  {winner.entry.customerLocation}
                </p>
              </div>
            </div>
          </button>
        ) : (
          <div className="py-10 text-center bg-[#fafafa] rounded-md border border-dashed border-[var(--gmart-border)]">
            <Trophy className="mx-auto h-7 w-7 text-[var(--gmart-border)] mb-2" />
            <p className="text-sm text-[var(--gmart-title)] font-medium">No winner yet</p>
            <p className="text-xs text-[var(--gmart-muted)] mt-1 px-4">
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
            className="bg-[var(--gmart-surface)] rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-[var(--gmart-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-[var(--gmart-red)]" />
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--gmart-border)]">
              <h3 id="winner-details-title" className="text-base font-semibold text-[var(--gmart-title)]">
                Winner details
              </h3>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="text-[var(--gmart-muted)] hover:text-[var(--gmart-title)] transition-colors p-1.5 rounded-md hover:bg-[#f3f3f3]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex items-center justify-center w-11 h-11 rounded-full text-sm font-semibold bg-[var(--gmart-red)] text-white shrink-0">
                  <Trophy className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-base font-semibold text-[var(--gmart-title)] truncate">{winner.entry.name}</h4>
                  <p className="text-sm text-[var(--gmart-muted)] truncate">Nippon Toyota</p>
                </div>
              </div>

              <dl className="space-y-3 bg-[#fafafa] p-4 rounded-md border border-[var(--gmart-border)] text-sm">
                <div className="grid grid-cols-[5rem_1fr] gap-2">
                  <dt className="text-[var(--gmart-muted)]">Phone</dt>
                  <dd className="font-medium text-[var(--gmart-title)] break-all">{winner.entry.phone}</dd>
                </div>
                <div className="grid grid-cols-[5rem_1fr] gap-2">
                  <dt className="text-[var(--gmart-muted)]">Address</dt>
                  <dd className="font-medium text-[var(--gmart-title)] break-words">{winner.entry.customerLocation}</dd>
                </div>
              </dl>
            </div>
            <div className="bg-[#fafafa] px-5 py-3 border-t border-[var(--gmart-border)] flex justify-end">
              <Button variant="outline" className="admin-btn-secondary rounded-md" onClick={() => setShowDetails(false)}>
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
            className="bg-[var(--gmart-surface)] rounded-xl shadow-lg max-w-sm w-full p-5 space-y-4 border border-[var(--gmart-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className={`h-11 w-11 rounded-full flex items-center justify-center ${
                  confirmAction === "clear" ? "bg-[#fff5f6]" : "bg-[#fff8e8]"
                }`}
              >
                {confirmAction === "clear" ? (
                  <AlertTriangle className="h-5 w-5 text-[var(--gmart-red)]" />
                ) : (
                  <RefreshCw className="h-5 w-5 text-[#b45309]" />
                )}
              </div>
              <h3 id="confirm-winner-action-title" className="text-base font-semibold text-[var(--gmart-title)]">
                {confirmAction === "clear" ? "Clear winner?" : "Redraw winner?"}
              </h3>
              <p className="text-sm text-[var(--gmart-muted)]">
                {confirmAction === "clear" ? (
                  <>
                    Remove{" "}
                    <span className="font-semibold text-[var(--gmart-title)] break-words">{winner.entry.name}</span>{" "}
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
                className="admin-btn-secondary flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction === "clear" ? handleClear : handleRedraw}
                disabled={isPending}
                className="admin-btn-primary flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50"
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
