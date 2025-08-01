"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/getcustomers");
        const data = await res.json();

        if (data.success) {
          setCustomers(data.customers || []); // data.customers → data.data (based on improved API response)
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="font-semibold text-lg md:text-2xl">Customers</h1>
        <Button asChild size="sm">
          <Link href="/customers/add">+ Add New Customer</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading customers...</p>
      ) : customers.length === 0 ? (
        <p className="text-muted-foreground">No customers found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{customer.name}</CardTitle>
                <CardDescription className="text-xs break-all">
                  ID: {customer.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {customer.email || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Phone:</span>{" "}
                  {customer.phone || "N/A"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
