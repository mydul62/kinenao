import React from "react";
import Link from "next/link";
import Image from "next/image";
import { categories, products } from "../../../data/products";
import { Star } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Find active category
  const activeCategory = categories.find((cat) => cat.slug === slug);

  if (!activeCategory) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-destructive">Category Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested category "{slug}" does not exist in our store collections.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl text-sm"
        >
          Return to Shop Home
        </Link>
      </div>
    );
  }

  // Filter products matching category
  const filteredProducts = products.filter((prod) => prod.categoryId === activeCategory.id);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Category Banner header */}
      <div className="relative h-60 w-full rounded-3xl overflow-hidden border shadow-sm flex items-center">
        <Image
          src={activeCategory.imageUrl}
          alt={activeCategory.name}
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-50"
        />
        <div className="relative z-10 px-8 text-white space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {activeCategory.name} Catalog
          </h1>
          <p className="text-sm text-gray-200 max-w-md">
            Browse our premium curation of {activeCategory.name.toLowerCase()} items.
          </p>
        </div>
      </div>

      {/* Products list grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <span className="text-xs font-bold text-muted-foreground">
            Displaying {filteredProducts.length} items
          </span>
          <Link href="/" className="text-xs font-bold text-primary hover:underline">
            Back to All Products
          </Link>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No products are currently available in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col"
              >
                <Link href={`/product/${prod.id}`} className="relative aspect-square block bg-muted/40 border-b">
                  <Image
                    src={prod.images[0]}
                    alt={prod.name}
                    fill
                    sizes="(max-w-768px) 100vw, 33vw"
                    className="object-cover hover:scale-105 transition-all duration-300"
                  />
                </Link>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-primary">
                      {activeCategory.name}
                    </span>
                    <Link
                      href={`/product/${prod.id}`}
                      className="block font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {prod.name}
                    </Link>
                    <div className="flex items-center gap-1 text-yellow-500 text-xs">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="font-semibold text-muted-foreground">{prod.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-foreground">
                      ${prod.price.toFixed(2)}
                    </span>
                    <Link
                      href={`/product/${prod.id}`}
                      className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
