import type { Metadata } from "next";
import { Outfit, Eczar } from "next/font/google";
import { CAMPAIGN_NAME } from "@/lib/brand";
import "./globals.css";

const outfit = Outfit({
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const eczar = Eczar({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-eczar",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: CAMPAIGN_NAME,
  description: `Register for the ${CAMPAIGN_NAME}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${eczar.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
