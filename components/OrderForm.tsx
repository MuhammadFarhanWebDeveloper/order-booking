"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import CustomerSelectionModal from "@/components/customer-selection-modal";
import ProductSelectionModal from "@/components/product-selection-modal";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const formSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  status: z.enum(["PENDING", "COMPLETED", "CANCELED"]),
  items: z.array(z.string()).min(1, "Select at least one product."),
});

export type OrderFormValues = z.infer<typeof formSchema>;

type Product = { id: string; name: string; price: number };
type Customer = { id: string; name: string };

interface OrderFormProps {
  initialData?: {
    id?: string;
    customerId: string;
    status: "PENDING" | "COMPLETED" | "CANCELED";
    items: string[];
    customer?: Customer;
    productList?: Product[];
  };
  onSubmit: (data: OrderFormValues, totalAmount: number) => Promise<void>;
  isSubmitting: boolean;
}

export default function OrderForm({
  initialData,
  onSubmit,
  isSubmitting,
}: OrderFormProps) {
  const [isCustModalOpen, setCustModalOpen] = useState(false);
  const [isProdModalOpen, setProdModalOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(
    initialData?.customer || null
  );
  const [products, setProducts] = useState<Product[]>(
    initialData?.productList || []
  );

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: initialData?.customerId || "",
      status: initialData?.status || "PENDING",
      items: initialData?.items || [],
    },
  });

  useEffect(() => {
    form.setValue("customerId", customer?.id || "", { shouldDirty: true });
  }, [customer]);

  useEffect(() => {
    form.setValue(
      "items",
      products.map((p) => p.id),
      { shouldDirty: true }
    );
  }, [products]);

  const totalAmount = products.reduce((sum, p) => sum + p.price, 0);

  const handleRemoveProduct = (id: string) =>
    setProducts((prev) => prev.filter((p) => p.id !== id));

  const handleClearCustomer = () => setCustomer(null);

  const submitHandler = async (data: OrderFormValues) => {
    await onSubmit(data, totalAmount);
  };

  return (
    <Form {...form}>
      <form className="grid gap-6" onSubmit={form.handleSubmit(submitHandler)}>
        <FormField
          control={form.control}
          name="customerId"
          render={() => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    value={customer?.name || ""}
                    readOnly
                    placeholder="Select customer"
                  />
                </FormControl>
                <Button type="button" onClick={() => setCustModalOpen(true)}>
                  Select
                </Button>
                {customer && (
                  <Button type="button" variant="ghost" onClick={handleClearCustomer}>
                    Clear
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="items"
          render={() => (
            <FormItem>
              <FormLabel>Products</FormLabel>
              <div className="flex flex-wrap gap-2 border p-2 rounded-md min-h-[40px] items-center">
                {products.length > 0 ? (
                  products.map((p) => (
                    <Badge
                      key={p.id}
                      className="flex items-center gap-1 pr-1"
                    >
                      <span>{p.name} – PKR {p.price}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full"
                        onClick={() => handleRemoveProduct(p.id)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {p.name}</span>
                      </Button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No products selected.
                  </span>
                )}
              </div>
              <Button
                type="button"
                onClick={() => setProdModalOpen(true)}
                className="mt-2"
              >
                Select Products
              </Button>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELED">Canceled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-right font-bold text-xl mt-4">
          Total: PKR {totalAmount.toFixed(2)}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
          {isSubmitting
            ? initialData ? "Updating Order..." : "Adding Order..."
            : initialData ? "Update Order" : "Add Order"}
        </Button>
      </form>

      {/* Modals */}
      <CustomerSelectionModal
        isOpen={isCustModalOpen}
        onClose={() => setCustModalOpen(false)}
        onSelectCustomer={setCustomer}
      />
      <ProductSelectionModal
        isOpen={isProdModalOpen}
        onClose={() => setProdModalOpen(false)}
        onSelectProducts={(list) =>
          setProducts(list.map((p) => ({ ...p, price: p.price })))
        }
        initialSelectedProductIds={products.map((p) => p.id)}
      />
    </Form>
  );
}
