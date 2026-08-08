"use client";

import { useState, useEffect } from "react";
import { X, Download, Copy, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
  totalResponses: number;
  totalConnected: number;
  connectedBreakdown: Record<string, number>;
  totalDisconnected: number;
  disconnectedBreakdown: Record<string, number>;
  totalPending: number;
  entries: {
    name: string;
    phone: string;
    callStatus: string | null;
    callOutcome: string | null;
  }[];
}

export function DailyReportModal({
  isOpen,
  onClose,
  searchParams,
}: {
  isOpen: boolean;
  onClose: () => void;
  searchParams: string;
}) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/report?${searchParams}`)
        .then((res) => res.json())
        .then((d) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, searchParams]);

  if (!isOpen) return null;

  const params = new URLSearchParams(searchParams);
  const dateParam = params.get("date");
  const reportDate = dateParam ? new Date(dateParam) : new Date();
  const dateStr = reportDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const getReportText = () => {
    if (!data) return "";
    
    let text = `Nippon-Nandilath Lucky Draw Report - ${dateStr}\n\n`;
    text += `Total Responses: ${data.totalResponses}\n`;
    
    const connStr = Object.entries(data.connectedBreakdown)
      .map(([k, v]) => `${v} - ${k}`)
      .join(", ");
    text += `Total Connected Calls: ${data.totalConnected} ${connStr ? `(${connStr})` : ""}\n`;
    
    const disconnStr = Object.entries(data.disconnectedBreakdown)
      .map(([k, v]) => `${v} - ${k}`)
      .join(", ");
    text += `Total Disconnected Calls: ${data.totalDisconnected} ${disconnStr ? `(${disconnStr})` : ""}\n`;
    
    text += `Total Pending Calls to be made: ${data.totalPending}`;
    
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getReportText());
    alert("Report text copied to clipboard!");
  };

  const handleDownloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Nippon-Nandilath Lucky Draw Report - ${dateStr}`, 14, 20);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    // Summary
    let y = 30;
    doc.text(`Total Responses: ${data.totalResponses}`, 14, y);
    y += 8;
    
    const connStr = Object.entries(data.connectedBreakdown)
      .map(([k, v]) => `${v} - ${k}`)
      .join(", ");
    
    // Split long text for PDF wrapping
    const connLines = doc.splitTextToSize(`Total Connected Calls: ${data.totalConnected} ${connStr ? `(${connStr})` : ""}`, 180);
    doc.text(connLines, 14, y);
    y += (connLines.length * 6) + 2;
    
    const disconnStr = Object.entries(data.disconnectedBreakdown)
      .map(([k, v]) => `${v} - ${k}`)
      .join(", ");
    
    const disconnLines = doc.splitTextToSize(`Total Disconnected Calls: ${data.totalDisconnected} ${disconnStr ? `(${disconnStr})` : ""}`, 180);
    doc.text(disconnLines, 14, y);
    y += (disconnLines.length * 6) + 2;
    
    doc.text(`Total Pending Calls to be made: ${data.totalPending}`, 14, y);
    y += 15;

    // Pivot Table Grid
    const allOutcomes = Array.from(new Set([
      ...Object.keys(data.connectedBreakdown),
      ...Object.keys(data.disconnectedBreakdown)
    ])).sort();

    if (allOutcomes.length > 0) {
      const pivotData = allOutcomes.map(outcome => {
        const conn = data.connectedBreakdown[outcome] || 0;
        const notConn = data.disconnectedBreakdown[outcome] || 0;
        return [outcome, conn, notConn, conn + notConn];
      });

      // Add Grand Total Row
      const grandConn = allOutcomes.reduce((sum, o) => sum + (data.connectedBreakdown[o] || 0), 0);
      const grandNotConn = allOutcomes.reduce((sum, o) => sum + (data.disconnectedBreakdown[o] || 0), 0);
      pivotData.push(['Grand Total', grandConn, grandNotConn, grandConn + grandNotConn]);

      autoTable(doc, {
        startY: y,
        head: [['Call Outcome', 'Connected', 'Not Connected', 'Total']],
        body: pivotData,
        theme: 'grid',
        headStyles: { fillColor: [75, 85, 99] }, // Slate gray
        styles: { fontSize: 10, cellPadding: 4 },
        didParseCell: function(cellData) {
          if (cellData.row.index === pivotData.length - 1) {
            cellData.cell.styles.fontStyle = 'bold';
            cellData.cell.styles.fillColor = [243, 244, 246]; // Gray 100
          }
        }
      });
      
      y = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // Detailed Table
    const tableData = data.entries.map((e, i) => [
      i + 1,
      e.name,
      e.phone,
      e.callStatus || "Pending",
      e.callOutcome || "—"
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Sl No', 'Name', 'Number', 'Status', 'Outcome']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] }, // Brand Red
      styles: { fontSize: 9, cellPadding: 3 },
    });

    doc.save(`Lucky_Draw_Report_${dateStr.replace(/ /g, "_")}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--gmart-red)]" />
            Daily Report Overview
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p>Generating report...</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 font-mono text-sm whitespace-pre-wrap text-gray-800 leading-relaxed shadow-inner">
              {getReportText()}
              <div className="mt-5 text-xs text-gray-500 border-t border-gray-200 pt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                A detailed data table with {data?.entries.length} rows will be automatically appended when you download the PDF.
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 bg-gray-50">
          <button 
            onClick={handleCopy}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Copy className="w-4 h-4" />
            Copy Text
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--gmart-red)] border border-transparent rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
