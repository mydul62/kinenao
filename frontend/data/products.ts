export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  parentId?: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  categoryId: string;
  rating?: number;
  images: string[];
  videoUrl?: string | null;
  variants?: any[];
}

export const categories: Category[] = [
  {
    id: "cat_saree",
    name: "Saree (শাড়ি)",
    slug: "saree",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "cat_three_piece",
    name: "Three Piece (থ্রি-পিস)",
    slug: "three-piece",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "cat_kids",
    name: "Kids (বাচ্চাদের পণ্য)",
    slug: "kids",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "cat_bags",
    name: "Bags & Purses",
    slug: "bags-purses",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "cat_jewellery",
    name: "Jewellery",
    slug: "jewellery",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "cat_watches",
    name: "Watches",
    slug: "watches",
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop",
  },
];

export const products: Product[] = [
  {
    id: "prod_saree_1",
    name: "Premium Handloom Soft Cotton Saree",
    description: "আমাদের নিজস্ব তাঁতে তৈরি শতভাগ খাঁটি সুতি শাড়ি। হালকা, আরামদায়ক এবং যেকোনো ঋতুতে পরিধানের জন্য অত্যন্ত উপযোগী।",
    price: 1750.0,
    discountPrice: 2450.0,
    categoryId: "cat_saree",
    rating: 5.0,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop",
    ],
    variants: [
      { id: "v1", name: "Crimson Red", colorName: "Red", colorCode: "#DC2626", price: 1750.0 },
      { id: "v2", name: "Royal Blue", colorName: "Blue", colorCode: "#2563EB", price: 1750.0 },
    ],
  },
  {
    id: "prod_three_piece_1",
    name: "Designer Embroidered Cotton Three Piece Suit",
    description: "উন্নত মানের প্রিমিয়াম জর্জেট ও কটন কম্বিনেশনের গর্জিয়াস থ্রি-পিস সেট।",
    price: 2290.0,
    discountPrice: 3200.0,
    categoryId: "cat_three_piece",
    rating: 4.9,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
    ],
    variants: [
      { id: "v3", name: "Maroon", colorName: "Maroon", colorCode: "#831843", price: 2290.0 },
      { id: "v4", name: "Navy Blue", colorName: "Navy", colorCode: "#1E3A8A", price: 2290.0 },
    ],
  },
];
