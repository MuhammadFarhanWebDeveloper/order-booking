"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useDebounce } from "use-debounce";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProducts: (products: Product[]) => void;
  initialSelectedProductIds: string[];
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  onSelectProducts,
  initialSelectedProductIds,
}: ProductSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setSelectedProductIds(initialSelectedProductIds);
  }, [initialSelectedProductIds]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        q: debouncedSearch,
        page: page.toString(),
        limit: "10",
        category: "ALL",
      });

      const res = await fetch(`/api/getproducts?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error("Failed to fetch products:", data.message);
      }
    } catch (err) {
      console.error("❌ Error loading products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [debouncedSearch, isOpen, page]);

  const handleCheckboxChange = (productId: string, checked: boolean) => {
    setSelectedProductIds((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  };

  const handleConfirm = () => {
    const selectedItems = products.filter((p) =>
      selectedProductIds.includes(p.id)
    );
    onSelectProducts(selectedItems);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Products</DialogTitle>
          <DialogDescription>
            Search and select products for the order.
          </DialogDescription>
        </DialogHeader>

        {/* 🔍 Search */}
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on new search
            }}
            className="pl-8"
          />
        </div>

        {/* 📜 Product List */}
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid gap-2">
            {loading ? (
              <p className="text-muted-foreground text-center">
                Loading products...
              </p>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center space-x-2 p-2 border rounded-md"
                >
                  <Checkbox
                    id={`product-${product.id}`}
                    checked={selectedProductIds.includes(product.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(product.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`product-${product.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    {product.name} – PKR {product.price.toFixed(2)}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                No products found.
              </p>
            )}
          </div>
        </ScrollArea>

        {/* 🔁 Pagination Controls */}
        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>

        {/* ✅ Footer */}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
