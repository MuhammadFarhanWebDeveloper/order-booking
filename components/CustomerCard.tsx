"use client";
import React, { useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { deleteCustomer } from "@/lib/actions/customer.action";
import { toast } from "sonner";
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
import { Button } from "./ui/button";
import { Loader2, Trash2 } from "lucide-react";

export default function CustomerCard({
  customer,
  removeCustomerFromArray,
}: {
  customer: { name: string; id: string; email?: string; phone?: string };
  removeCustomerFromArray: (id: string) => void;
}) {
  const [isDeleting, startDeletion] = useTransition();

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteCustomer(id);

      if (!res.success) {
        toast.error("Failed to delete customer");
        return;
      }

      removeCustomerFromArray(id);
      toast.success("Customer deleted successfully.");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete the customer.");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-base">{customer.name}</CardTitle>
          <CardDescription className="text-xs break-all">
            ID: {customer.id}
          </CardDescription>
        </div>
        <AlertDialog>
          <AlertDialogTrigger disabled={isDeleting} asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 cursor-pointer hover:text-red-700"
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
                This action cannot be undone. This will permanently delete the
                customer
                <strong className="text-foreground">{customer.name}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => startDeletion(() => handleDelete(customer.id))}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <div>
          <span className="font-medium">Email:</span> {customer.email || "N/A"}
        </div>
        <div>
          <span className="font-medium">Phone:</span> {customer.phone || "N/A"}
        </div>
      </CardContent>
    </Card>
  );
}
