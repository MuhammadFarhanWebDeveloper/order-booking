"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomerForm, {
  CustomerFormValues,
} from "@/components/CustomerForm";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { toast } from "sonner";
import { addCustomer } from "@/lib/actions/customer.action";

export default function AddCustomerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await addCustomer(data);

      if (result.success) {
        toast.success("Customer added successfully.");
        router.push("/customers");
      } else {
        toast.error("Failed to add customer");

        if (result.errors) {
          // Optional: handle field errors if needed
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Add New Customer</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>
            Enter the details for the new customer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
