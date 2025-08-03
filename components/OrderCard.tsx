"use client";

import React, { useTransition } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
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
import { Loader2, Trash2, Eye, CheckCircle2, Ban } from "lucide-react";
import { deleteOrder, updateOrderStatus } from "@/lib/actions/order.action";
import { toast } from "sonner";
import {
  Customer,
  Order,
  OrderItem,
  OrderStatus,
  Product,
} from "@prisma/client";
import OrderForm from "./OrderForm";

type OrderWithItems = Order & {
  customer: Customer;
  items: (OrderItem & { product: Product })[];
};
export default function OrderCard({
  order,
  removeOrderFromArray,
  updateStatus,
}: {
  order: OrderWithItems;
  removeOrderFromArray: (id: string) => void;
  updateStatus: (id: string, newStatus: OrderStatus) => void;
}) {
  const [isDeleting, startDeletion] = useTransition();
  const [openViewDialog, setOpenViewDialog] = React.useState(false);
  const [isUpdating, startUpdating] = useTransition();
  /*
order:{
items:[{
product
}]

}

 */
  const handleDelete = async (id: string) => {
    try {
      const res = await deleteOrder(id);

      if (!res.success) {
        toast.error("Failed to delete order");
        return;
      }

      removeOrderFromArray(id);
      toast.success("Order deleted successfully.");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete the order.");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(id, newStatus);
      if (!updatedOrder.success) {
        toast.error(updatedOrder.message || "Failed to update order status");
      }

      updateStatus(id, newStatus);
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error(`Failed to update order status`);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "PENDING":
        return "secondary";
      case "CANCELED":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base flex items-center gap-2">
            <span>Order #{order.id.slice(0, 6)}...</span>
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {order.status}
            </Badge>
          </CardTitle>
          <CardDescription>
            {format(new Date(order.createdAt), "dd MMM yyyy")}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Eye className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Order #{order.id.slice(0, 8)}</DialogTitle>
                <DialogDescription>
                  Placed on {format(new Date(order.createdAt), "dd MMM yyyy")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 text-sm">
                <div>
                  <strong>Status:</strong>{" "}
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <div>
                  <strong>Customer:</strong> {order.customer?.name || "Unknown"}
                </div>
                <div>
                  <strong>Total:</strong> PKR {order.totalAmount.toFixed(2)}
                </div>
                <div>
                  <strong>Order ID:</strong> {order.id}
                </div>

                <div>
                  <strong className="block mb-1 mt-4">Products:</strong>
                  {order.items.length === 0 ? (
                    <p className="text-muted-foreground">No products found.</p>
                  ) : (
                    <ul className="space-y-2">
                      {order.items.map(
                        (item) =>
                          item.product && (
                            <li
                              key={item.product.id}
                              className="border rounded-md p-2 text-sm bg-muted/40"
                            >
                              <div className="font-medium">
                                {item.product.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.product.category} | {item.product.unit}
                              </div>
                              <div>PKR {item.product.price.toFixed(2)}</div>
                            </li>
                          )
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog></Dialog>

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
                  This will permanently delete order{" "}
                  <strong className="text-foreground">{order.id}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => startDeletion(() => handleDelete(order.id))}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Customer:</span>{" "}
          {order.customer?.name || "Unknown"}
        </div>
        <div>
          <span className="font-medium">Total:</span> PKR{" "}
          {order.totalAmount.toFixed(2)}
        </div>

        {order.status === "PENDING" && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                startUpdating(() => handleUpdateStatus(order.id, "CANCELED"))
              }
              disabled={isUpdating}
            >
              <Ban className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                startUpdating(() => handleUpdateStatus(order.id, "COMPLETED"))
              }
              disabled={isUpdating}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Complete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
