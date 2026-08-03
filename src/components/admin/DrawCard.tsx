"use client";

import { useState, useTransition } from "react";
import { drawWinner } from "@/app/actions/draw";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, RefreshCw, AlertTriangle, CheckCircle2, X } from "lucide-react";

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

export function DrawCard({ winner, eligibleCount }: DrawCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDraw = () => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await drawWinner();

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

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

        {!winner && (
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
            Winner drawn.
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
                  <dt className="text-gray-500">Location</dt>
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
    </Card>
  );
}
