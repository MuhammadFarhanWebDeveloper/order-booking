import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }, 
    });

    return Response.json({
      success: true,
    users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch users",
      }),
      { status: 500 }
    );
  }
}
