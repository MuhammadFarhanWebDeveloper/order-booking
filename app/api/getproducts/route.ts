import { getProducts } from "@/lib/actions/product.action";

export async function GET() {
  const products = await getProducts();

  return Response.json({ products });
}
