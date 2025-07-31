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

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, XCircle } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner"; // or your toast lib
import { addProduct } from "@/lib/actions/product.action";
import { useRouter } from "next/navigation";

const variantSchema = z.object({
  name: z.string().min(1, { message: "Variant name is required." }),
  price: z.coerce.number().min(0, { message: "Price must be non-negative." }),
});

const formSchema = z.object({
  name: z.string().min(1, { message: "Product name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  variants: z.array(variantSchema).min(1, {
    message: "At least one variant is required.",
  }),
});

// 🧠 Infer the **input type** (before coercion)
type ProductFormValues = z.input<typeof formSchema>;

export default function AddProductPage() {
  const router = useRouter()
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      variants: [{ name: "", price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: ProductFormValues) => {
    startTransition(async () => {
      try {
        await addProduct(data);
        toast.success("Product added successfully!");
        router.push("/products")
      } catch (err: any) {
        console.error(err);
        toast.error("Something went wrong while adding the product.");
      }
    });
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <h1 className="font-semibold text-lg md:text-2xl">Add New Product</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Enter the product details and at least one variant.
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
                      <Textarea placeholder="Brief description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Variants */}
              <div className="grid gap-2">
                <FormLabel>Variants</FormLabel>
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end border p-4 rounded-md"
                  >
                    <FormField
                      control={form.control}
                      name={`variants.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={index === 0 ? "" : "sr-only"}>
                            Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Black" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`variants.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={index === 0 ? "" : "sr-only"}>
                            Price
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={0.1}
                              placeholder="9999"
                              {...field}
                              value={field.value as number}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="justify-self-end"
                      >
                        <XCircle className="h-5 w-5 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: "", price: 0 })}
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
                {form.formState.errors.variants && (
                  <p className="text-sm text-destructive mt-2 font-medium">
                    {form.formState.errors.variants.message}
                  </p>
                )}
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
