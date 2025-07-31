import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProducts } from "@/lib/actions/product.action";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-semibold text-lg md:text-2xl">Your Products</h1>
          <p className="text-muted-foreground text-sm">
            Manage and view your product inventory here.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/products/add">+ Add Product</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            List of products with all available variants and pricing in PKR.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Product</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Variants</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.description}
                  </TableCell>
                  <TableCell>
                    <ul className="space-y-1 text-sm">
                      {product.variants.map((variant, index) => (
                        <li key={index}>
                          <span className="font-medium">{variant.name}</span>:{" "}
                          {variant.price}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
