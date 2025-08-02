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
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return; // fetch only when modal is open
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/getcustomers");
        const data = await res.json();
        setCustomers(data.customers || []);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [isOpen]); // 👈 fetch only once when modal opens

  const filteredCustomers = customers.filter((customer: any) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (customer: { id: string; name: string }) => {
    onSelectCustomer(customer);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Customer</DialogTitle>
          <DialogDescription>
            Search for a customer and select them for the order.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="grid gap-2">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer: any) => (
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
              <p className="text-center text-muted-foreground">
                No customers found.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
