"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  Product,
  NOVACART_PRODUCTS,
  getProductById,
  DEMO_PROMO_CODES,
  PromoCode,
} from "@/data/novacart-data";

export interface CartItem {
  id: string; // unique item line id e.g. `${productId}-${color}-${size}`
  productId: string;
  product: Product;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
}

interface StoredCartItem {
  productId: string;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
}

interface ToastMessage {
  id: string;
  type: "success" | "info";
  message: string;
}

interface NovaCartContextType {
  cart: CartItem[];
  wishlist: string[]; // array of product IDs
  isHydrated: boolean;
  totalCartQuantity: number;
  subtotal: number;
  shipping: number;
  discount: number;
  appliedPromo: PromoCode | null;
  promoError: string | null;
  total: number;
  toasts: ToastMessage[];
  // Cart Actions
  addToCart: (
    product: Product,
    quantity?: number,
    color?: string,
    size?: string
  ) => void;
  updateQuantity: (lineId: string, delta: number) => void;
  removeFromCart: (lineId: string) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  // Wishlist Actions
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  // Toast Actions
  dismissToast: (id: string) => void;
}

const CART_STORAGE_KEY = "novacart_demo_cart_v1";
const WISHLIST_STORAGE_KEY = "novacart_demo_wishlist_v1";
const FREE_SHIPPING_THRESHOLD = 2000;
const STANDARD_SHIPPING_FEE = 149;

const NovaCartContext = createContext<NovaCartContextType | undefined>(undefined);

export function NovaCartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const showToast = useCallback((message: string, type: "success" | "info" = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Hydration from localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedCartRaw = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCartRaw) {
          const parsed = JSON.parse(storedCartRaw) as StoredCartItem[];
          if (Array.isArray(parsed)) {
            const reconstructedCart: CartItem[] = [];
            for (const item of parsed) {
              const product = getProductById(item.productId);
              if (product && item.quantity > 0) {
                const lineId = `${item.productId}-${item.selectedColor || "none"}-${item.selectedSize || "none"}`;
                reconstructedCart.push({
                  id: lineId,
                  productId: item.productId,
                  product,
                  selectedColor: item.selectedColor,
                  selectedSize: item.selectedSize,
                  quantity: Math.min(Math.max(1, item.quantity), 99),
                });
              }
            }
            setCart(reconstructedCart);
          }
        }

        const storedWishlistRaw = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (storedWishlistRaw) {
          const parsedWishlist = JSON.parse(storedWishlistRaw) as string[];
          if (Array.isArray(parsedWishlist)) {
            const validWishlist = parsedWishlist.filter((id) =>
              NOVACART_PRODUCTS.some((p) => p.id === id)
            );
            setWishlist(validWishlist);
          }
        }
      }
    } catch {
      // Safe fallback if localStorage is disabled / throws
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save Cart to localStorage on change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (typeof window !== "undefined") {
        const dataToSave: StoredCartItem[] = cart.map((item) => ({
          productId: item.productId,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
        }));
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(dataToSave));
      }
    } catch {
      // Ignore write errors
    }
  }, [cart, isHydrated]);

  // Save Wishlist to localStorage on change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
      }
    } catch {
      // Ignore write errors
    }
  }, [wishlist, isHydrated]);

  // Cart operations
  const addToCart = useCallback(
    (product: Product, quantity: number = 1, color?: string, size?: string) => {
      const chosenColor = color || (product.colors && product.colors[0]?.name);
      const chosenSize = size || (product.sizes && product.sizes[0]);
      const lineId = `${product.id}-${chosenColor || "none"}-${chosenSize || "none"}`;

      setCart((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === lineId);
        if (existingIndex > -1) {
          const updated = [...prev];
          const newQty = updated[existingIndex].quantity + quantity;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: Math.min(newQty, 99),
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: lineId,
              productId: product.id,
              product,
              selectedColor: chosenColor,
              selectedSize: chosenSize,
              quantity: Math.min(Math.max(1, quantity), 99),
            },
          ];
        }
      });

      showToast(`Added "${product.name}" to your cart`);
    },
    [showToast]
  );

  const updateQuantity = useCallback((lineId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === lineId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: Math.min(nextQty, 99) } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  }, []);

  const removeFromCart = useCallback(
    (lineId: string) => {
      setCart((prev) => {
        const target = prev.find((i) => i.id === lineId);
        if (target) {
          showToast(`Removed "${target.product.name}" from cart`, "info");
        }
        return prev.filter((item) => item.id !== lineId);
      });
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedPromo(null);
    setPromoError(null);
  }, []);

  // Promo code operations
  const applyPromoCode = useCallback(
    (inputCode: string): boolean => {
      const cleaned = inputCode.trim().toUpperCase();
      const promo = DEMO_PROMO_CODES[cleaned];
      if (!promo) {
        setPromoError("Invalid promotional code. Try 'WELCOME10' or 'NOVAFIRST'.");
        return false;
      }

      const currentSubtotal = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      if (currentSubtotal < promo.minSubtotal) {
        setPromoError(`Requires minimum order of ₹${promo.minSubtotal.toLocaleString("en-IN")}.`);
        return false;
      }

      setAppliedPromo(promo);
      setPromoError(null);
      showToast(`Promo "${promo.code}" applied!`);
      return true;
    },
    [cart, showToast]
  );

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    setPromoError(null);
    showToast("Promotional code removed", "info");
  }, [showToast]);

  // Wishlist operations
  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        const prod = getProductById(productId);
        if (exists) {
          showToast(
            `Removed ${prod ? `"${prod.name}"` : "item"} from wishlist`,
            "info"
          );
          return prev.filter((id) => id !== productId);
        } else {
          showToast(
            `Saved ${prod ? `"${prod.name}"` : "item"} to your wishlist`
          );
          return [...prev, productId];
        }
      });
    },
    [showToast]
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlist.includes(productId);
    },
    [wishlist]
  );

  // Financial Calculations
  const totalCartQuantity = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const discount = useMemo(() => {
    if (!appliedPromo || subtotal === 0) return 0;
    if (appliedPromo.type === "percentage") {
      return Math.round((subtotal * appliedPromo.value) / 100);
    }
    return Math.min(appliedPromo.value, subtotal);
  }, [appliedPromo, subtotal]);

  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }, [subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + shipping);
  }, [subtotal, discount, shipping]);

  const value = {
    cart,
    wishlist,
    isHydrated,
    totalCartQuantity,
    subtotal,
    shipping,
    discount,
    appliedPromo,
    promoError,
    total,
    toasts,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromoCode,
    removePromoCode,
    toggleWishlist,
    isInWishlist,
    dismissToast,
  };

  return <NovaCartContext.Provider value={value}>{children}</NovaCartContext.Provider>;
}

export function useNovaCart() {
  const context = useContext(NovaCartContext);
  if (!context) {
    throw new Error("useNovaCart must be used within a NovaCartProvider");
  }
  return context;
}
