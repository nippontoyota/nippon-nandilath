import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

async function verifyAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) return false;
  try {
    const key = new TextEncoder().encode(process.env.SESSION_SECRET!);
    await jwtVerify(session.value, key, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await verifyAuth())) {
    return NextResponse.json({ count: 0 }, { status: 401 });
  }

  const count = await prisma.entry.count({
    where: {
      flag: { not: null },
      excluded: false,
    },
  });

  return NextResponse.json({ count }, {
    headers: { "Cache-Control": "no-store" },
  });
}
