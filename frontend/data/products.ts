import { Category, Product } from "../types/shop";

export const categories: Category[] = [
  {
    id: "cat_electronics",
    name: "Electronics",
    slug: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "cat_apparel",
    name: "Apparel",
    slug: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "cat_home_living",
    name: "Home & Living",
    slug: "home-living",
    imageUrl: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=600&auto=format&fit=crop",
  },
];

export const products: Product[] = [
  {
    id: "prod_iphone",
    name: "Premium Smartphone X1",
    description: "Experience the next level of mobile computing with state-of-the-art processors, OLED screen resolution, and triple camera matrix capture.",
    price: 999.99,
    categoryId: "cat_electronics",
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565849906663-bd227193a558?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=600&auto=format&fit=crop",
    ],
  },
  {
    id: "prod_headphones",
    name: "Wireless ANC Headphones Pro",
    description: "Immerse yourself in acoustic purity with active noise cancellation, low-latency audio transmission, and premium ergonomic leather ear cups.",
    price: 249.99,
    categoryId: "cat_electronics",
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=600&auto=format&fit=crop",
    ],
  },
  {
    id: "prod_tshirt",
    name: "Organic Cotton Comfort T-Shirt",
    description: "Crafted from 100% certified organic long-staple cotton, providing unmatched breathable comfort, clean tailoring, and durable wash structure.",
    price: 29.99,
    categoryId: "cat_apparel",
    rating: 4.4,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
    ],
  },
  {
    id: "prod_shoes",
    name: "SpeedRun Performance Trainers",
    description: "Engineered speed running trainers equipped with responsive nitrogen-infused foam mid-soles and high-grip carbon rubber outsoles.",
    price: 129.99,
    categoryId: "cat_apparel",
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop",
    ],
  },
  {
    id: "prod_coffeemaker",
    name: "Artisan Drip Coffee Station",
    description: "Programmed precision water temperature and pre-infusion bloom cycle mapping delivers barista-quality pour-over drip coffee at home.",
    price: 89.99,
    categoryId: "cat_home_living",
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop",
    ],
  },
  {
    id: "prod_lamp",
    name: "Minimalist Modern Oak Desk Lamp",
    description: "Warm adjustable LED desk light wrapped in custom machined oak timber and brushed steel details. Elevates home workspace atmospheres.",
    price: 49.99,
    categoryId: "cat_home_living",
    rating: 4.3,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?q=80&w=600&auto=format&fit=crop",
    ],
  },
];
