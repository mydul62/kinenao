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
    id: "cat-sari",
    name: "শাড়ি",
    slug: "sari",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    description: "ঐতিহ্যবাহী ঢাকাই জামদানি, মিরপুর কাতান, বেনারসি, সিল্ক ও সুতি শাড়ির এক্সক্লুসিভ কালেকশন",
    itemCount: 10,
  },
  {
    id: "cat-three-piece",
    name: "থ্রি-পিস",
    slug: "three-piece",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    description: "এমব্রয়ডারি, পিওর কটন, পাকিস্তানি লন, জর্জেট ও গর্জিয়াস পার্টি থ্রি-পিসের সমাহার",
    itemCount: 10,
  },
  {
    id: "cat-kids",
    name: "বাচ্চাদের পোশাক ও খেলনা",
    slug: "kids",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop",
    description: "নবজাতক ও শিশুদের নরম আরামদায়ক পোশাক, বেবি ফ্রক, রম্পার এবং খেলনা",
    itemCount: 10,
  },
  {
    id: "cat-bag-and-pump",
    name: "ব্যাগ ও পাম্প",
    slug: "bag-and-pump",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    description: "লেডিস প্রিমিয়াম হ্যান্ডব্যাগ, শোল্ডার ব্যাগ, ফ্যাশনেবল ক্লাচ, ওয়ালেট ও হিল পাম্প জুতা",
    itemCount: 10,
  },
  {
    id: "cat-couple-items",
    name: "প্রেম/কাপল আইটেম",
    slug: "couple-items",
    imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    description: "কাপল ম্যাচিং ড্রেস, রোমান্টিক সিরামিক মগ সেট, কাপল ব্রেসলেট, ফটো ফ্রেম ও স্পেশাল গিফট",
    itemCount: 10,
  },
  {
    id: "cat-jewelry-and-accessories",
    name: "জুয়েলারি ও এক্সেসরিজ",
    slug: "jewelry-and-accessories",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    description: "কুন্দন নেকলেস সেট, ঐতিহ্যবাহী ঝুমকা, প্রিমিয়াম চুড়ি সেট, ফিঙ্গার রিং ও এক্সেসরিজ",
    itemCount: 10,
  },
  {
    id: "cat-watch-and-bagel",
    name: "ঘড়ি ও ব্যাগেল",
    slug: "watch-and-bagel",
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop",
    description: "নারী ও পুরুষের লাক্সারি কোয়ার্টজ ঘড়ি, মেটাল চেইন ওয়াচ, স্মার্ট ঘড়ি ও ফ্যাশন ব্যাগেল",
    itemCount: 10,
  },
  {
    id: "cat-electronics-and-gadgets",
    name: "ইলেকট্রনিক্স ও গ্যাজেট",
    slug: "electronics-and-gadgets",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
    description: "ওয়্যারলেস ব্লুটুথ ইয়ারবাড, হেডফোন, ফাস্ট চার্জিং পাওয়ার ব্যাংক, স্পিকার ও স্মার্ট গ্যাজেট",
    itemCount: 10,
  },
  {
    id: "cat-home-decor",
    name: "হোম ডেকোর",
    slug: "home-decor",
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
    description: "দেয়াল ঘড়ি, আধুনিক ফুলদানি, টেবিল ল্যাম্প, ক্যালিগ্রাফি ওয়াল আর্ট, কুশন কভার ও শোপিস",
    itemCount: 10,
  },
  {
    id: "cat-organic-products",
    name: "অর্গানিক পণ্য",
    slug: "organic-products",
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop",
    description: "১০০% প্রাকৃতিক সুন্দরবনের মধু, খাঁটি সরিষার তেল, নারিকেল তেল, খেজুরের গুড় ও ড্রাই ফ্রুটস",
    itemCount: 10,
  },
  {
    id: "cat-kitchen-items",
    name: "কিচেন আইটেম",
    slug: "kitchen-items",
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop",
    description: "নন-স্টিক ফ্রাইপ্যান, স্টেইনলেস স্টিল কুকিং পট সেট, শেফ নাইফ, কাটিং বোর্ড ও কিচেন অর্গানাইজার",
    itemCount: 10,
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
  {
    id: "prod-fruit-1",
    name: "Fresh Fuji Apples (তাজা ফুজি আপেল)",
    slug: "fresh-fuji-apples-1kg",
    sku: "FRT-APP-001",
    price: 320.0,
    discountPrice: 280.0,
    weight: 1,
    unit: "kg",
    stockQty: 50,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    customBadge: "🍎 100% Fresh",
    thumbnail: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=800&auto=format&fit=crop",
    ],
    description: `
<h3>তাজা ফুজি আপেল (১ কেজি)</h3>
<p>ফরমালিনমুক্ত, অত্যন্ত মিষ্টি ও রসালো প্রিমিয়াম কোয়ালিটি ফুজি আপেল। প্রতিদিন তাজা স্টক সংগ্রহ করা হয়।</p>
    `,
    categoryId: "cat-fruits-vegetables",
    category: { id: "cat-fruits-vegetables", name: "Fruits & Vegetables", slug: "fruits-vegetables" },
    tags: "fresh-fruits, fruits",
    rating: 5,
    reviewsCount: 38,
  },
  {
    id: "prod-fruit-2",
    name: "Premium Rajshahi Himsagar Mango (হিমসাগর আম)",
    slug: "himsagar-mango-5kg",
    sku: "FRT-MNG-002",
    price: 650.0,
    discountPrice: 550.0,
    weight: 5,
    unit: "kg",
    stockQty: 40,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    customBadge: "🥭 রাজশাহীর আম",
    thumbnail: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop",
    ],
    description: `
<h3>রাজশাহীর বিখ্যাত হিমসাগর আম (৫ কেজি)</h3>
<p>গাছপাকা, রাসায়নিক ও কার্বাইড মুক্ত সুস্বাদু সুবাসিত হিমসাগর আম সরাসরি বাগান থেকে প্যাকিং।</p>
    `,
    categoryId: "cat-fruits-vegetables",
    category: { id: "cat-fruits-vegetables", name: "Fruits & Vegetables", slug: "fruits-vegetables" },
    tags: "fresh-fruits, fruits",
    rating: 5,
    reviewsCount: 64,
  },
  {
    id: "prod-veg-1",
    name: "Fresh Red Tomatoes (দেশি পাকা টমেটো)",
    slug: "fresh-red-tomatoes-1kg",
    sku: "VEG-TOM-001",
    price: 90.0,
    discountPrice: 75.0,
    weight: 1,
    unit: "kg",
    stockQty: 60,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    customBadge: "🍅 খামার ফ্রেশ",
    thumbnail: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop",
    ],
    description: `
<h3>দেশি খামারের তাজা লাল টমেটো (১ কেজি)</h3>
<p>সম্পূর্ণ অর্গানিক উপায়ে উৎপাদিত রসালো টমেটো। সালাদ ও রান্নার জন্য পারফেক্ট।</p>
    `,
    categoryId: "cat-fruits-vegetables",
    category: { id: "cat-fruits-vegetables", name: "Fruits & Vegetables", slug: "fruits-vegetables" },
    tags: "fresh-veg, vegetables",
    rating: 4.8,
    reviewsCount: 19,
  },
  {
    id: "prod-veg-2",
    name: "Organic Green Spinach (তাজা সবুজ পালং শাক)",
    slug: "organic-green-spinach-bundle",
    sku: "VEG-SPN-002",
    price: 45.0,
    discountPrice: 35.0,
    weight: 1,
    unit: "bundle",
    stockQty: 30,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    customBadge: "🥬 অর্গানিক শাক",
    thumbnail: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=800&auto=format&fit=crop",
    ],
    description: `
<h3>অর্গানিক সবুজ পালং শাক (১ আঁটি)</h3>
<p>পুষ্টিগুণে ভরপুর কীটনাশকমুক্ত তাজা পালং শাক। প্রতিদিন ভোরে জমি থেকে তোলা।</p>
    `,
    categoryId: "cat-fruits-vegetables",
    category: { id: "cat-fruits-vegetables", name: "Fruits & Vegetables", slug: "fruits-vegetables" },
    tags: "fresh-veg, vegetables",
    rating: 4.9,
    reviewsCount: 27,
  },
  {
    id: "prod-salad-1",
    name: "Crisp Green Lettuce & Salad Mix (লেটুস ও সালাদ মিক্স)",
    slug: "crisp-green-lettuce-salad-mix",
    sku: "SLD-LET-001",
    price: 120.0,
    discountPrice: 95.0,
    weight: 250,
    unit: "gm",
    stockQty: 25,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    customBadge: "🥗 ফ্রেশ সালাদ",
    thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
    ],
    description: `
<h3>ফ্রেশ লেটুস পাতা ও প্রিমিয়াম সালাদ বক্স</h3>
<p>হাইড্রোফোনিক পদ্ধতিতে চাষ করা স্বাস্থ্যকর কুঁচকানো লেটুস ও পুদিনা পাতার ফ্রেশ মিক্স।</p>
    `,
    categoryId: "cat-fruits-vegetables",
    category: { id: "cat-fruits-vegetables", name: "Fruits & Vegetables", slug: "fruits-vegetables" },
    tags: "organic-salad, salad",
    rating: 4.7,
    reviewsCount: 14,
  },
  {
    id: "prod-dry-1",
    name: "California Roasted Almonds (আমন্ড বাদাম)",
    slug: "california-roasted-almonds-500g",
    sku: "NUT-ALM-001",
    price: 750.0,
    discountPrice: 620.0,
    weight: 500,
    unit: "gm",
    stockQty: 35,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    customBadge: "🌰 প্রিমিয়াম নাটস",
    thumbnail: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=800&auto=format&fit=crop",
    ],
    description: `
<h3>ক্যালিফোর্নিয়া রোস্টেড আমন্ড বাদাম (৫০০ গ্রাম)</h3>
<p>পুষ্টিগুণ ও এনার্জিতে ভরপুর ক্রিস্পি আমন্ড। ১০০% আসল ও প্রিমিয়াম গ্রেড।</p>
    `,
    categoryId: "cat-fruits-vegetables",
    category: { id: "cat-fruits-vegetables", name: "Fruits & Vegetables", slug: "fruits-vegetables" },
    tags: "dry-fruits, nuts",
    rating: 5,
    reviewsCount: 42,
  },
];
