"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import ProductCard from "@/components/ProductCard";
import { Product } from "@prisma/client";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const deletePreviousProduct = (id: string) => {
    setProducts((prev: any) => prev.filter((p: any) => p.id !== id));
  };

  const handleUpdateProduct = (id: string, data: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => (product.id == id ? data : product))
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/getproducts");
        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Something went wrong while fetching products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
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

      {loading ? (
        <p className="text-muted-foreground">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
            updateClientSideProduct={handleUpdateProduct}
              key={product.id}
              product={product}
              removeProductFromArray={deletePreviousProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
