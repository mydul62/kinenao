"use client";

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface AddToCartButtonProps {
  product: any;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    setLoading(true);
    // Simulate minor transition animation latency
    setTimeout(() => {
      addToCart(product);
      toast.success(`"${product.name}" added to cart!`);
      setLoading(false);
    }, 400);
  };

  return (
    <Button
      onClick={handleAdd}
      disabled={loading}
      className="w-full md:w-auto font-bold h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Adding...
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> Add to Cart
        </>
      )}
    </Button>
  );
};

export default AddToCartButton;
