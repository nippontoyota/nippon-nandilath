import { NextRequest, NextResponse } from "next/server";
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

export async function GET(req: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "all";
  const outcomeFilter = searchParams.get("outcome") || "all";
  const dateFilter = searchParams.get("date") || "";

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

  if (dateFilter) {
    const startDate = new Date(`${dateFilter}T00:00:00.000+05:30`);
    const endDate = new Date(`${dateFilter}T23:59:59.999+05:30`);
    whereClause.createdAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  // Get total counts
  const totalResponses = await prisma.entry.count({ where: whereClause });
  
  // Get grouped outcomes for connected and disconnected
  const groupedOutcomes = await prisma.entry.groupBy({
    by: ['callStatus', 'callOutcome'],
    where: whereClause,
    _count: { id: true },
  });

  // Calculate stats
  let totalConnected = 0;
  let totalDisconnected = 0;
  let totalPending = 0;

  const connectedBreakdown: Record<string, number> = {};
  const disconnectedBreakdown: Record<string, number> = {};

  groupedOutcomes.forEach((group) => {
    const count = group._count.id;
    if (group.callStatus === 'Connected') {
      totalConnected += count;
      if (group.callOutcome) {
        connectedBreakdown[group.callOutcome] = count;
      }
    } else if (group.callStatus === 'Not Connected') {
      totalDisconnected += count;
      if (group.callOutcome) {
        disconnectedBreakdown[group.callOutcome] = count;
      }
    } else {
      totalPending += count;
    }
  });

  // Fetch the actual entries for the table
  const entries = await prisma.entry.findMany({
    where: whereClause,
    orderBy: { createdAt: "asc" },
    select: {
      name: true,
      phone: true,
      callStatus: true,
      callOutcome: true,
    },
  });

  return NextResponse.json({
    totalResponses,
    totalConnected,
    connectedBreakdown,
    totalDisconnected,
    disconnectedBreakdown,
    totalPending,
    entries
  });
}
