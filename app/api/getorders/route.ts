import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { isToday, subDays, isAfter } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);
    const skip = (page - 1) * limit;

    const query = searchParams.get("q")?.trim().toLowerCase() || "";
    const status = searchParams.get("status")?.toUpperCase() || "ALL";
    const time = searchParams.get("time")?.toUpperCase() || "ALL";

    // Build WHERE clause dynamically
    const where: any = {};

    if (query) {
      where.OR = [
        { id: { contains: query } },
        { customer: { name: { contains: query } } },
        { customer: { phone: { contains: query } } },
      ];
    }

    if (status !== "ALL") {
      where.status = status;
    }

    if (time !== "ALL") {
      const now = new Date();
      let dateFilter: Date | null = null;

      if (time === "TODAY") {
        where.createdAt = {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        };
      } else if (time === "7_DAYS") {
        dateFilter = subDays(now, 7);
      } else if (time === "30_DAYS") {
        dateFilter = subDays(now, 30);
      }

      if (dateFilter && time !== "TODAY") {
        where.createdAt = {
          gte: dateFilter,
        };
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          items: {
            include: { product: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return Response.json({
      success: true,
      data: orders,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch orders",
      }),
      { status: 500 }
    );
  }
}
