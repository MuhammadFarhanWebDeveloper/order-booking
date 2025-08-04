"use client";

import React, { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2, Trash2, Pencil } from "lucide-react";
import { deleteProduct, updateProduct } from "@/lib/actions/product.action";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import ProductForm, { ProductFormValues } from "./ProductForm";
import { Product, Role } from "@prisma/client";
import { useSession } from "next-auth/react";

export default function ProductCard({
  product,
  removeProductFromArray,
  updateClientSideProduct,
}: {
  product: Product;
  removeProductFromArray: (id: string) => void;
  updateClientSideProduct: (id: string, data: Product) => void;
}) {
  const [isDeleting, startDelete] = useTransition();
  const [isUpdating, startUpdate] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === Role.ADMIN;
  const isManager = session?.user?.role === Role.MANAGER;
  const isSalesAgent = session?.user?.role === Role.SALES_AGENT;

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteProduct(id);
      if (!res.success) {
        toast.error("Failed to delete product");
        return;
      }

      removeProductFromArray(id);
      toast.success("Product deleted successfully.");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete the product.");
    }
  };

  const handleUpdate = async (data: ProductFormValues) => {
    startUpdate(async () => {
      try {
        const res = await updateProduct(product.id, data);
        if (!res.success) {
          toast.error(res.message || "Update failed.");
          return;
        }

        if (!res.product) return;

        updateClientSideProduct(product.id, res.product);
        toast.success("Product updated!");
        setEditOpen(false);
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Something went wrong during update.");
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start space-x-2">
        <div className="flex-1">
          <CardTitle className="text-base">{product.name}</CardTitle>
          <CardDescription className="line-clamp-2 text-sm">
            {product.description || "No description provided."}
          </CardDescription>
        </div>
        <div className="flex gap-1">
          {/* Edit Button (opens modal) */}
          {isAdmin && (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Pencil className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <ProductForm
                  initialValues={{
                    ...product,
                    description: product.description || "",
                  }}
                  onSubmit={handleUpdate}
                  isPending={isUpdating}
                />
              </DialogContent>
            </Dialog>
          )}

          {/* Delete Button (alert dialog) */}
          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger disabled={isDeleting} asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                >
                  {isDeleting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete{" "}
                    <strong className="text-foreground">{product.name}</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => startDelete(() => handleDelete(product.id))}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Yes, delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Category:</span>{" "}
          <Badge variant="secondary">{product.category}</Badge>
        </div>
        <div>
          <span className="font-medium">Unit:</span> {product.unit}
        </div>
        <div>
          <span className="font-medium">Price:</span> PKR{" "}
          {product.price.toFixed(2)}
        </div>
      </CardContent>
    </Card>
  );
}
