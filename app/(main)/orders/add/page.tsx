"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import CustomerSelectionModal from "@/components/customer-selection-modal"
import ProductSelectionModal from "@/components/product-selection-modal"

const formSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required." }),
  status: z.enum(["PENDING", "COMPLETED", "CANCELED"]),
  items: z
    .array(z.string().min(1, { message: "Invalid product id found" }))
    .min(1, { message: "At least one product must be selected." }),
})

type OrderFormValues = z.infer<typeof formSchema>

export default function AddOrderPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string
    name: string
  } | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<{ id: string; name: string }[]>([])

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "PENDING",
      items: [],
      customerId: "",
    },
  })

  // Effect to update form values when selectedCustomer or selectedProducts change
  React.useEffect(() => {
    if (selectedCustomer) {
      form.setValue("customerId", selectedCustomer.id, { shouldValidate: true })
    } else {
      form.setValue("customerId", "", { shouldValidate: true })
    }
  }, [selectedCustomer, form])

  React.useEffect(() => {
    form.setValue(
      "items",
      selectedProducts.map((p) => p.id),
      { shouldValidate: true },
    )
  }, [selectedProducts, form])

  const onSubmit = async (data: OrderFormValues) => {
    setIsSubmitting(true)
    try {
      // Simulate API call for addOrder
      // In a real application, you would call your server action here:
      // const result = await addOrder(data);
      console.log("Submitting order data:", data)
      const result = { success: true } // Placeholder for actual server action result

      if (result.success) {
        toast.success("Order added successfully.")
        router.push("/orders")
      } else {
        toast.error("Failed to add order")
        // if (result.errors) { // Uncomment if your action returns errors
        //   Object.entries(result.errors).forEach(([field, message]) => {
        //     form.setError(field as keyof OrderFormValues, {
        //       type: "manual",
        //       message: message as string,
        //     });
        //   });
        // }
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectCustomer = (customer: { id: string; name: string }) => {
    setSelectedCustomer(customer)
  }

  const handleSelectProducts = (products: { id: string; name: string }[]) => {
    setSelectedProducts(products)
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <h1 className="font-semibold text-lg md:text-2xl">Add New Order</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
          <CardDescription>Enter the details for the new order.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              {/* Customer Selection */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Select a customer"
                          value={selectedCustomer?.name || ""}
                          readOnly
                          className="flex-1"
                        />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={() => setIsCustomerModalOpen(true)}>
                        Select Customer
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Selection */}
              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Products</FormLabel>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] items-center">
                      {selectedProducts.length > 0 ? (
                        selectedProducts.map((product) => (
                          <Badge key={product.id} variant="secondary">
                            {product.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No products selected.</span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsProductModalOpen(true)}
                      className="mt-2"
                    >
                      Select Products
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Selection */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select order status" />
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Adding Order..." : "Add Order"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <CustomerSelectionModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={handleSelectCustomer}
      />

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelectProducts={handleSelectProducts}
        initialSelectedProductIds={selectedProducts.map((p) => p.id)}
      />
    </div>
  )
}
