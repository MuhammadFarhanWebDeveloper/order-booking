import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        orderItems: true, // Optional: remove if not needed
      },
    });

    return Response.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch products",
      }),
      { status: 500 }
    );
  }
}
