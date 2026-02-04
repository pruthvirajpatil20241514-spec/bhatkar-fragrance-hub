import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  category: "Men" | "Women" | "Unisex";
  concentration: "EDP" | "EDT" | "Parfum";
  description: string;
  stock: number;
  created_on: string;
}

interface FormData {
  name: string;
  brand: string;
  price: string;
  category: "Men" | "Women" | "Unisex" | "";
  concentration: "EDP" | "EDT" | "Parfum" | "";
  description: string;
  stock: string;
}

interface ProductImage {
  id?: number;
  imageUrl: string;
  altText: string;
  imageOrder: number;
  isThumbnail: boolean;
}

export default function Products() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    brand: "",
    price: "",
    category: "",
    concentration: "",
    description: "",
    stock: "0",
  });

  const [images, setImages] = useState<ProductImage[]>([]);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");
      setProducts(response.data.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        brand: product.brand,
        price: product.price.toString(),
        category: product.category,
        concentration: product.concentration,
        description: product.description,
        stock: product.stock.toString(),
      });
      // Load existing images for product
      loadProductImages(product.id);
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        brand: "",
        price: "",
        category: "",
        concentration: "",
        description: "",
        stock: "0",
      });
      setImages([]);
    }
    setIsOpen(true);
  };

  const loadProductImages = async (productId: number) => {
    try {
      const response = await api.get(`/products/${productId}/images`);
      if (response.data.data) {
        setImages(response.data.data.map((img: any) => ({
          id: img.id,
          imageUrl: img.image_url,
          altText: img.alt_text || "",
          imageOrder: img.image_order,
          isThumbnail: img.is_thumbnail
        })));
      }
    } catch (err) {
      console.error("Failed to load product images");
      setImages([]);
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      brand: "",
      price: "",
      category: "",
      concentration: "",
      description: "",
      stock: "0",
    });
    setImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.name || !formData.brand || !formData.price || !formData.category || !formData.concentration) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: formData.name,
        brand: formData.brand,
        price: parseFloat(formData.price),
        category: formData.category,
        concentration: formData.concentration,
        description: formData.description,
        stock: parseInt(formData.stock) || 0,
      };

      let productId: number;

      if (editingId) {
        // Update product
        await api.put(`/products/${editingId}`, payload);
        productId = editingId;
      } else {
        // Create product
        const response = await api.post("/products", payload);
        productId = response.data.data.id;
      }

      // Handle images - add new ones
      if (images.length > 0) {
        const newImages = images.filter(img => !img.id); // Only new images
        if (newImages.length > 0) {
          const imagePayload = {
            images: newImages.map((img, index) => ({
              imageUrl: img.imageUrl,
              altText: img.altText,
              imageOrder: index + 1,
              isThumbnail: index === 0
            }))
          };
          await api.post(`/products/${productId}/images`, imagePayload);
        }
      }

      await fetchProducts();
      handleCloseDialog();
      toast.success(editingId ? "Product updated successfully!" : "Product created successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddImage = (imageUrl: string, altText: string) => {
    if (images.length >= 4) {
      toast.error("Maximum 4 images per product");
      return;
    }

    if (!imageUrl.trim()) {
      toast.error("Please enter image URL");
      return;
    }

    const newImage: ProductImage = {
      imageUrl: imageUrl.trim(),
      altText: altText.trim() || "Product image",
      imageOrder: images.length + 1,
      isThumbnail: images.length === 0
    };

    setImages([...images, newImage]);
    toast.success("Image added!");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const handleSetThumbnail = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isThumbnail: i === index
    }));
    setImages(updatedImages);
    toast.success("Thumbnail updated");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setError("");
      await api.delete(`/products/${id}`);
      await fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-foreground">Products</h1>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
        <p className="text-muted-foreground">Manage your fragrance catalog</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Product Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Concentration</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No products found. Create one to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {product.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary-foreground">
                          {product.concentration}
                        </span>
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(product)}
                            className="gap-1"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the product details" : "Create a new fragrance product"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium block mb-1">Product Name *</label>
              <Input
                placeholder="e.g., Eau de Parfum Rose"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            {/* Brand */}
            <div>
              <label className="text-sm font-medium block mb-1">Brand *</label>
              <Input
                placeholder="e.g., Guerlain"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            {/* Price */}
            <div>
              <label className="text-sm font-medium block mb-1">Price (₹) *</label>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium block mb-1">Category *</label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Men">Men</SelectItem>
                  <SelectItem value="Women">Women</SelectItem>
                  <SelectItem value="Unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Concentration */}
            <div>
              <label className="text-sm font-medium block mb-1">Concentration *</label>
              <Select
                value={formData.concentration}
                onValueChange={(value: any) => setFormData({ ...formData, concentration: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select concentration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EDP">EDP (Eau de Parfum)</SelectItem>
                  <SelectItem value="EDT">EDT (Eau de Toilette)</SelectItem>
                  <SelectItem value="Parfum">Parfum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stock */}
            <div>
              <label className="text-sm font-medium block mb-1">Stock</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium block mb-1">Description</label>
              <textarea
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
            </div>

            {/* Product Images */}
            <div className="border-t pt-4">
              <div className="mb-4">
                <label className="text-sm font-medium block mb-3">Product Images (Max 4)</label>
                
                {/* Image Upload Form */}
                <div className="space-y-3 mb-4 p-3 bg-muted/50 rounded-lg">
                  <ImageUploadForm 
                    onAdd={handleAddImage}
                    disabled={isSubmitting || images.length >= 4}
                  />
                </div>

                {/* Images List */}
                {images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      {images.length} image{images.length !== 1 ? 's' : ''} added
                    </p>
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-muted rounded border border-input"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate font-medium">{image.altText}</p>
                          <p className="text-xs text-muted-foreground truncate">{image.imageUrl}</p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={image.isThumbnail ? "default" : "outline"}
                          onClick={() => handleSetThumbnail(index)}
                          disabled={isSubmitting}
                          className="text-xs"
                        >
                          {image.isThumbnail ? "✓ Thumb" : "Thumb"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveImage(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader className="h-4 w-4 animate-spin" />}
                {editingId ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Image Upload Form Component
function ImageUploadForm({ 
  onAdd, 
  disabled 
}: { 
  onAdd: (imageUrl: string, altText: string) => void;
  disabled?: boolean;
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(imageUrl, altText);
    setImageUrl("");
    setAltText("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <label className="text-xs font-medium block mb-1">Image URL *</label>
        <Input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          disabled={disabled}
          className="text-xs"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use HTTPS URLs (e.g., Unsplash, Cloudinary, or your image CDN)
        </p>
      </div>

      <div>
        <label className="text-xs font-medium block mb-1">Alt Text</label>
        <Input
          type="text"
          placeholder="e.g., Product front view"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          disabled={disabled}
          className="text-xs"
        />
      </div>

      <Button
        type="submit"
        disabled={disabled || !imageUrl.trim()}
        className="w-full text-xs gap-1"
        size="sm"
      >
        <Upload className="h-3 w-3" />
        Add Image
      </Button>
    </form>
  );
}
