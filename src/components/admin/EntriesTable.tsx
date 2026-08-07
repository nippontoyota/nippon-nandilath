"use client";

import { useEffect, useState } from "react";
import { X, User } from "lucide-react";
import { DeleteEntryButton } from "@/components/admin/DeleteEntryButton";
import { ExcludeEntryButton } from "@/components/admin/ExcludeEntryButton";
import { CallStatusSelect } from "@/components/admin/CallStatusSelect";

export type EntryRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  customerLocation: string;
  flag: string | null;
  flagReason: string | null;
  excluded: boolean;
  callStatus: string | null;
  callOutcome: string | null;
  callRemark: string | null;
  createdAt: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

function parseFlags(flag: string | null): string[] {
  if (!flag) return [];
  try {
    const parsed = JSON.parse(flag);
    return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
  } catch {
    return [flag];
  }
}

export function EntriesTable({ entries, userRole, offset = 0 }: { entries: EntryRow[], userRole?: string, offset?: number }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = entries.find((e) => e.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  return (
    <>
      <div className="admin-product-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm table-auto">
            <thead className="bg-[var(--gmart-navy)] text-[var(--gmart-cream)] text-xs">
              <tr>
                <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px] w-12 text-center">
                  
                </th>
                <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px] min-w-[10rem]">
                  Participant
                </th>
                <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px] whitespace-nowrap">
                  Ticket
                </th>
                <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px] min-w-[12rem]">
                  Address
                </th>
                <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px]">Flags</th>
                <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px] whitespace-nowrap">
                  Draw status
                </th>
                <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px] text-right whitespace-nowrap">
                  Actions
                </th>
                {userRole === "call_center" && (
                  <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px] min-w-[150px]">
                    Call Status
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gmart-border)]">
              {entries.map((entry, index) => {
                const flags = parseFlags(entry.flag);
                return (
                  <tr
                    key={entry.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(entry.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(entry.id);
                      }
                    }}
                    className={`cursor-pointer transition-colors hover:bg-[#fff5f6]/70 focus-visible:outline-none focus-visible:bg-[#fff5f6] ${
                      entry.excluded ? "bg-[#fafafa]" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-3 align-top text-center text-[var(--gmart-muted)] text-xs font-medium">
                      {offset + index + 1}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div
                        className={`font-medium break-words ${
                          entry.excluded ? "text-[var(--gmart-muted)]" : "text-[var(--gmart-title)]"
                        }`}
                      >
                        {entry.name}
                      </div>
                      <div className="text-xs text-[var(--gmart-muted)] mt-0.5 break-all">
                        {entry.phone}
                      </div>
                      {entry.email && (
                        <div className="text-xs text-[var(--gmart-muted)]/80 mt-0.5 break-all">
                          {entry.email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <div className="font-mono text-xs text-[var(--gmart-title)]">
                        {entry.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div className="text-xs text-[var(--gmart-muted)] mt-0.5">
                        {dateFormatter.format(new Date(entry.createdAt))}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-[var(--gmart-title)] break-words whitespace-normal max-w-md">
                        {entry.customerLocation}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {flags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {flags.map((f) => (
                            <span key={f} className="admin-sale-badge capitalize">
                              {f.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[var(--gmart-border)]">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      {entry.excluded ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-[#f3f3f3] text-[var(--gmart-muted)] border border-[var(--gmart-border)]">
                          Excluded
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-[#f0faf4] text-[var(--gmart-success)] border border-[#b7e4c7]">
                          In draw
                        </span>
                      )}
                    </td>
                    <td 
                      className="px-4 py-3 align-top"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <ExcludeEntryButton id={entry.id} excluded={entry.excluded} />
                        <DeleteEntryButton id={entry.id} name={entry.name} />
                      </div>
                    </td>
                    {userRole === "call_center" && (
                      <td 
                        className="px-4 py-3 align-top"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <CallStatusSelect
                          entryId={entry.id}
                          initialStatus={entry.callStatus}
                          initialOutcome={entry.callOutcome}
                          initialRemark={entry.callRemark}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="entry-details-title"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="bg-[var(--gmart-surface)] rounded-xl shadow-lg w-full max-w-lg overflow-hidden border border-[var(--gmart-border)] max-h-[min(90dvh,40rem)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-[var(--gmart-red)] shrink-0" />
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--gmart-border)] shrink-0">
              <h3 id="entry-details-title" className="text-base font-semibold text-[var(--gmart-title)]">
                Entry details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="text-[var(--gmart-muted)] hover:text-[var(--gmart-title)] transition-colors p-1.5 rounded-md hover:bg-[#f3f3f3]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="flex items-start gap-3 min-w-0">
                <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[var(--gmart-red)] text-white shrink-0">
                  <User className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-base font-semibold text-[var(--gmart-title)] break-words">
                    {selected.name}
                  </h4>
                  <p className="text-sm text-[var(--gmart-muted)] mt-0.5">
                    {selected.excluded ? "Excluded from draw" : "In draw"}
                  </p>
                </div>
              </div>

              <dl className="space-y-3 bg-[#fafafa] p-4 rounded-md border border-[var(--gmart-border)] text-sm">
                <DetailRow label="Phone" value={selected.phone} breakAll />
                <DetailRow label="Email" value={selected.email || "—"} breakAll />
                <DetailRow label="Address" value={selected.customerLocation} />
                <DetailRow
                  label="Ticket"
                  value={selected.id.slice(0, 8).toUpperCase()}
                  mono
                />
                <DetailRow
                  label="Submitted"
                  value={dateFormatter.format(new Date(selected.createdAt))}
                />
                {userRole === "call_center" && (
                  <DetailRow
                    label="Call Status"
                    value={
                      selected.callStatus
                        ? `${selected.callStatus}${selected.callOutcome ? ` - ${selected.callOutcome}` : ""}`
                        : "—"
                    }
                  />
                )}
                {userRole === "call_center" && selected.callRemark && (
                  <DetailRow
                    label="Remark"
                    value={selected.callRemark}
                  />
                )}
                <div className="grid grid-cols-[5.5rem_1fr] gap-2 items-start">
                  <dt className="text-[var(--gmart-muted)] shrink-0">Flags</dt>
                  <dd className="font-medium text-[var(--gmart-title)]">
                    {parseFlags(selected.flag).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {parseFlags(selected.flag).map((f) => (
                          <span key={f} className="admin-sale-badge capitalize">
                            {f.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[var(--gmart-muted)] font-normal">None</span>
                    )}
                  </dd>
                </div>
                {selected.flagReason && (
                  <DetailRow label="Reason" value={selected.flagReason} />
                )}
              </dl>
            </div>

            <div className="bg-[#fafafa] px-5 py-3 border-t border-[var(--gmart-border)] flex flex-wrap items-center justify-end gap-2 shrink-0">
              <ExcludeEntryButton id={selected.id} excluded={selected.excluded} />
              <DeleteEntryButton
                id={selected.id}
                name={selected.name}
                onDeleted={() => setSelectedId(null)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailRow({
  label,
  value,
  breakAll,
  mono,
}: {
  label: string;
  value: string;
  breakAll?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-2 items-start">
      <dt className="text-[var(--gmart-muted)] shrink-0">{label}</dt>
      <dd
        className={`font-medium text-[var(--gmart-title)] break-words ${
          breakAll ? "break-all" : ""
        } ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
