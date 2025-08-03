"use client";

import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";
import OrderForm, { OrderFormValues } from "@/components/OrderForm";
import { addOrder } from "@/lib/actions/order.action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

export default function AddOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (data: OrderFormValues, totalAmount: number) => {
    setIsSubmitting(true);
    try {
      const result = await addOrder({
        customerId: data.customerId,
        productIds: data.items,
        status: data.status,
        totalAmount,
      });

      if (result.success) {
        toast.success("Order created successfully!");
        router.push("/orders");
      } else {
        toast.error(result.message || "Failed to create order.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <h1 className="font-semibold text-lg md:text-2xl">Add New Order</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
          <CardDescription>
            Choose customer, products and status below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
