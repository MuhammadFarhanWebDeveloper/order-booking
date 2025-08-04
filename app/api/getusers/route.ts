import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";

type RoleFilter = Role | "ALL" | undefined;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const role = searchParams.get("role") as RoleFilter;
    const query = searchParams.get("q")?.trim() || "";

    const where = {
      ...(role && role !== "ALL" && { role }),
      ...(query && {
        OR: [
          { name: { contains: query } },
          { username: { contains: query } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return Response.json({
      success: true,
      users,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch users",
      }),
      { status: 500 }
    );
  }
}
