"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { format, isToday, subDays, isAfter } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

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
  const [filteredOrders, setFilteredOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [timeFilter, setTimeFilter] = useState("ALL");

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

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();

    const filtered = orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(lowerSearch) ||
        order.customer.name?.toLowerCase().includes(lowerSearch) ||
        order.customer.phone?.toLowerCase().includes(lowerSearch);

      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      const createdAt = new Date(order.createdAt);
      const now = new Date();

      const matchesTime =
        timeFilter === "ALL"
          ? true
          : timeFilter === "TODAY"
          ? isToday(createdAt)
          : timeFilter === "7_DAYS"
          ? isAfter(createdAt, subDays(now, 7))
          : timeFilter === "30_DAYS"
          ? isAfter(createdAt, subDays(now, 30))
          : true;

      return matchesSearch && matchesStatus && matchesTime;
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, timeFilter]);

  const deletePreviousOrder = (id: string) => {
    setOrders((prev) => prev.filter((p) => p.id !== id));
  };

  const updateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="font-semibold text-lg md:text-2xl">Orders</h1>
        <Button asChild size="sm">
          <Link href="/orders/add">+ Add New Order</Link>
        </Button>
      </div>

      {/* 🔍 Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <Input
          placeholder="Search by Order ID, Customer Name, or Phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-1/3"
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            Status: {statusFilter === "ALL" ? "All" : statusFilter}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELED">Canceled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full md:w-48">
            Time:{" "}
            {{
              ALL: "All time",
              TODAY: "Today",
              "7_DAYS": "Last 7 days",
              "30_DAYS": "Last 30 days",
            }[timeFilter]}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Time</SelectItem>
            <SelectItem value="TODAY">Today</SelectItem>
            <SelectItem value="7_DAYS">Last 7 Days</SelectItem>
            <SelectItem value="30_DAYS">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-muted-foreground">No matching orders found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              updateStatus={updateStatus}
              removeOrderFromArray={deletePreviousOrder}
              order={order}
            />
          ))}
        </div>
      )}
    </div>
  );
}
