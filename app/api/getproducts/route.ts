import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { Category, Prisma } from "@prisma/client";

type CategoryFilter = Category | "ALL" | undefined;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    const query = searchParams.get("q")?.trim().toLowerCase() || "";
    const category = searchParams.get("category") as CategoryFilter;

    const where: Prisma.ProductWhereInput = {
      ...(query && {
        name: {
          contains: query,
        },
      }),
      ...(category && category !== "ALL"
        ? { category }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          orderItems: true, // remove if not needed
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return Response.json({
      success: true,
      data: products,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch products",
      }),
      { status: 500 }
    );
  }
}
