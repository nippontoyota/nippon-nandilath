import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import * as XLSX from "xlsx";

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

export async function GET(req: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") ?? "entries"; // entries | winners

  if (type === "winners") {
    const winners = await prisma.winner.findMany({
      include: {
        entry: true,
      },
      orderBy: { place: "asc" },
    });

    const rows = winners.map((w) => ({
      Place: w.place,
      Name: w.entry.name,
      Phone: w.entry.phone,

      Location: w.entry.customerLocation,

      "Draw Date": w.createdAt.toISOString(),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Winners");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="winners.xlsx"`,
      },
    });
  }

  const entries = await prisma.entry.findMany({

    orderBy: { createdAt: "asc" },
  });

  const rows = entries.map((e) => {
    let flags: string[] = [];
    try { flags = e.flag ? JSON.parse(e.flag) : []; } catch { flags = e.flag ? [e.flag] : []; }
    return {
      "Ticket ID": e.id.slice(0, 8).toUpperCase(),
      Name: e.name,
      Phone: e.phone,

      Location: e.customerLocation,
      Flagged: flags.join(", ") || "No",
      Excluded: e.excluded ? "Yes" : "No",
      "Created At": e.createdAt.toISOString(),
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Entries");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="entries.xlsx"`,
    },
  });
}
