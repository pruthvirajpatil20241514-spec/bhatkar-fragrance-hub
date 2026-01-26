import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Home, X } from "lucide-react";
import { products } from "@/data/products";

interface Variant {
  ml: number;
  price: number;
  id?: string;
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const [productList, setProductList] = useState(products);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [variants, setVariants] = useState<Variant[]>([{ ml: 100, price: 0, id: "1" }]);
  const [newVariant, setNewVariant] = useState({ ml: "", price: "" });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    category: "unisex",
    concentration: "EDP",
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      brand: "",
      category: "unisex",
      concentration: "EDP",
    });
    setVariants([{ ml: 100, price: 0, id: "1" }]);
    setNewVariant({ ml: "", price: "" });
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      brand: product.brand || "",
      category: product.category,
      concentration: "EDP",
    });
    setVariants(
      product.sizes.map((size: any, idx: number) => ({
        ml: size.ml,
        price: size.price,
        id: String(idx),
      }))
    );
    setNewVariant({ ml: "", price: "" });
    setIsDialogOpen(true);
  };

  const handleAddVariant = () => {
    if (!newVariant.ml || !newVariant.price) {
      alert("Please enter both ml and price");
      return;
    }

    const variant: Variant = {
      ml: parseInt(newVariant.ml),
      price: parseFloat(newVariant.price),
      id: String(variants.length + 1),
    };

    setVariants([...variants, variant]);
    setNewVariant({ ml: "", price: "" });
  };

  const handleRemoveVariant = (id: string | undefined) => {
    if (variants.length === 1) {
      alert("At least one variant is required");
      return;
    }
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleSaveProduct = () => {
    if (!formData.name || variants.length === 0 || variants.some((v) => v.price === 0)) {
      alert("Please fill in all required fields and add at least one variant");
      return;
    }

    if (editingProduct) {
      setProductList(
        productList.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formData.name,
                description: formData.description,
                brand: formData.brand,
                category: formData.category as "men" | "women" | "unisex",
                price: variants[0].price,
                sizes: variants.map((v) => ({ ml: v.ml, price: v.price })),
              }
            : p
        )
      );
    } else {
      const newProduct: any = {
        id: "prod_" + Date.now(),
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        price: variants[0].price,
        images: [],
        sizes: variants.map((v) => ({ ml: v.ml, price: v.price })),
        category: formData.category as "men" | "women" | "unisex",
        rating: 0,
        reviewCount: 0,
        inStock: true,
        notes: { top: [], middle: [], base: [] },
        fragranceType: "fresh" as const,
        longevity: "moderate" as const,
      };
      setProductList([...productList, newProduct]);
    }

    setIsDialogOpen(false);
    setFormData({
      name: "",
      description: "",
      brand: "",
      category: "unisex",
      concentration: "EDP",
    });
    setVariants([{ ml: 100, price: 0, id: "1" }]);
    setNewVariant({ ml: "", price: "" });
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProductList(productList.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
          <Button variant="outline" onClick={() => navigate("/admin/dashboard")} className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
            <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-12 lg:px-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Products</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your fragrance collection ({productList.length} products)
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddProduct} className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add Product</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    {editingProduct
                      ? "Update product details below"
                      : "Create a new fragrance product"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pr-4">
                  {/* Product Name */}
                  <div>
                    <label className="text-sm font-medium">Product Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Royal Oud Noir"
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="text-sm font-medium">Brand</label>
                    <Input
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      placeholder="e.g., Bhatkar Fragrances"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="men">Men</SelectItem>
                        <SelectItem value="women">Women</SelectItem>
                        <SelectItem value="unisex">Unisex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Concentration */}
                  <div>
                    <label className="text-sm font-medium">Concentration</label>
                    <Select
                      value={formData.concentration}
                      onValueChange={(value) =>
                        setFormData({ ...formData, concentration: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EDP">EDP (Eau de Parfum)</SelectItem>
                        <SelectItem value="EDT">EDT (Eau de Toilette)</SelectItem>
                        <SelectItem value="Parfum">Parfum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Product description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  {/* Variants Section */}
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium block mb-3">
                      Variants (Sizes & Prices) *
                    </label>

                    {/* Existing Variants */}
                    <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
                      {variants.length === 0 ? (
                        <p className="text-xs text-gray-500">No variants added yet</p>
                      ) : (
                        variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="flex gap-2 items-center p-2 bg-white rounded border border-gray-200"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">{variant.ml}ml</p>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">₹{variant.price.toLocaleString()}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveVariant(variant.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add New Variant */}
                    <div className="space-y-2 border-t pt-4">
                      <label className="text-xs font-semibold text-gray-600">
                        Add New Variant
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="ml (e.g., 30, 50, 100)"
                          value={newVariant.ml}
                          onChange={(e) =>
                            setNewVariant({ ...newVariant, ml: e.target.value })
                          }
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Price (₹)"
                          value={newVariant.price}
                          onChange={(e) =>
                            setNewVariant({ ...newVariant, price: e.target.value })
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={handleAddVariant}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button className="flex-1" onClick={handleSaveProduct}>
                      {editingProduct ? "Update Product" : "Create Product"}
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

          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full px-4 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Product</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Brand</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Category</TableHead>
                    <TableHead className="text-xs sm:text-sm">Variants</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Price</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Stock</TableHead>
                    <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productList.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">{product.name}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{product.brand || "-"}</TableCell>
                      <TableCell className="text-xs sm:text-sm capitalize hidden md:table-cell">{product.category}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex gap-1 flex-wrap">
                          {product.sizes.slice(0, 2).map((size: any) => (
                            <span
                              key={size.ml}
                              className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-medium"
                            >
                              {size.ml}ml
                            </span>
                          ))}
                          {product.sizes.length > 2 && (
                            <span className="text-xs font-medium text-gray-600">+{product.sizes.length - 2}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-xs sm:text-sm hidden lg:table-cell">
                        ₹{product.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs hidden md:table-cell">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            product.inStock
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.inStock ? "✓" : "✗"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                            className="h-7 px-2 text-xs"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span className="hidden sm:inline ml-1">Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="h-7 px-2 text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
