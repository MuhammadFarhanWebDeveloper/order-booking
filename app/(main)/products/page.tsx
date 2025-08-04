"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import ProductCard from "@/components/ProductCard";
import { Product, Role } from "@prisma/client";
import { useDebounce } from "use-debounce";

const CATEGORIES = [
  "ALL",
  "ELECTRONICS",
  "GROCERY",
  "CLOTHING",
  "STATIONERY",
  "BEAUTY",
  "FURNITURE",
  "TOYS",
  "MEDICINE",
  "OTHER",
] as const;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [page, setPage] = useState(1);

  const [debouncedSearch] = useDebounce(searchTerm, 400);
  const [totalPages, setTotalPages] = useState(1);

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === Role.ADMIN;
  const isManager = session?.user?.role === Role.MANAGER;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedSearch,
        category: selectedCategory,
        page: String(page),
        limit: "9",
      });

      const res = await fetch(`/api/getproducts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      setProducts(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      toast.error("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, selectedCategory, page]);

  const deletePreviousProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateProduct = (id: string, data: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-semibold text-lg md:text-2xl">Your Products</h1>
          <p className="text-muted-foreground text-sm">
            Manage and view your product inventory here.
          </p>
        </div>
        {isAdmin && (
          <Button asChild size="sm">
            <Link href="/products/add">+ Add Product</Link>
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search by name or description..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1); // reset to first page on search
          }}
          className="w-full sm:w-1/2"
        />
        <Select
          value={selectedCategory}
          onValueChange={(val) => {
            setSelectedCategory(val);
            setPage(1); // reset to first page on filter change
          }}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === "ALL" ? "All Categories" : cat[0] + cat.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      {loading ? (
        <p className="text-muted-foreground">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                removeProductFromArray={deletePreviousProduct}
                updateClientSideProduct={handleUpdateProduct}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
