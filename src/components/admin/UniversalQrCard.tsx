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
      color: { dark: "#000000", light: "#ffffff" },
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
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/80">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <QrCode className="w-4 h-4" />
          Entry QR code
        </CardTitle>
        <CardDescription>
          One QR for Nippon Toyota. Scans open the registration form.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 flex flex-col items-center">
        <div className="bg-white p-2 rounded-lg border border-gray-100 mb-4">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Universal entry form QR code"
              className="w-48 h-48 object-contain"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-sm text-gray-400">
              Generating…
            </div>
          )}
        </div>
        <p className="w-full p-2.5 bg-gray-50 rounded-lg border border-gray-100 mb-4 text-xs text-center font-mono break-all text-gray-600">
          {entryUrl}
        </p>
        {dataUrl && (
          <Button
            variant="outline"
            className="w-full h-10 gap-2"
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
