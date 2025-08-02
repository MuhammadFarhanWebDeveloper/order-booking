"use client";

import { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CustomerSelectionModal from "@/components/customer-selection-modal";
import ProductSelectionModal from "@/components/product-selection-modal";
import { addOrder } from "@/lib/actions/order.action";
import z from "zod";
import { X } from "lucide-react"; // Import X icon for removing products

// 💡 Schema
const formSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required." }),
  status: z.enum(["PENDING", "COMPLETED", "CANCELED"]),
  items: z
    .array(z.string())
    .min(1, { message: "Select at least one product." }),
});

type OrderFormValues = z.infer<typeof formSchema>;

export default function AddOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustModalOpen, setCustModalOpen] = useState(false);
  const [isProdModalOpen, setProdModalOpen] = useState(false);
  const [customer, setCustomer] = useState<{ id: string; name: string } | null>(
    null
  );
  const [products, setProducts] = useState<
    { id: string; name: string; price: number }[]
  >([]);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      status: "PENDING",
      items: [],
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Update form value when customer selected
  useEffect(() => {
    form.setValue("customerId", customer?.id || "", { shouldDirty: true });
  }, [customer, form]);

  // Update form value when products selected
  useEffect(() => {
    form.setValue(
      "items",
      products.map((p) => p.id),
      { shouldDirty: true }
    );
  }, [products, form]);

  // Clear error on modal close
  useEffect(() => {
    if (!isCustModalOpen) form.clearErrors("customerId");
  }, [isCustModalOpen]);

  useEffect(() => {
    if (!isProdModalOpen) form.clearErrors("items");
  }, [isProdModalOpen]);

  const totalAmount = products.reduce((sum, p) => sum + p.price, 0);

  const handleRemoveProduct = (productId: string) => {
    setProducts((prevProducts) =>
      prevProducts.filter((p) => p.id !== productId)
    );
  };

  const handleClearCustomer = () => {
    setCustomer(null);
  };

  const onSubmit = async (data: OrderFormValues) => {
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
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, msg]) => {
            form.setError(field as keyof OrderFormValues, {
              type: "manual",
              message: msg as string,
            });
          });
        }
      }
    } catch (err) {
      console.error(err);
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
          <Form {...form}>
            <form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Customer Field */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          value={customer?.name || ""}
                          placeholder="Select customer"
                          readOnly
                        />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={() => setCustModalOpen(true)}
                        variant="outline"
                      >
                        Select
                      </Button>
                      {customer && (
                        <Button
                          type="button"
                          onClick={handleClearCustomer}
                          variant="ghost"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Products Field */}
              <FormField
                control={form.control}
                name="items"
                render={() => (
                  <FormItem>
                    <FormLabel>Products</FormLabel>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] items-center">
                      {products.length > 0 ? (
                        products.map((p) => (
                          <Badge
                            key={p.id}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1"
                          >
                            <span>
                              {p.name} – PKR {p.price}
                            </span>
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
                      variant="outline"
                      className="mt-2"
                    >
                      Select Products
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Field */}
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

              {/* Total */}
              <div className="text-right font-bold text-xl mt-4">
                Total: PKR {totalAmount.toFixed(2)}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4"
              >
                {isSubmitting ? "Adding Order..." : "Add Order"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

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
    </div>
  );
}
