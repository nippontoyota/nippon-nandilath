"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode } from "lucide-react";

export function UniversalQrCard({ entryUrl }: { entryUrl: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(entryUrl, {
      width: 400,
      margin: 2,
      color: { dark: "#0D0625", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch((err) => {
        console.error("Failed to generate QR code:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [entryUrl]);

  return (
    <Card className="admin-product-card shadow-none ring-0 border-[var(--gmart-border)] py-0 gap-0 overflow-hidden rounded-xl">
      <div className="bg-[var(--gmart-navy)] px-5 py-2.5">
        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[var(--gmart-cream)]">
          Entry access
        </p>
      </div>
      <CardHeader className="pb-3 border-b border-[var(--gmart-border)] bg-[#fafafa] px-5 pt-4">
        <CardTitle className="text-base font-bold text-[var(--gmart-title)] flex items-center gap-2">
          <QrCode className="w-4 h-4 text-[var(--gmart-red)]" />
          Entry QR code
        </CardTitle>
        <CardDescription className="text-[var(--gmart-muted)]">
          One QR for Nippon Toyota. Scans open the registration form.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 px-5 pb-5 flex flex-col items-center">
        <div className="bg-white p-2 rounded-md border border-[var(--gmart-border)] mb-4">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Universal entry form QR code"
              className="w-48 h-48 object-contain"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-sm text-[var(--gmart-muted)]">
              Generating…
            </div>
          )}
        </div>
        <p className="w-full p-2.5 bg-[#fafafa] rounded-md border border-[var(--gmart-border)] mb-4 text-xs text-center font-mono break-all text-[var(--gmart-muted)]">
          {entryUrl}
        </p>
        {dataUrl && (
          <Button
            variant="outline"
            className="admin-btn-secondary w-full h-10 gap-2 rounded-md"
            onClick={() => {
              const link = document.createElement("a");
              link.href = dataUrl;
              link.download = "entry_form_qr.png";
              link.click();
            }}
          >
            <Download className="w-4 h-4" />
            Download PNG
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
