"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface CartItem {
  id: string; // Product ID
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
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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
        setCart(parsed);
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
      const itemKey = product.variantId ? `${product.id}-${product.variantId}` : product.id;
      const existingItemIndex = prevCart.findIndex((item) =>
        item.variantId ? `${item.id}-${item.variantId}` === itemKey : item.id === product.id
      );

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
            name: product.name,
            slug: product.slug,
            price: product.price,
            discountPrice: product.discountPrice ?? null,
            thumbnail: product.thumbnail || (product.images && product.images[0]) || null,
            quantity,
            stockQty: product.stockQty ?? 50,
            reservedStockQty: product.reservedStockQty ?? 0,
            variantId: product.variantId,
            variantName: product.variantName,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId && item.variantId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId || item.variantId === productId) {
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
