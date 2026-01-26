import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Plus, Home } from "lucide-react";
import { products } from "@/data/products";

interface InventoryItem {
  productId: string;
  productName: string;
  warehouse: string;
  quantity: number;
  reorderThreshold: number;
}

export default function AdminInventory() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryItem[]>(
    products.map((p, idx) => ({
      productId: p.id,
      productName: p.name,
      warehouse: idx % 2 === 0 ? "Main Warehouse" : "Secondary Warehouse",
      quantity: Math.floor(Math.random() * 100) + 20,
      reorderThreshold: 20,
    }))
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustment, setAdjustment] = useState({
    quantity: "",
    reason: "restock",
  });

  const lowStockItems = inventory.filter((item) => item.quantity <= item.reorderThreshold);

  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustment({ quantity: "", reason: "restock" });
    setIsDialogOpen(true);
  };

  const handleSaveAdjustment = () => {
    if (!selectedItem || !adjustment.quantity) {
      alert("Please enter a quantity");
      return;
    }

    const quantityChange = parseInt(adjustment.quantity);
    setInventory(
      inventory.map((item) =>
        item.productId === selectedItem.productId
          ? { ...item, quantity: Math.max(0, item.quantity + quantityChange) }
          : item
      )
    );

    setIsDialogOpen(false);
    setAdjustment({ quantity: "", reason: "restock" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory Management</h1>
          <Button variant="outline" onClick={() => navigate("/admin/dashboard")} className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
            <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-12 lg:px-8">
        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="mb-4 sm:mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <CardTitle className="text-base sm:text-lg text-orange-900">Low Stock Alert</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-orange-800">
                    {lowStockItems.length} product(s) are below reorder threshold
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 bg-white rounded border border-orange-200 gap-1 sm:gap-0"
                  >
                    <span className="text-xs sm:text-sm font-medium">{item.productName}</span>
                    <span className="text-xs sm:text-sm text-orange-600 font-semibold">
                      {item.quantity} units left
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Warehouse Stock</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Real-time inventory across warehouses
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Stock Adjustment</span>
                  <span className="sm:hidden">Adjust</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adjust Stock</DialogTitle>
                  <DialogDescription>
                    {selectedItem?.productName}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Current Quantity: {selectedItem?.quantity} units
                    </label>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Adjustment Quantity *
                    </label>
                    <Input
                      type="number"
                      value={adjustment.quantity}
                      onChange={(e) =>
                        setAdjustment({ ...adjustment, quantity: e.target.value })
                      }
                      placeholder="Enter quantity (positive or negative)"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Reason</label>
                    <select
                      value={adjustment.reason}
                      onChange={(e) =>
                        setAdjustment({ ...adjustment, reason: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="restock">Restock</option>
                      <option value="damage">Damage/Loss</option>
                      <option value="correction">Inventory Correction</option>
                      <option value="return">Return</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1" onClick={handleSaveAdjustment}>
                      Save Adjustment
                    </Button>
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent className="px-0 sm:px-6">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Product</TableHead>
                      <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Warehouse</TableHead>
                      <TableHead className="text-xs sm:text-sm">Stock</TableHead>
                      <TableHead className="hidden md:table-cell text-xs sm:text-sm">Threshold</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => {
                      const isLowStock = item.quantity <= item.reorderThreshold;
                      return (
                        <TableRow key={`${item.productId}-${item.warehouse}`}>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            {item.productName}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{item.warehouse}</TableCell>
                          <TableCell className="font-semibold text-xs sm:text-sm">
                            {item.quantity} units
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs sm:text-sm">{item.reorderThreshold} units</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                                isLowStock
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {isLowStock ? "⚠️ Low" : "✓"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdjustStock(item)}
                              className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                            >
                              Adjust
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {inventory.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Low Stock Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">
                {lowStockItems.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Warehouses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">2</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
