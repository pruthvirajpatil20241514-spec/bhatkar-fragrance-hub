import { motion } from "framer-motion";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { useWishlist } from "@/contexts/WishlistContext";

export default function Wishlist() {
  const { items, clearWishlist } = useWishlist();

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-8 md:py-12 border-b border-border/50"
        >
          <div className="container">
            <div className="flex items-center gap-4 mb-6">
              <Link
                to="/shop"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Shop
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-destructive fill-destructive" />
              <h1 className="font-display text-4xl md:text-5xl font-bold">
                My Wishlist
              </h1>
            </div>
            <p className="text-muted-foreground mt-3">
              {items.length} item{items.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </motion.section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="container">
            {items.length > 0 ? (
              <>
                {/* Products Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex gap-4 pt-8 border-t border-border/50"
                >
                  <Button
                    onClick={clearWishlist}
                    variant="outline"
                  >
                    Clear Wishlist
                  </Button>
                  <Link to="/shop">
                    <Button>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="py-20 text-center"
              >
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
                <p className="text-muted-foreground mb-8">
                  Start adding your favorite perfumes to your wishlist
                </p>
                <Link to="/shop">
                  <Button>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Browse Perfumes
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
