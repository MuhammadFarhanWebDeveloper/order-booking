"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CustomerCard from "@/components/CustomerCard";
import type { CustomerFormValues } from "@/components/CustomerForm";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const deletePreviousCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCustomerInArray = (id: string, updated: CustomerFormValues) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/getcustomers");
        const data = await res.json();

        if (data.success) {
          setCustomers(data.customers || []);
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

    fetchCustomers();
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();

    const filtered = customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(lowerSearch) ||
        c.phone?.toLowerCase().includes(lowerSearch) ||
        c.address?.toLowerCase().includes(lowerSearch)
      );
    });

    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="font-semibold text-lg md:text-2xl">Customers</h1>
        <Button asChild size="sm">
          <Link href="/customers/add">+ Add New Customer</Link>
        </Button>
      </div>

      {/* 🔍 Search Input */}
      <div className="mb-6">
        <Input
          placeholder="Search by name, phone, or address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading customers...</p>
      ) : filteredCustomers.length === 0 ? (
        <p className="text-muted-foreground">No matching customers found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              removeCustomerFromArray={deletePreviousCustomer}
              updateCustomerInArray={updateCustomerInArray}
            />
          ))}
        </div>
      )}
    </div>
  );
}
