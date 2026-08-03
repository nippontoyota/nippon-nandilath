import { EntryForm } from "@/components/forms/EntryForm";

import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function EnterPage() {
  const deadline = new Date("2026-09-30T23:59:59+05:30");
  const now = new Date();

  if (now > deadline) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="relative h-20 w-48 mb-6">
          <Image src="/images/gopu-nandilath.png" alt="Gopu Nandilath" fill className="object-contain" priority />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-widest">Campaign Ended</h1>
        <p className="text-gray-500 max-w-md mx-auto">Thank you for your interest! The lucky draw entry period has officially closed.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <EntryForm />
    </div>
  );
}
