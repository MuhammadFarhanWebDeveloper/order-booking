"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { Product } from "@prisma/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const deletePreviousProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateProduct = (id: string, data: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => (product.id === id ? data : product))
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

  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(unique)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(lowerSearch) ||
        product.description?.toLowerCase().includes(lowerSearch);

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

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

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search by name or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2"
        />
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category[0].toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <p className="text-muted-foreground">Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-muted-foreground">
          No products match your criteria.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
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
