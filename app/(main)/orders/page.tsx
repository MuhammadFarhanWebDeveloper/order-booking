import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function OrdersPage() {
  const orders = [
    { id: "#ORD001", customer: "Alice Smith", date: "2025-07-29", total: "$120.00", status: "Completed" },
    { id: "#ORD002", customer: "Bob Johnson", date: "2025-07-28", total: "$75.50", status: "Pending" },
    { id: "#ORD003", customer: "Charlie Brown", date: "2025-07-27", total: "$200.00", status: "Shipped" },
    { id: "#ORD004", customer: "Diana Prince", date: "2025-07-26", total: "$45.00", status: "Cancelled" },
    { id: "#ORD005", customer: "Eve Adams", date: "2025-07-25", total: "$300.00", status: "Completed" },
  ]

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default"
      case "Pending":
        return "secondary"
      case "Shipped":
        return "outline"
      case "Cancelled":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Orders</h1>
        <Button asChild size="sm">
          <Link href="/orders/add">Add New Order</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>A list of your recent orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="hidden md:table-cell">{order.date}</TableCell>
                  <TableCell className="text-right">{order.total}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
