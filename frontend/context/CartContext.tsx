"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface CartItem {
  id: string; // Product ID
  cartItemId: string; // Unique cart line ID: productId or productId_variantId
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  thumbnail: string | null;
  quantity: number;
  stockQty: number;
  reservedStockQty: number;
  variantId?: string;
  variantName?: string;
  combination?: Record<string, string>;
  colorName?: string | null;
  colorCode?: string | null;
  size?: string | null;
  weight?: string | null;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (cartItemIdOrId: string) => void;
  updateQuantity: (cartItemIdOrId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  reservationSeconds: number;
  formattedReservationTimer: string;
  isReservationExpired: boolean;
  resetReservationTimer: () => void;
}

const RESERVATION_DURATION = 600; // 10 minutes in seconds
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [reservationSeconds, setReservationSeconds] = useState<number>(RESERVATION_DURATION);
  const [isReservationExpired, setIsReservationExpired] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load cart and reservation timestamp from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        // Ensure every item has a cartItemId
        const normalized = parsed.map((item: any) => ({
          ...item,
          cartItemId: item.cartItemId || (item.variantId ? `${item.id}_${item.variantId}` : item.id),
        }));
        setCart(normalized);
      } catch (error) {
        console.error("Failed to parse cart items:", error);
      }
    }

    const storedTimerEnd = localStorage.getItem("cart_reservation_end");
    if (storedTimerEnd) {
      const remaining = Math.max(0, Math.floor((parseInt(storedTimerEnd, 10) - Date.now()) / 1000));
      if (remaining > 0) {
        setReservationSeconds(remaining);
        setIsReservationExpired(false);
      } else {
        setReservationSeconds(0);
        setIsReservationExpired(true);
      }
    }
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Reservation countdown ticker
  useEffect(() => {
    if (cart.length === 0) {
      setReservationSeconds(RESERVATION_DURATION);
      setIsReservationExpired(false);
      localStorage.removeItem("cart_reservation_end");
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Set expiration timestamp if not set
    if (!localStorage.getItem("cart_reservation_end")) {
      const endTimestamp = Date.now() + RESERVATION_DURATION * 1000;
      localStorage.setItem("cart_reservation_end", endTimestamp.toString());
      setReservationSeconds(RESERVATION_DURATION);
      setIsReservationExpired(false);
    }

    timerRef.current = setInterval(() => {
      const storedEnd = localStorage.getItem("cart_reservation_end");
      if (storedEnd) {
        const remaining = Math.max(0, Math.floor((parseInt(storedEnd, 10) - Date.now()) / 1000));
        setReservationSeconds(remaining);
        if (remaining <= 0) {
          setIsReservationExpired(true);
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cart.length]);

  const resetReservationTimer = () => {
    const endTimestamp = Date.now() + RESERVATION_DURATION * 1000;
    localStorage.setItem("cart_reservation_end", endTimestamp.toString());
    setReservationSeconds(RESERVATION_DURATION);
    setIsReservationExpired(false);
  };

  const addToCart = (product: any, quantity = 1) => {
    resetReservationTimer();
    setCart((prevCart) => {
      const lineId = product.variantId ? `${product.id}_${product.variantId}` : product.id;
      const existingItemIndex = prevCart.findIndex((item) => item.cartItemId === lineId);

      const availableStock = (product.stockQty ?? 99) - (product.reservedStockQty ?? 0);

      if (existingItemIndex > -1) {
        const newQty = prevCart[existingItemIndex].quantity + quantity;
        if (newQty > availableStock) {
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        if (quantity > availableStock) {
          return prevCart;
        }
        return [
          ...prevCart,
          {
            id: product.id,
            cartItemId: lineId,
            name: product.name,
            slug: product.slug,
            price: product.price,
            discountPrice: product.discountPrice ?? null,
            thumbnail:
              product.imageUrl ||
              product.thumbnail ||
              (product.images && product.images[0]) ||
              null,
            quantity,
            stockQty: product.stockQty ?? 50,
            reservedStockQty: product.reservedStockQty ?? 0,
            variantId: product.variantId,
            variantName: product.variantName,
            combination: product.combination,
            colorName: product.colorName,
            colorCode: product.colorCode,
            size: product.size,
            weight: product.weight,
          },
        ];
      }
    });
  };

  const removeFromCart = (cartItemIdOrId: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          item.cartItemId !== cartItemIdOrId &&
          item.id !== cartItemIdOrId &&
          item.variantId !== cartItemIdOrId
      )
    );
  };

  const updateQuantity = (cartItemIdOrId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemIdOrId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (
          item.cartItemId === cartItemIdOrId ||
          item.id === cartItemIdOrId ||
          item.variantId === cartItemIdOrId
        ) {
          const availableStock = item.stockQty - item.reservedStockQty;
          if (quantity > availableStock) {
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart_reservation_end");
    setReservationSeconds(RESERVATION_DURATION);
    setIsReservationExpired(false);
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const cartSubtotal = cart.reduce((subtotal, item) => {
    const itemPrice = item.discountPrice !== null ? item.discountPrice : item.price;
    return subtotal + itemPrice * item.quantity;
  }, 0);

  const minutes = Math.floor(reservationSeconds / 60);
  const seconds = reservationSeconds % 60;
  const formattedReservationTimer = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        reservationSeconds,
        formattedReservationTimer,
        isReservationExpired,
        resetReservationTimer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
