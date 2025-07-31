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
      Working on this feature...
    </div>
  )
}
