"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  status: "COMPLETED" | "PENDING" | "CANCELED";
  createdAt: string;
  totalAmount: number;
  customer: {
    name: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/getorders");
        if (!res.ok) throw new Error("Failed to fetch orders");

        const data = await res.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="font-semibold text-lg md:text-2xl">Orders</h1>
        <Button asChild size="sm">
          <Link href="/orders/add">+ Add New Order</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No orders found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Order #{order.id.slice(0, 6)}...</span>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {format(new Date(order.createdAt), "dd MMM yyyy")}
                </CardDescription>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
