"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "nextjs-toploader/app";
import { addProduct } from "@/lib/actions/product.action";
import ProductForm, { ProductFormValues } from "@/components/ProductForm";

export default function AddProductPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (data: ProductFormValues) => {
    startTransition(async () => {
      try {
        await addProduct(data);
        toast.success("Product added successfully!");
        router.push("/products");
      } catch (error) {
        console.error(error);
        toast.error("Failed to add product.");
      }
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <h1 className="font-semibold text-lg md:text-2xl">Add New Product</h1>
      </div>
      <ProductForm onSubmit={handleSubmit} isPending={isPending} />
    </div>
  );
}
