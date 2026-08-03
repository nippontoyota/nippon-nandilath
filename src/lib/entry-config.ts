/**
 * Universal entry form URL encoded in the QR code.
 * Update HARDCODED_ENTRY_URL below, or set NEXT_PUBLIC_ENTRY_URL in env.
 */
const HARDCODED_ENTRY_URL = "https://nippon-nandileth.vercel.app/enter";

export const ENTRY_FORM_URL =
  process.env.NEXT_PUBLIC_ENTRY_URL ?? HARDCODED_ENTRY_URL;
