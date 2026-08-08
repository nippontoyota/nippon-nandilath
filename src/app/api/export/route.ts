import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { PassThrough, Readable } from "stream";
import * as ExcelJS from "exceljs";

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

  const passThrough = new PassThrough();

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: passThrough,
    useStyles: true,
  });

  // Start building the file in the background
  (async () => {
    try {
      if (type === "winners") {
        const sheet = workbook.addWorksheet("Winners");
        sheet.columns = [
          { header: "Place", key: "place", width: 10 },
          { header: "Name", key: "name", width: 25 },
          { header: "Phone", key: "phone", width: 15 },
          { header: "Address", key: "address", width: 30 },
          { header: "Draw Date", key: "drawDate", width: 25 },
        ];

        let skip = 0;
        const take = 100;
        let hasMore = true;

        while (hasMore) {
          const winners = await prisma.winner.findMany({
            include: { entry: true },
            orderBy: { place: "asc" },
            skip,
            take,
          });

          if (winners.length === 0) {
            hasMore = false;
            break;
          }

          for (const w of winners) {
            sheet.addRow({
              place: w.place,
              name: w.entry.name,
              phone: w.entry.phone,
              address: w.entry.customerLocation,
              drawDate: w.createdAt.toISOString(),
            }).commit();
          }

          skip += take;
        }
      } else {
        const sheet = workbook.addWorksheet("Entries");
        sheet.columns = [
          { header: "Ticket ID", key: "ticket", width: 15 },
          { header: "Name", key: "name", width: 25 },
          { header: "Phone Number", key: "phone", width: 15 },
          { header: "Email", key: "email", width: 25 },
          { header: "Address", key: "address", width: 30 },
          { header: "Call Status", key: "callStatus", width: 15 },
          { header: "Call Outcome", key: "callOutcome", width: 15 },
          { header: "Flagged?", key: "flagged", width: 10 },
          { header: "Excluded", key: "excluded", width: 10 },
          { header: "Created At", key: "createdAt", width: 25 },
        ];

        const search = searchParams.get("search") || "";
        const statusFilter = searchParams.get("status") || "all";
        const outcomeFilter = searchParams.get("outcome") || "all";
        const fromDateFilter = searchParams.get("fromDate") || "";
        const toDateFilter = searchParams.get("toDate") || "";

        const whereClause: any = search
          ? {
              OR: [
                { id: { startsWith: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
                { customerLocation: { contains: search, mode: "insensitive" } },
              ],
            }
          : {};

        if (statusFilter === "Connected") {
          whereClause.callStatus = "Connected";
        } else if (statusFilter === "Not Connected") {
          whereClause.callStatus = "Not Connected";
        } else if (statusFilter === "Pending") {
          whereClause.callStatus = null;
        }

        if (outcomeFilter !== "all" && statusFilter !== "Pending") {
          whereClause.callOutcome = outcomeFilter;
        }

        if (fromDateFilter || toDateFilter) {
          whereClause.createdAt = {};
          if (fromDateFilter) {
            whereClause.createdAt.gte = new Date(`${fromDateFilter}T00:00:00.000+05:30`);
          }
          if (toDateFilter) {
            whereClause.createdAt.lte = new Date(`${toDateFilter}T23:59:59.999+05:30`);
          }
        }

        let skip = 0;
        const take = 500;
        let hasMore = true;

        while (hasMore) {
          const entries = await prisma.entry.findMany({
            where: whereClause,
            orderBy: { createdAt: "asc" },
            skip,
            take,
          });

          if (entries.length === 0) {
            hasMore = false;
            break;
          }

          for (const e of entries) {
            let flags: string[] = [];
            try { flags = e.flag ? JSON.parse(e.flag) : []; } catch { flags = e.flag ? [e.flag] : []; }

            sheet.addRow({
              ticket: e.id.slice(0, 8).toUpperCase(),
              name: e.name,
              phone: e.phone,
              email: e.email || "",
              address: e.customerLocation,
              callStatus: e.callStatus || "",
              callOutcome: e.callOutcome || "",
              flagged: flags.length > 0 ? "Yes" : "No",
              excluded: e.excluded ? "Yes" : "No",
              createdAt: e.createdAt.toISOString(),
            }).commit();
          }

          skip += take;
        }
      }

      await workbook.commit();
    } catch (error) {
      console.error("Export streaming error:", error);
      passThrough.end(); // close stream on error
    }
  })();

  // Node.js stream needs to be converted to a Web ReadableStream for NextResponse
  const stream = Readable.toWeb(passThrough);

  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${type}.xlsx"`,
    },
  });
}
