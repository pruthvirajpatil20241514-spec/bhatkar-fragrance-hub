import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { getProductImage, handleImageError } from "@/lib/imageUtils";

export function SearchBar(props: { attachRight?: boolean } = {}) {
  const { attachRight = false } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<typeof products>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.fragranceType.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close search on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full md:w-auto flex items-center">
      {/* Mobile Search Icon Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden flex-shrink-0"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Search products"
        aria-expanded={isOpen}
      >
        <SearchIcon className="h-5 w-5" />
      </Button>

      {/* Mobile Full-Width Search Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="fixed md:hidden top-20 left-0 right-0 z-50 bg-background border-b border-border shadow-lg"
          >
            <div className="container px-4 py-4 flex items-center gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search perfumes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setResults([]);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery("");
                  setResults([]);
                }}
                aria-label="Close search"
                className="flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Search Bar - Expandable */}
      <div className="hidden md:flex items-center relative">
        <div className={`relative transition-all duration-300 ease-out ${isOpen ? "w-64" : "w-12"}`}>
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search perfumes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            aria-label="Search products"
            className={
              `w-full pl-10 pr-10 py-2 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ` +
              (attachRight && !isOpen
                ? 'rounded-l-lg rounded-r-none' // square/attached when closed
                : 'rounded-lg')
            }
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown - Responsive */}
      <AnimatePresence>
        {isOpen && searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 md:left-auto md:right-0 md:w-[450px] mt-4 bg-white/90 backdrop-blur-2xl border border-primary/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-border/40 bg-secondary/20">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-2">
                Search Results ({results.length})
              </p>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {results.length > 0 ? (
                <div className="p-2 space-y-1">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={() => {
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/5 transition-all duration-300 group"
                    >
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                        <img
                          src={getProductImage(product.images)}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => handleImageError(e as any)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">{product.name}</h4>
                        <p className="text-[11px] text-muted-foreground font-medium mb-1 truncate capitalize">
                          {product.category} • {product.fragranceType}
                        </p>
                        <p className="font-black text-primary text-sm flex items-center gap-2">
                          {formatPrice(product.price)}
                          {product.isLuxury && (
                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Luxury</span>
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SearchIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">No matches found</h3>
                  <p className="text-sm text-muted-foreground px-10">
                    We couldn't find any fragrances matching "{searchQuery}".
                  </p>
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="p-3 bg-secondary/10 border-t border-border/40 text-center">
                <Link
                  to="/shop"
                  className="text-[11px] font-bold uppercase tracking-widest text-primary hover:text-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  View All Products
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
