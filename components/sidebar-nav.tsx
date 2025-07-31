"use client"

import Link from "next/link"
import { Package2, Home, ShoppingCart, Users, Package, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePathname } from "next/navigation"

export function SidebarNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/orders", icon: ShoppingCart, label: "Orders", badge: 6 },
    { href: "/products", icon: Package, label: "Products" },
    { href: "/customers", icon: Users, label: "Customers" },
  ]

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-[60px] items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package2 className="h-6 w-6" />
          <span className="">Acme Orders</span>
        </Link>
        <Button variant="outline" size="icon" className="ml-auto h-8 w-8 bg-transparent">
          <CalendarDays className="h-4 w-4" />
          <span className="sr-only">View Calendar</span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.badge && (
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <p className="text-xs text-muted-foreground">© 2025 Acme Orders. All rights reserved.</p>
      </div>
    </div>
  )
}
