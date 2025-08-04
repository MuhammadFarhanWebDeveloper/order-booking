"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CustomerCard from "@/components/CustomerCard";
import type { CustomerFormValues } from "@/components/CustomerForm";
import { useSession } from "next-auth/react";
import { useDebounce } from "use-debounce"; // 👈 new

type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 400); // 👈 debounce for 400ms
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const deletePreviousCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCustomerInArray = (id: string, updated: CustomerFormValues) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedSearchTerm,
        page: page.toString(),
        limit: limit.toString(),
      });

      const res = await fetch(`/api/getcustomers?${params}`);
      const data = await res.json();

      if (data.success) {
        setCustomers(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error(`Failed to fetch customers: ${data.message}`);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("An unexpected error occurred while fetching customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [debouncedSearchTerm, page]); // 👈 trigger only when debounced term or page changes

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="font-semibold text-lg md:text-2xl">Customers</h1>
        {isAdmin && (
          <Button asChild size="sm">
            <Link href="/customers/add">+ Add New Customer</Link>
          </Button>
        )}
      </div>

      {/* 🔍 Search Input */}
      <div className="mb-6">
        <Input
          placeholder="Search by name, phone, or address"
          value={searchTerm}
          onChange={(e) => {
            setPage(1); // Reset to page 1 when searching
            setSearchTerm(e.target.value);
          }}
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading customers...</p>
      ) : customers.length === 0 ? (
        <p className="text-muted-foreground">No matching customers found.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                removeCustomerFromArray={deletePreviousCustomer}
                updateCustomerInArray={updateCustomerInArray}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
