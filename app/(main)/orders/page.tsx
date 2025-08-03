"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import OrderCard from "@/components/OrderCard";
import {
  Customer,
  Order,
  OrderItem,
  OrderStatus,
  Product,
} from "@prisma/client";

type OrderWithItems = Order & {
  customer: Customer;
  items: (OrderItem & { product: Product })[];
};


export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const deletePreviousOrder = (id: string) => {
    setOrders((prev: any) => prev.filter((p: any) => p.id !== id));
  };
  const updateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
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
            <OrderCard
              updateStatus={updateStatus}
              removeOrderFromArray={deletePreviousOrder}
              order={order}
              key={order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
