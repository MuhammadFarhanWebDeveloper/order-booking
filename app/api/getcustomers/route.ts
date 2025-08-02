import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" }, 
    });

    return Response.json({
      success: true,
    customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch customers",
      }),
      { status: 500 }
    );
  }
}
