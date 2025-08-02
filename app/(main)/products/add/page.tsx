"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { addProduct } from "@/lib/actions/product.action";
import { useRouter } from "nextjs-toploader/app";
// Schema with enums
const formSchema = z.object({
  name: z.string().min(1, { message: "Product name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  category: z.enum([
    "ELECTRONICS",
    "GROCERY",
    "CLOTHING",
    "STATIONERY",
    "BEAUTY",
    "FURNITURE",
    "TOYS",
    "MEDICINE",
    "OTHER",
  ]),
  price: z.coerce.number().min(0, { message: "Price must be non-negative." }),
  unit: z.enum([
    "PIECE",
    "GRAM",
    "KILOGRAM",
    "LITRE",
    "MILLILITRE",
    "METER",
    "CENTIMETER",
    "BOX",
    "PACK",
  ]),
});

type ProductFormValues = z.infer<typeof formSchema>;

export default function AddProductPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      category: "OTHER",
      price: 0,
      unit: "PIECE",
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    startTransition(async () => {
      try {
        await addProduct(data);
        toast.success("Product added successfully!");
        router.push("/products");
      } catch (err: any) {
        console.error(err);
        toast.error("Something went wrong while adding the product.");
      }
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <h1 className="font-semibold text-lg md:text-2xl">Add New Product</h1>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Enter complete product details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wireless Mouse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief product description..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Group Category, Price, and Unit on the same line */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formSchema.shape.category.options.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0) +
                                category.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (PKR)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formSchema.shape.unit.options.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit.charAt(0) + unit.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Adding..." : "Add Product"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
