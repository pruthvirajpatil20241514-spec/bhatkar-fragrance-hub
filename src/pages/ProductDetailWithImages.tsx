import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Truck,
  RotateCcw,
  Shield,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Star,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductImageCarousel from "@/components/products/ProductImageCarousel";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/contexts/ProductContext";

interface ProductImage {
  id: number;
  image_url: string;
  image_format?: string;
  alt_text: string;
  image_order: number;
  is_thumbnail: boolean;
}

interface FeaturedReview {
  id: number;
  reviewer_name: string;
  rating: number;
  review_text: string;
  verified_purchase?: boolean;
}

interface ProductVariant {
  id: number;
  product_id: number;
  ml: number;
  unit: string;
  price: number;
  stock: number;
  images?: ProductImage[];
}

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  category: string;
  concentration: string;
  description: string;
  stock: number;
  images: any[];
  is_best_seller?: boolean;
  variants?: any[];
  created_on: string;
}

export default function ProductDetailWithImages() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { products } = useProducts();

  // Find product from global cache
  const product = products.find((p: any) => p.id == id); // Loose equality in case of string/number mismatch

  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [featuredReviews, setFeaturedReviews] = useState<FeaturedReview[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [currentImages, setCurrentImages] = useState<ProductImage[]>([]);

  useEffect(() => {
    if (!product || !product.id) return;

    let mounted = true;

    const fetchDetails = async () => {
      try {
        setLoading(true);

        // Map string array to ProductImage objects
        const formattedImages = (product.images || []).map((imgUrl: any, idx: number) => {
          if (typeof imgUrl === 'string') {
            return {
              id: -idx,
              image_url: imgUrl,
              alt_text: product.name,
              image_order: idx,
              is_thumbnail: idx === 0
            };
          }
          return imgUrl;
        });

        setCurrentImages(formattedImages);

        // Fetch featured reviews
        try {
          const reviewsResponse = await api.get(`/reviews/product/${product.id}/featured`);
          if (mounted) setFeaturedReviews(reviewsResponse.data.data || []);
        } catch (err) {
          console.log("No reviews available for this product");
        }

        // Load variants if available
        try {
          const variantsResponse = await api.get(`/variants/product/${product.id}`);
          const variantsList = variantsResponse.data.data || [];
          if (mounted && variantsList.length > 0) {
            setSelectedVariant(variantsList[0]);
            setCurrentPrice(variantsList[0].price);
            setCurrentStock(variantsList[0].stock);
          }
        } catch (err) {
          console.log("No variants available for this product");
        }
      } catch (error: any) {
        if (mounted) toast.error(error.response?.data?.message || "Failed to load product details");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      mounted = false;
    };
  }, [product?.id]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center px-4">
          <h1 className="font-display text-3xl font-bold mb-4">
            Product Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Button variant="default" asChild>
            <Link to="/shop">Browse All Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    // Add to cart with selected quantity
    addItem(product as any, quantity, currentPrice);
    toast.success(`${product.name} added to cart!`, {
      description: `Quantity: ${quantity}`,
    });
    setQuantity(1);
  };

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setCurrentPrice(variant.price);
    setCurrentStock(variant.stock);
    setQuantity(1); // Reset quantity when changing variant

    // Update images if variant has ML-specific images
    if (variant.images && variant.images.length > 0) {
      setCurrentImages(variant.images);
    } else if (product?.images) {
      const formattedImages = (product.images || []).map((imgUrl: any, idx: number) => {
        if (typeof imgUrl === 'string') {
          return {
            id: -idx,
            image_url: imgUrl,
            alt_text: product.name,
            image_order: idx,
            is_thumbnail: idx === 0
          };
        }
        return imgUrl;
      });
      setCurrentImages(formattedImages);
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist");
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted ? "Removed from wishlist" : "Added to wishlist"
    );
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-background py-4">
        <div className="container px-4">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to="/shop" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="py-12">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image Carousel */}
            <div className="flex flex-col">
              <ProductImageCarousel
                images={currentImages || []}
                productName={product.name}
                className="mb-6"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                    {product.name}
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">{product.brand}</p>

                {/* Category & Type */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {product.is_best_seller && (
                    <Badge className="bg-yellow-100 text-yellow-900">
                      ⭐ Best Seller
                    </Badge>
                  )}
                  <Badge className="bg-blue-100 text-blue-900">
                    {product.category}
                  </Badge>
                  {product.concentration && (
                    <Badge className="bg-purple-100 text-purple-900">
                      {product.concentration}
                    </Badge>
                  )}
                  {currentStock > 0 && (
                    <Badge className="bg-green-100 text-green-900">
                      In Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* ML/Variants Selector */}
              {(product as any).variants && (product as any).variants.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Size: {selectedVariant?.ml}
                    {selectedVariant?.unit}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(product as any).variants.map((variant: any) => (
                      <button
                        key={variant.id}
                        onClick={() => handleVariantChange(variant)}
                        className={`p-3 border-2 rounded-lg transition font-medium ${selectedVariant?.id === variant.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:border-primary"
                          }`}
                      >
                        {variant.ml}
                        {variant.unit}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div>
                <p className="text-3xl font-bold text-foreground">
                  ₹{formatPrice(currentPrice)}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card rounded-lg">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">
                    Concentration
                  </p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {product.concentration}
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">
                    Stock
                  </p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {product.stock} units
                  </p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Quantity
                </label>
                <div className="flex items-center gap-4 bg-muted/10 dark:bg-muted/20 rounded-lg p-2 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-muted/20 rounded-lg transition"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(currentStock, quantity + 1))
                    }
                    className="p-2 hover:bg-muted/20 rounded-lg transition"
                    disabled={quantity >= currentStock}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Add to Cart & Wishlist */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-6"
                  size="lg"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {currentStock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button
                  onClick={handleWishlist}
                  variant="outline"
                  size="lg"
                  className="px-6"
                >
                  {isWishlisted ? (
                    <Check className="h-5 w-5 text-orange-500" />
                  ) : (
                    "♡"
                  )}
                </Button>
              </div>

              {/* Benefits */}
              <div className="space-y-3 pt-6 border-t">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Free Delivery
                    </p>
                    <p className="text-sm text-muted-foreground">Orders over $50</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RotateCcw className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">No Return Policy</p>
                    <p className="text-sm text-muted-foreground">No returns accepted</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Secure Checkout
                    </p>
                    <p className="text-sm text-muted-foreground">
                      100% secure payment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Reviews Section */}
      {featuredReviews.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container px-4">
            <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-lg p-6 shadow-sm border border-border"
                >
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating
                          ? "fill-orange-400 text-orange-400"
                          : "text-muted-foreground/60"
                          }`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    "{review.review_text}"
                  </p>

                  {/* Reviewer Info */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="font-semibold text-foreground">
                      {review.reviewer_name}
                    </span>
                    {review.verified_purchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
