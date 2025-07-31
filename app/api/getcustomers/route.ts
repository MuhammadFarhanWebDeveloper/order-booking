import { getCustomers } from "@/lib/actions/customer.action";

export async function GET() {
  const customers = await getCustomers();

  return Response.json({ customers });
}
