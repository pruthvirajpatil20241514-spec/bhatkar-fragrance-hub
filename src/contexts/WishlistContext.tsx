import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Product } from "@/data/products";

interface WishlistState {
  items: Product[];
}

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("bhatkar-wishlist");
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("bhatkar-wishlist", JSON.stringify(items));
  }, [items]);

  const addToWishlist = (product: Product) => {
    setItems((prevItems) => {
      const exists = prevItems.some((item) => item.id === product.id);
      if (!exists) {
        return [...prevItems, product];
      }
      return prevItems;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
