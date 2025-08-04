"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import OrderCard from "@/components/OrderCard";
import {
  Customer,
  Order,
  OrderItem,
  OrderStatus,
  Product,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import { useDebounce } from "use-debounce";

type OrderWithItems = Order & {
  customer: Customer;
  items: (OrderItem & { product: Product })[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const isManager = session?.user?.role === "MANAGER";

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [timeFilter, setTimeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const updateOrderInArray = (id: string, updated: OrderWithItems) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updated } : o))
    );
  };

  const deletePreviousOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const updateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedSearchTerm,
        page: page.toString(),
        limit: "12",
        status: statusFilter,
        time: timeFilter,
      });

      const res = await fetch(`/api/getorders?${params}`);
      const data = await res.json();

      if (!res.ok || !data.success)
        throw new Error(data.message || "Unknown error");

      setOrders(data.data || []);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [debouncedSearchTerm, statusFilter, timeFilter, page]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="font-semibold text-lg md:text-2xl">Orders</h1>
        {(isAdmin || isManager) && (
          <Button asChild size="sm">
            <Link href="/orders/add">+ Add New Order</Link>
          </Button>
        )}
      </div>

      {/* 🔍 Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <Input
          placeholder="Search by Order ID, Customer Name, or Phone"
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
          className="md:w-1/3"
        />

        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setPage(1);
            setStatusFilter(val);
          }}
        >
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

        <Select
          value={timeFilter}
          onValueChange={(val) => {
            setPage(1);
            setTimeFilter(val);
          }}
        >
          <SelectTrigger className="w-full md:w-48">
            Time:{" "}
            {
              (
                {
                  ALL: "All Time",
                  TODAY: "Today",
                  "7_DAYS": "Last 7 Days",
                  "30_DAYS": "Last 30 Days",
                } as any
              )[timeFilter]
            }
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
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No matching orders found.</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                updateStatus={updateStatus}
                removeOrderFromArray={deletePreviousOrder}
                order={order}
                updateOrderInArray={updateOrderInArray}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center mt-6 gap-4">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Prev
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
