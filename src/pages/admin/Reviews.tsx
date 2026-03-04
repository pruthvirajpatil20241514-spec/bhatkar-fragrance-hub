import { useState, useEffect } from "react";
import {
  Plus, Trash2, Loader2, Star, Search, Filter,
  MessageSquare, User, Calendar, CheckCircle2,
  AlertCircle, MoreVertical, Edit2, ChevronRight,
  ThumbsUp, Ban, ShoppingBag, ArrowLeft, RefreshCw, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn, getImageUrl } from "@/lib/utils";
import { AdminLayout } from "@/components/layout/AdminLayout";

interface Product {
  id: number;
  name: string;
  brand: string;
  images: any;
}

interface Review {
  id: number;
  product_id: number;
  reviewer_name: string;
  rating: number;
  review_text: string;
  verified_purchase: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  is_approved?: boolean;
  created_at: string;
}

export default function AdminReviews() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const [formData, setFormData] = useState({
    reviewer_name: "",
    rating: 5,
    review_text: "",
    verified_purchase: true,
    is_featured: false,
    is_active: true,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) navigate("/");
  }, [isAdmin, navigate]);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await api.get("/products/with-images/all");
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  // Load reviews for selected product
  useEffect(() => {
    if (selectedProductId) {
      loadReviews();
    }
  }, [selectedProductId]);

  const loadReviews = async () => {
    if (!selectedProductId) return;
    try {
      setLoading(true);
      const response = await api.get(`/reviews/product/${selectedProductId}/all`);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }

    if (!formData.reviewer_name.trim() || !formData.review_text.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/reviews/product/${selectedProductId}`, formData);
      toast.success("Review added correctly!");

      setFormData({
        reviewer_name: "",
        rating: 5,
        review_text: "",
        verified_purchase: true,
        is_featured: false,
        is_active: true,
      });

      await loadReviews();
    } catch (error: any) {
      console.error("Failed to add review:", error);
      toast.error(error.response?.data?.message || "Failed to add review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFeatured = async (reviewId: number, value: boolean) => {
    try {
      await api.patch(`/reviews/${reviewId}/featured`, { featured: value });
      toast.success(value ? 'Review featured' : 'Review unfeatured');
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_featured: value } : r));
    } catch (err) {
      toast.error('Failed to update featured flag');
    }
  };

  const handleToggleActive = async (reviewId: number, value: boolean) => {
    try {
      await api.patch(`/reviews/${reviewId}/active`, { active: value });
      toast.success(value ? 'Review enabled' : 'Review disabled');
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_active: value } : r));
    } catch (err) {
      toast.error('Failed to update active flag');
    }
  };

  const handleEditClick = (review: Review) => {
    setEditingReview(review);
    setEditForm({
      reviewer_name: review.reviewer_name,
      rating: review.rating,
      review_text: review.review_text,
      verified_purchase: review.verified_purchase
    });
    setIsEditDialogOpen(true);
  };

  const [editForm, setEditForm] = useState({
    reviewer_name: "",
    rating: 5,
    review_text: "",
    verified_purchase: true
  });

  const handleUpdateReview = async () => {
    if (!editingReview) return;
    try {
      setSubmitting(true);
      await api.put(`/reviews/${editingReview.id}`, editForm);
      toast.success('Review updated successfully');
      setIsEditDialogOpen(false);
      await loadReviews();
    } catch (err) {
      toast.error('Failed to update review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success("Review deleted successfully!");
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (error: any) {
      console.error("Failed to delete review:", error);
      toast.error("Failed to delete review");
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const renderStars = (rating: number, interactive = false, value?: number, onChange?: (v: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={cn(
            "focus:outline-none transition-transform",
            interactive && "hover:scale-110 active:scale-95"
          )}
        >
          <Star
            size={interactive ? 24 : 14}
            className={cn(
              star <= (interactive ? value || 0 : rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-300 dark:text-slate-600"
            )}
          />
        </button>
      ))}
    </div>
  );

  return (
    <AdminLayout title="Review Management" activeTab="reviews">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Product Navigation */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-4 border-border overflow-hidden bg-background shadow-sm">
              <div className="flex items-center gap-2 px-1 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="h-9 border-none focus-visible:ring-0 px-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Separator className="mb-4" />

              <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {productsLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center opacity-50">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <span className="text-xs font-medium">Loading catalog...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground italic">
                    No products matching search
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all border text-left group",
                        selectedProductId === product.id
                          ? "bg-primary border-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                          : "bg-background border-transparent hover:border-border hover:bg-muted/50 text-foreground"
                      )}
                    >
                      <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0 border border-white/10">
                        <img
                          src={getImageUrl(product.images)}
                          alt={product.brand}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="truncate flex-1">
                        <p className="font-bold text-sm leading-tight group-hover:underline decoration-white/30 underline-offset-2">
                          {product.name}
                        </p>
                        <p className={cn(
                          "text-[10px] uppercase font-bold tracking-widest leading-none mt-1",
                          selectedProductId === product.id ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {product.brand}
                        </p>
                      </div>
                      <ChevronRight className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        selectedProductId === product.id ? "translate-x-0" : "-translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                      )} />
                    </button>
                  ))
                )}
              </div>
            </Card>

            {/* Quick Actions / Integration */}
            {selectedProductId && (
              <Card className="p-6 bg-primary/5 border-primary/10 border-dashed">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <ThumbsUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Review Policy</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Featured reviews appear directly on the product detail page. Aim for high-quality, verified feedback.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Review Area */}
          <div className="lg:col-span-8 space-y-8">
            {selectedProductId ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Product Detail Banner */}
                <Card className="p-6 border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShoppingBag className="h-32 w-32 rotate-12" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-2xl bg-white/10 dark:bg-white/20 backdrop-blur-md p-1 border border-white/20 dark:border-white/10">
                        <img
                          src={getImageUrl(selectedProduct?.images)}
                          alt={selectedProduct?.name}
                          className="h-full w-full object-cover rounded-xl"
                        />
                      </div>
                      <div>
                        <Badge className="mb-2 bg-primary/20 text-primary-foreground border-none text-[10px] tracking-widest uppercase">Currently Managing</Badge>
                        <h2 className="text-2xl font-black">{selectedProduct?.name}</h2>
                        <p className="text-slate-400 font-medium tracking-tight uppercase text-xs">{selectedProduct?.brand}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="text-center bg-white/5 dark:bg-white/10 p-3 rounded-2xl min-w-[80px]">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Reviews</p>
                        <p className="text-xl font-bold">{reviews.length}</p>
                      </div>
                      <div className="text-center bg-white/5 dark:bg-white/10 p-3 rounded-2xl min-w-[80px]">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Avg Rating</p>
                        <p className="text-xl font-bold">
                          {reviews.length > 0
                            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                            : '0.0'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Main Tabs/Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Section 1: Creation */}
                  <Card className="p-6 border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-bold tracking-tight">Post New Review</h3>
                    </div>

                    <form onSubmit={handleAddReview} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Reviewer Details</label>
                        <Input
                          placeholder="e.g., John Doe"
                          value={formData.reviewer_name}
                          onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                          disabled={submitting}
                          className="bg-muted/30"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Experience Rating</label>
                        <div className="bg-muted/30 p-3 rounded-lg border border-border flex justify-between items-center">
                          {renderStars(0, true, formData.rating, (v) => setFormData({ ...formData, rating: v }))}
                          <span className="font-bold text-sm text-primary">{formData.rating}/5</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Feedback Content</label>
                        <textarea
                          placeholder="Write detailed customer feedback..."
                          value={formData.review_text}
                          onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                          disabled={submitting}
                          rows={4}
                          className="w-full px-3 py-2 bg-muted/30 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary h-24"
                        />
                      </div>

                      <div className="flex items-center gap-2 bg-green-500/5 p-3 rounded-xl border border-green-500/10">
                        <input
                          type="checkbox"
                          id="verified"
                          checked={formData.verified_purchase}
                          onChange={(e) => setFormData({ ...formData, verified_purchase: e.target.checked })}
                          disabled={submitting}
                          className="w-4 h-4 rounded cursor-pointer accent-green-600"
                        />
                        <label htmlFor="verified" className="text-sm font-bold text-green-700 dark:text-green-400 cursor-pointer flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark as Verified Purchase
                        </label>
                      </div>

                      <Button type="submit" disabled={submitting} className="w-full h-11 font-bold tracking-tight rounded-xl">
                        {submitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Package size={18} className="mr-2" />
                            Publish Review
                          </>
                        )}
                      </Button>
                    </form>
                  </Card>

                  {/* Section 2: Management List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-bold tracking-tight">Active Reviews</h3>
                      </div>
                      <Badge variant="outline" className="bg-background">{reviews.length} total</Badge>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse border border-border" />
                        ))
                      ) : reviews.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center border border-dashed rounded-2xl bg-muted/30 px-6 text-center">
                          <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-4" />
                          <p className="text-sm font-medium text-muted-foreground">No reviews posted for this product yet.</p>
                        </div>
                      ) : (
                        reviews.map((review) => (
                          <Card key={review.id} className={cn(
                            "p-5 shadow-sm border-border transition-all hover:ring-2 ring-primary/5",
                            !review.is_active && "opacity-60 bg-slate-50 grayscale-[0.3]"
                          )}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                  {review.reviewer_name?.substring(0, 2) || "AN"}
                                </div>
                                <div>
                                  <p className="font-bold text-sm flex items-center gap-1.5">
                                    {review.reviewer_name}
                                    {review.verified_purchase && (
                                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    )}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {renderStars(review.rating)}
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                      {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl">
                                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem className="rounded-lg gap-2" onClick={() => handleEditClick(review)}>
                                    <Edit2 className="h-4 w-4" /> Edit Review
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-lg gap-2" onClick={() => handleToggleFeatured(review.id, !review.is_featured)}>
                                    <Star className={cn("h-4 w-4", review.is_featured && "fill-yellow-400 text-yellow-400")} />
                                    {review.is_featured ? "Remove Featured" : "Mark Featured"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-lg gap-2" onClick={() => handleToggleActive(review.id, !review.is_active)}>
                                    {review.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                    {review.is_active ? "Deactivate" : "Activate"}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="rounded-lg gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    onClick={() => handleDeleteReview(review.id)}
                                  >
                                    <Trash2 className="h-4 w-4" /> Delete Permanently
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <p className="text-sm mt-4 text-foreground/80 leading-relaxed font-medium bg-muted/20 p-3 rounded-xl border border-muted/30">
                              "{review.review_text}"
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {review.is_featured && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-none font-bold text-[10px]">FEATURED</Badge>}
                              {!review.is_active && <Badge variant="outline" className="border-red-200 text-red-500 font-bold text-[10px]">INACTIVE</Badge>}
                              {review.is_approved === false && <Badge variant="destructive" className="font-bold text-[10px]">REJECTED</Badge>}
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-background/50">
                <div className="bg-muted p-6 rounded-full mb-6">
                  <ArrowLeft className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-2">Master Review Portal</h2>
                <p className="max-w-md text-muted-foreground font-medium">
                  To get started, please select a product from the list on the left to moderate its reviews and customer feedback.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Review Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Edit Product Review
            </DialogTitle>
            <DialogDescription>
              Modify the reviewer details or rating for accuracy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Reviewer Name</label>
              <Input
                value={editForm.reviewer_name}
                onChange={(e) => setEditForm({ ...editForm, reviewer_name: e.target.value })}
                placeholder="Reviewer name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Experience Rating</label>
              <div className="bg-muted/30 p-4 rounded-xl border border-border flex justify-center">
                {renderStars(0, true, editForm.rating, (v) => setEditForm({ ...editForm, rating: v }))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Feedback Text</label>
              <textarea
                value={editForm.review_text}
                onChange={(e) => setEditForm({ ...editForm, review_text: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-muted/30 border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary h-32"
              />
            </div>

            <div className="flex items-center gap-2 px-1">
              <input
                type="checkbox"
                id="edit-verified"
                checked={editForm.verified_purchase}
                onChange={(e) => setEditForm({ ...editForm, verified_purchase: e.target.checked })}
                className="w-4 h-4 rounded cursor-pointer accent-primary"
              />
              <label htmlFor="edit-verified" className="text-sm font-bold cursor-pointer">
                Mark as Verified Purchase
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl font-semibold">Cancel</Button>
            <Button onClick={handleUpdateReview} disabled={submitting} className="rounded-xl font-bold">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
