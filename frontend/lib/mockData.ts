export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  parentId?: string | null;
  parentCategory?: { name: string; slug: string } | null;
  childCategories?: Category[];
  itemCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface Variant {
  id: string;
  name: string;
  colorName?: string | null;
  colorCode?: string | null;
  imageUrl?: string | null;
  sku?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  stockQty?: number;
  size?: string | null;
  isActive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice?: number | null;
  weight?: number;
  unit?: string;
  stockQty: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isFlashSale: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isRecommended?: boolean;
  customBadge?: string | null;
  promotionalBadges?: string[];
  thumbnail: string;
  images: string[];
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
  variants?: Variant[];
  description: string;
  categoryId: string;
  category: { id: string; name: string; slug: string; parentCategory?: any };
  brandId?: string;
  brand?: { id: string; name: string; slug: string };
  rating?: number;
  reviewsCount?: number;
  tags?: string | null;
}

// Complete multi-level Kinenao categories with rich subcategories
export const mockCategories: Category[] = [
  {
    id: "cat-saree",
    name: "Saree (শাড়ি)",
    slug: "saree",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    description: "এক্সক্লুসিভ জর্জেট, সুতি, সিল্ক ও ঢাকাই জামদানি শাড়ির বিশাল কালেকশন",
    itemCount: 84,
    childCategories: [
      { id: "sub-cotton-saree", name: "Cotton Saree", slug: "cotton-saree", parentId: "cat-saree", itemCount: 28, imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-silk-saree", name: "Silk Saree", slug: "silk-saree", parentId: "cat-saree", itemCount: 24, imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-jamdani-saree", name: "Dhakai Jamdani", slug: "jamdani-saree", parentId: "cat-saree", itemCount: 18, imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-georgette-saree", name: "Georgette & Chiffon", slug: "georgette-saree", parentId: "cat-saree", itemCount: 14, imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop" },
    ],
  },
  {
    id: "cat-three-piece",
    name: "Three Piece (থ্রি-পিস)",
    slug: "three-piece",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    description: "ডিজাইনার এম্ব্রয়ডারি, পার্টি ওয়্যার ও লন থ্রি-পিস স্যুট কালেকশন",
    itemCount: 68,
    childCategories: [
      { id: "sub-embroidered", name: "Embroidered Cotton", slug: "embroidered-three-piece", parentId: "cat-three-piece", itemCount: 32, imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-party-wear", name: "Party Wear & Silk", slug: "party-wear-three-piece", parentId: "cat-three-piece", itemCount: 22, imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-lawn-suits", name: "Digital Print Lawn", slug: "lawn-suits", parentId: "cat-three-piece", itemCount: 14, imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop" },
    ],
  },
  {
    id: "cat-beauty",
    name: "Beauty & Cosmetics",
    slug: "beauty-cosmetics",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
    description: "১০০% অথেনটিক লিপস্টিক, স্কিনকেয়ার সিরাম, মেকআপ ও পারফিউম",
    itemCount: 92,
    childCategories: [
      { id: "sub-lipsticks", name: "Lipsticks & Gloss", slug: "lipsticks", parentId: "cat-beauty", itemCount: 36, imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-skincare", name: "Skincare Serums", slug: "skincare", parentId: "cat-beauty", itemCount: 28, imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-foundation", name: "Foundation & Powders", slug: "foundation", parentId: "cat-beauty", itemCount: 16, imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-perfumes", name: "Designer Perfumes", slug: "perfumes", parentId: "cat-beauty", itemCount: 12, imageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&auto=format&fit=crop" },
    ],
  },
  {
    id: "cat-bags",
    name: "Bags & Purses",
    slug: "bags-purses",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    description: "স্টাইলিশ লেদার হ্যান্ডব্যাগ, ক্লাচ, শোল্ডার ব্যাগ ও ওয়ালেট",
    itemCount: 46,
    childCategories: [
      { id: "sub-leather-bags", name: "Leather Handbags", slug: "leather-handbags", parentId: "cat-bags", itemCount: 22, imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-clutches", name: "Party Clutches", slug: "party-clutches", parentId: "cat-bags", itemCount: 14, imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-wallets", name: "Ladies Wallets", slug: "ladies-wallets", parentId: "cat-bags", itemCount: 10, imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop" },
    ],
  },
  {
    id: "cat-jewellery",
    name: "Jewellery & Ornaments",
    slug: "jewellery",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    description: "গোল্ড প্লেটেড ব্রাইডাল সেট, পার্ল নেকলেস ও ট্রেন্ডি কানের দুল",
    itemCount: 55,
    childCategories: [
      { id: "sub-bridal-sets", name: "Bridal Sets", slug: "bridal-sets", parentId: "cat-jewellery", itemCount: 20, imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-necklaces", name: "Pearl Necklaces", slug: "pearl-necklaces", parentId: "cat-jewellery", itemCount: 18, imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-earrings", name: "Traditional Earrings", slug: "traditional-earrings", parentId: "cat-jewellery", itemCount: 17, imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop" },
    ],
  },
  {
    id: "cat-kids",
    name: "Kids & Toys",
    slug: "kids-toys",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop",
    description: "বাচ্চাদের আকর্ষণীয় খেলনা, সুন্দর পোশাক ও শিক্ষণীয় বই",
    itemCount: 42,
    childCategories: [
      { id: "sub-kids-toys", name: "Educational Toys", slug: "educational-toys", parentId: "cat-kids", itemCount: 20, imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-kids-clothes", name: "Kids Fashion", slug: "kids-fashion", parentId: "cat-kids", itemCount: 14, imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-kids-books", name: "Story & Drawing Books", slug: "kids-books", parentId: "cat-kids", itemCount: 8, imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop" },
    ],
  },
  {
    id: "cat-watches",
    name: "Watches & Accessories",
    slug: "watches",
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop",
    description: "লাক্সারি ক্লাসিক ক্রোনোগ্রাফ ঘড়ি ও প্রিমিয়াম বেল্ট",
    itemCount: 38,
    childCategories: [
      { id: "sub-ladies-watches", name: "Ladies Elegant Watches", slug: "ladies-watches", parentId: "cat-watches", itemCount: 20, imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-smart-watches", name: "Smart Fitness Watches", slug: "smart-watches", parentId: "cat-watches", itemCount: 18, imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop" },
    ],
  },
  {
    id: "cat-cooking",
    name: "Cooking & Grocery",
    slug: "cooking",
    imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop",
    description: "খাঁটি সরিষার তেল, চাল, ডাল, ঘি, চিনি, মসলা ও রান্নার প্রয়োজনীয় সামগ্রী",
    itemCount: 110,
    childCategories: [
      { id: "sub-spices", name: "Spices & Powders", slug: "spices", parentId: "cat-cooking", itemCount: 89, imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-oil", name: "Mustard & Cooking Oil", slug: "oil", parentId: "cat-cooking", itemCount: 48, imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-rice", name: "Premium Rice", slug: "rice", parentId: "cat-cooking", itemCount: 37, imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-dal", name: "Dal & Lentils", slug: "dal-lentil", parentId: "cat-cooking", itemCount: 25, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-ghee", name: "Pure Ghee", slug: "ghee", parentId: "cat-cooking", itemCount: 13, imageUrl: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?q=80&w=600&auto=format&fit=crop" },
      { id: "sub-ready-mix", name: "Ready Mix & Halim", slug: "ready-mix", parentId: "cat-cooking", itemCount: 54, imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop" },
    ],
  },
];

export const mockBrands: Brand[] = [
  { id: "brand-kinenao", name: "Kinenao Luxe", slug: "kinenao-luxe", isActive: true },
  { id: "brand-heritage", name: "Heritage Craft", slug: "heritage-craft", isActive: true },
  { id: "brand-nature", name: "Pure Nature", slug: "pure-nature", isActive: true },
];

export const mockBanners = [
  {
    id: "banner-1",
    title: "প্রিমিয়াম শাড়ি ও থ্রি-পিস কালেকশন",
    subtitle: "সারা দেশে ১০০% ক্যাশ অন হোম ডেলিভারিতে কেনাকাটা করুন",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
    linkUrl: "/category/saree",
  },
  {
    id: "banner-2",
    title: "ডিজাইনার এম্ব্রয়ডারি থ্রি-পিস ও হ্যান্ডব্যাগ",
    subtitle: "সেরা মানের প্রিমিয়াম ফেব্রিক ও আকর্ষণীয় অফার",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop",
    linkUrl: "/category/three-piece",
  },
];

export const mockFaqs = [
  {
    id: "faq-1",
    question: "আপনাদের ডেলিভারি চার্জ কত?",
    answer: "ঢাকার ভিতরে ডেলিভারি চার্জ ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা।",
  },
  {
    id: "faq-2",
    question: "পণ্য হাতে পাওয়ার পর পেমেন্ট করা যাবে?",
    answer: "হ্যাঁ! সারা দেশে ১০০% ক্যাশ অন হোম ডেলিভারি (COD) সুবিধা রয়েছে। কোনো অগ্রিম পেমেন্ট ছাড়া অর্ডার করতে পারবেন।",
  },
  {
    id: "faq-3",
    question: "পণ্য পছন্দ না হলে কি রিটার্ন করা যাবে?",
    answer: "ডেলিভারি ম্যানের উপস্থিতিতে পণ্য চেক করে নিতে পারবেন। কোনো সমস্যা থাকলে তাৎক্ষণিক রিটার্ন করতে পারবেন।",
  },
];

export const mockTestimonials = [
  {
    id: "test-1",
    name: "আনিকা সুলতানা",
    comment: "শাড়িটির কাপড় ও সুতার নিখুঁত কাজ অসাধারণ ছিল। ঠিক ছবির মতোই পেয়েছি!",
    rating: 5,
  },
  {
    id: "test-2",
    name: "মেহেদী হাসান",
    comment: "খুব দ্রুত ডেলিভারি পেয়েছি। প্রোডাক্টের ফিনিশিং ও প্যাকেজিং ছিল দারুণ।",
    rating: 5,
  },
];

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Premium Handloom Soft Cotton Saree",
    slug: "premium-handloom-soft-cotton-saree",
    sku: "SAR-COT-001",
    price: 2450.0,
    discountPrice: 1750.0,
    stockQty: 85,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isFlashSale: true,
    customBadge: "🔥 Hot Deal",
    thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    videoPosterUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    variants: [
      {
        id: "var-1",
        name: "Crimson Red (লাল)",
        colorName: "Red",
        colorCode: "#DC2626",
        sku: "SAR-COT-001-RED",
        price: 1750.0,
        stockQty: 30,
        imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "var-2",
        name: "Royal Blue (নীল)",
        colorName: "Royal Blue",
        colorCode: "#2563EB",
        sku: "SAR-COT-001-BLU",
        price: 1750.0,
        stockQty: 25,
        imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "var-3",
        name: "Emerald Green (সবুজ)",
        colorName: "Emerald Green",
        colorCode: "#059669",
        sku: "SAR-COT-001-GRN",
        price: 1750.0,
        stockQty: 20,
        imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
      },
    ],
    description: `
<h3>প্রিমিয়াম হ্যান্ডলুম কটন শাড়ি</h3>
<p>আমাদের নিজস্ব তাঁতে তৈরি শতভাগ খাঁটি সুতি শাড়ি। হালকা, আরামদায়ক এবং যেকোনো অনুষ্ঠানে পরিধানের জন্য অত্যন্ত উপযোগী।</p>
<ul>
  <li><strong>ফেব্রিক:</strong> ১০০% সফট প্রিমিয়াম কটন</li>
  <li><strong>দৈর্ঘ্য:</strong> ১২ হাত সম্পূর্ণ শাড়ি + ম্যাচিং ব্লাউজ পিস</li>
  <li><strong>রং গ্যারান্টি:</strong> পাকা রঙের দীর্ঘস্থায়ী নিশ্চয়তা</li>
  <li><strong>ডেলিভারি:</strong> সারা দেশে হোম ডেলিভারি এবং ক্যাশ অন ডেলিভারি সুবিধা</li>
</ul>
    `,
    categoryId: "cat-saree",
    category: { id: "cat-saree", name: "Saree", slug: "saree" },
    brandId: "brand-heritage",
    brand: { id: "brand-heritage", name: "Heritage Craft", slug: "heritage-craft" },
    rating: 5,
    reviewsCount: 18,
  },
  {
    id: "prod-2",
    name: "Designer Embroidered Cotton Three Piece Suit",
    slug: "designer-embroidered-cotton-three-piece-suit",
    sku: "THR-EMB-003",
    price: 3200.0,
    discountPrice: 2290.0,
    stockQty: 60,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    customBadge: "⭐ Best Seller",
    thumbnail: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop",
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    videoPosterUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    variants: [
      {
        id: "var-201",
        name: "Deep Maroon (মেরুন)",
        colorName: "Maroon",
        colorCode: "#831843",
        sku: "THR-EMB-003-MRN",
        price: 2290.0,
        stockQty: 20,
        imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "var-202",
        name: "Navy Blue (নেভি ব্লু)",
        colorName: "Navy",
        colorCode: "#1E3A8A",
        sku: "THR-EMB-003-NVY",
        price: 2290.0,
        stockQty: 25,
        imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
      },
    ],
    description: `
<h3>ডিজাইনার এম্ব্রয়ডারি থ্রি-পিস</h3>
<p>উন্নত মানের প্রিমিয়াম জর্জেট ও কটন কম্বিনেশনের গর্জিয়াস থ্রি-পিস সেট। কামিজ, সালোয়ার ও শিফন ওড়নায় নিখুঁত কারুকাজ।</p>
    `,
    categoryId: "cat-three-piece",
    category: { id: "cat-three-piece", name: "Three Piece", slug: "three-piece" },
    brandId: "brand-kinenao",
    brand: { id: "brand-kinenao", name: "Kinenao Luxe", slug: "kinenao-luxe" },
    rating: 5,
    reviewsCount: 12,
  },
  {
    id: "prod-3",
    name: "Luxury Leather Handbag with Shoulder Strap",
    slug: "luxury-leather-handbag-shoulder-strap",
    sku: "BAG-LTH-005",
    price: 2800.0,
    discountPrice: 1950.0,
    stockQty: 45,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    customBadge: "✨ New Style",
    thumbnail: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    ],
    variants: [
      {
        id: "var-bag-1",
        name: "Classic Black",
        colorName: "Black",
        colorCode: "#111827",
        sku: "BAG-LTH-005-BLK",
        price: 1950.0,
        stockQty: 25,
      },
      {
        id: "var-bag-2",
        name: "Tan Brown",
        colorName: "Brown",
        colorCode: "#78350F",
        sku: "BAG-LTH-005-BRN",
        price: 1950.0,
        stockQty: 20,
      },
    ],
    description: `
<h3>প্রিমিয়াম লেদার হ্যান্ডব্যাগ</h3>
<p>উন্নত মানের পিইউ লেদার ও ওয়াটারপ্রুফ ইনার লাইনিং দিয়ে তৈরি স্টাইলিশ ব্যাগ। অফিস ও পার্টির জন্য উপযুক্ত।</p>
    `,
    categoryId: "cat-bags",
    category: { id: "cat-bags", name: "Bags & Purses", slug: "bags-purses" },
    rating: 5,
    reviewsCount: 16,
  },
  {
    id: "prod-4",
    name: "Traditional Gold Plated Bridal Jewellery Set",
    slug: "traditional-gold-plated-bridal-jewellery-set",
    sku: "JWL-SET-002",
    price: 3500.0,
    discountPrice: 2450.0,
    stockQty: 30,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    customBadge: "👑 Bridal Choice",
    thumbnail: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    ],
    description: `
<h3>রয়্যাল গোল্ড প্লেটেড জুয়েলারি সেট</h3>
<p>নেকলেস, কানের দুল ও টিকলিসহ সম্পূর্ণ জমকালো সেট। দীর্ঘস্থায়ী কালার গ্যারান্টি।</p>
    `,
    categoryId: "cat-jewellery",
    category: { id: "cat-jewellery", name: "Jewellery", slug: "jewellery" },
    rating: 5,
    reviewsCount: 22,
  },
];
