"use client"

import { useState, useEffect, use } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"


interface ProductSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectProducts: (products: { id: string; name: string }[]) => void
  initialSelectedProductIds: string[]
}

const getProducts = async () => {
  const res = await fetch("/api/getproducts");
  const data = await res.json();
  return data.products;
};

export default function ProductSelectionModal({
  isOpen,
  onClose,
  onSelectProducts,
  initialSelectedProductIds,
}: ProductSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
    // const products = use(getProducts()) || [];
    const products = []
  

  useEffect(() => {
    setSelectedProductIds(initialSelectedProductIds)
  }, [initialSelectedProductIds])

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleCheckboxChange = (productId: string, checked: boolean) => {
    setSelectedProductIds((prev) => (checked ? [...prev, productId] : prev.filter((id) => id !== productId)))
  }

  const handleConfirm = () => {
    const selectedItems = products.filter((p) => selectedProductIds.includes(p.id))
    onSelectProducts(selectedItems)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Products</DialogTitle>
          <DialogDescription>Search for products and select them for the order.</DialogDescription>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid gap-2">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-2 p-2 border rounded-md">
                  <Checkbox
                    id={`product-${product.id}`}
                    checked={selectedProductIds.includes(product.id)}
                    onCheckedChange={(checked) => handleCheckboxChange(product.id, checked as boolean)}
                  />
                  <Label htmlFor={`product-${product.id}`} className="flex-1 cursor-pointer">
                    {product.name} - ${product.price.toFixed(2)}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No products found.</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
