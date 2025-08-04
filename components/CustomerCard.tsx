"use client";

import React, { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { deleteCustomer, updateCustomer } from "@/lib/actions/customer.action";
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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2, Trash2, Pencil, Eye } from "lucide-react";
import CustomerForm, { CustomerFormValues } from "@/components/CustomerForm";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

export default function CustomerCard({
  customer,
  removeCustomerFromArray,
  updateCustomerInArray,
}: {
  customer: {
    name: string;
    id: string;
    email?: string;
    phone?: string;
    address?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  removeCustomerFromArray: (id: string) => void;
  updateCustomerInArray: (id: string, updated: CustomerFormValues) => void;
}) {
  const [isDeleting, startDeletion] = useTransition();
  const [isUpdating, setIsUpdating] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false); // 👈 New

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === Role.ADMIN;
  const isManager = session?.user?.role === Role.MANAGER;
  const isSalesAgent = session?.user?.role === Role.SALES_AGENT;

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteCustomer(id);

      if (!res.success) {
        toast.error(res.message || "Failed to delete customer");
        return;
      }

      removeCustomerFromArray(id);
      toast.success("Customer deleted successfully.");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete the customer.");
    }
  };

  const handleUpdate = async (data: CustomerFormValues) => {
    setIsUpdating(true);
    try {
      const result = await updateCustomer(customer.id, data);

      if (!result.success) {
        toast.error("Failed to update customer");
        return;
      }

      toast.success("Customer updated successfully.");
      updateCustomerInArray(customer.id, data);
      setOpenEditDialog(false);
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsUpdating(false);
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

        <div className="flex gap-2">
          {/* View Button */}

          <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Customer Details</DialogTitle>
                <DialogDescription>
                  Here's everything we know.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Name:</strong> {customer.name}
                </div>
                <div>
                  <strong>Email:</strong> {customer.email || "N/A"}
                </div>
                <div>
                  <strong>Phone:</strong> {customer.phone || "N/A"}
                </div>
                <div>
                  <strong>Address:</strong> {customer.address || "N/A"}
                </div>
                {customer.createdAt && (
                  <div>
                    <strong>Created:</strong>{" "}
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </div>
                )}
                {customer.updatedAt &&
                  !(customer.updatedAt === customer.createdAt) && (
                    <div>
                      <strong>Last Updated:</strong>{" "}
                      {new Date(customer.updatedAt).toLocaleDateString()}
                    </div>
                  )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Button */}
          {isSalesAgent ? (
            ""
          ) : (
            <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Customer</DialogTitle>
                </DialogHeader>
                <CustomerForm
                  initialValues={{
                    name: customer.name,
                    email: customer.email || "",
                    phone: customer.phone || "",
                    address: customer.address || "",
                  }}
                  onSubmit={handleUpdate}
                  isSubmitting={isUpdating}
                />
              </DialogContent>
            </Dialog>
          )}
          {/* Delete Button */}
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
                    <strong className="text-foreground">{customer.name}</strong>
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() =>
                      startDeletion(() => handleDelete(customer.id))
                    }
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
