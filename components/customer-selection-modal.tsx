"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { useDebounce } from "use-debounce";

interface Customer {
  id: string;
  name: string;
  email?: string;
}

interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: { id: string; name: string }) => void;
}

export default function CustomerSelectionModal({
  isOpen,
  onClose,
  onSelectCustomer,
}: CustomerSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        q: debouncedSearch,
        page: page.toString(),
        limit: "10",
      });

      const res = await fetch(`/api/getcustomers?${params.toString()}`);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error: ${errorText}`);
      }

      const data = await res.json();

      if (data.success) {
        setCustomers(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error("API error:", data.message);
      }
    } catch (err) {
      console.error("❌ Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [debouncedSearch, isOpen, page]);

  const handleSelect = (customer: { id: string; name: string }) => {
    onSelectCustomer(customer);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Customer</DialogTitle>
          <DialogDescription>Search and select a customer for the order.</DialogDescription>
        </DialogHeader>

        {/* 🔍 Search */}
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on new search
            }}
            className="pl-8"
          />
        </div>

        {/* 📜 List */}
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid gap-2">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : customers.length > 0 ? (
              customers.map((customer) => (
                <Button
                  key={customer.id}
                  variant="outline"
                  className="justify-start bg-transparent"
                  onClick={() => handleSelect(customer)}
                >
                  {customer.name}
                </Button>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No customers found.</p>
            )}
          </div>
        </ScrollArea>

        {/* ⏮️ Pagination */}
        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
