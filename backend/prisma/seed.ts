import { PrismaClient, Role, CouponType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in env variables");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("==========================================================");
  console.log("STARTING COMPLETE DATABASE RESET & SUB-CATEGORY SEEDING");
  console.log("==========================================================");

  // 1. Clear existing transactional & catalog records safely
  console.log("1. Clearing existing catalog and transactional data...");
  await prisma.timelineEvent.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.paymentMethod.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.deliveryZone.deleteMany({});
  await prisma.homepageContent.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.websiteSetting.deleteMany({});
  await prisma.newsletterSubscriber.deleteMany({});

  // 2. Create Users
  console.log("2. Creating Users (Admin, Manager, Customer)...");
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("admin123", salt);
  const managerPassword = await bcrypt.hash("manager123", salt);
  const customerPassword = await bcrypt.hash("customer123", salt);

  await prisma.user.create({
    data: {
      email: "admin@kinenao.com",
      password: adminPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          fullName: "System Admin",
          phoneNumber: "01700000001",
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "manager@kinenao.com",
      password: managerPassword,
      role: Role.MANAGER,
      profile: {
        create: {
          fullName: "Store Manager",
          phoneNumber: "01700000002",
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "customer@kinenao.com",
      password: customerPassword,
      role: Role.CUSTOMER,
      profile: {
        create: {
          fullName: "Anika Rahman",
          phoneNumber: "01900000003",
          addresses: {
            create: [
              {
                street: "House 12, Road 5, Sector 3",
                city: "Dhaka",
                postalCode: "1230",
                area: "Uttara",
                isDefault: true,
              },
            ],
          },
        },
      },
    },
  });

  // 3. Create Delivery Zones
  console.log("3. Creating Delivery Zones...");
  await prisma.deliveryZone.create({
    data: {
      zoneName: "Inside Dhaka (ঢাকা সিটির ভিতরে)",
      charge: 60,
      estDeliveryTime: "24-48 Hours",
    },
  });

  await prisma.deliveryZone.create({
    data: {
      zoneName: "Dhaka Suburbs (সাভার, গাজীপুর, কেরানীগঞ্জ)",
      charge: 100,
      estDeliveryTime: "2-3 Days",
    },
  });

  await prisma.deliveryZone.create({
    data: {
      zoneName: "Outside Dhaka (সারাদেশে জেলা শহর)",
      charge: 120,
      estDeliveryTime: "3-5 Days",
    },
  });

  // 4. Create Payment Methods
  console.log("4. Creating Payment Methods...");
  await prisma.paymentMethod.create({
    data: {
      name: "Cash on Delivery (ক্যাশ অন ডেলিভারি)",
      accountNumber: "N/A",
      accountType: "COD",
      instructions: "পণ্য হাতে পেয়ে চেক করে সম্পূর্ণ মূল্য পরিশোধ করুন। সারা দেশে ১০০% নিরাপদ ডেলিভারি।",
      isActive: true,
    },
  });

  await prisma.paymentMethod.create({
    data: {
      name: "bKash Personal (বিকাশ পার্সোনাল)",
      accountNumber: "01700000000",
      accountType: "bKash",
      instructions: "বিকাশ সেন্ড মানি করে ট্রানজেকশন আইডি (TrxID) দিয়ে কনফার্ম করুন।",
      isActive: true,
    },
  });

  await prisma.paymentMethod.create({
    data: {
      name: "Nagad Personal (নগদ পার্সোনাল)",
      accountNumber: "01800000000",
      accountType: "Nagad",
      instructions: "নগদ সেন্ড মানি করে ট্রানজেকশন আইডি দিয়ে অর্ডার কনফার্ম করুন।",
      isActive: true,
    },
  });

  // 5. Create Coupons
  console.log("5. Creating Coupons...");
  await prisma.coupon.create({
    data: {
      code: "WELCOME100",
      type: CouponType.FIXED,
      value: 100,
      minPurchase: 1000,
      usageLimit: 500,
      usageCount: 12,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: "EID15",
      type: CouponType.PERCENTAGE,
      value: 15,
      minPurchase: 2000,
      usageLimit: 1000,
      usageCount: 45,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // 6. Create Website Settings
  console.log("6. Creating Website Settings, FAQs, Banners & Testimonials...");
  await prisma.websiteSetting.create({
    data: {
      key: "general",
      value: {
        siteName: "KineNao E-Commerce",
        siteTagline: "আপনার বিশ্বস্ত অনলাইন শপিং মল",
        supportPhone: "+880 1700-000000",
        supportEmail: "support@kinenao.com",
        officeAddress: "House 24, Road 11, Banani, Dhaka-1213, Bangladesh",
        announcementText: "🔥 মেগা অফার! ১০০০ টাকার কেনাকাটায় সারা দেশে ফ্রি হোম ডেলিভারি! কোড: WELCOME100",
        freeDeliveryThreshold: 2000,
        currency: "BDT",
        currencySymbol: "৳",
      },
    },
  });

  // Banners
  await prisma.banner.createMany({
    data: [
      {
        title: "১০০% প্রিমিয়াম শাড়ি ও ফ্যাশন কালেকশন",
        subtitle: "ঐতিহ্যবাহী জামদানি, বেনারসি ও কাতান শাড়িতে আকর্ষণীয় ছাড়!",
        imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
        linkUrl: "/category/sari",
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "ট্রেন্ডি থ্রি-পিস ও লেডিস ব্যাগেল",
        subtitle: "নতুন ডিজাইনের এক্সক্লুসিভ কালেকশন সারা দেশে ক্যাশ অন ডেলিভারিতে।",
        imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop",
        linkUrl: "/category/three-piece",
        sortOrder: 2,
        isActive: true,
      },
      {
        title: "স্মার্ট গ্যাজেট ও ইলেকট্রনিক্স",
        subtitle: "ইয়ারবাড, হেডফোন, পাওয়ার ব্যাংক ও স্মার্ট ওয়াচে বিশেষ ডিসকাউন্ট।",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
        linkUrl: "/category/electronics-and-gadgets",
        sortOrder: 3,
        isActive: true,
      },
      {
        title: "খাঁটি ও প্রাকৃতিক অর্গানিক খাদ্যপণ্য",
        subtitle: "সুন্দরবনের মধু, কাঠের ঘানির সরিষার তেল ও পুষ্টিকর সুপারফুড।",
        imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop",
        linkUrl: "/category/organic-products",
        sortOrder: 4,
        isActive: true,
      },
    ],
  });

  // FAQs
  await prisma.fAQ.createMany({
    data: [
      {
        question: "কিভাবে অর্ডার কনফার্ম করব?",
        answer: "পছন্দের পণ্য কার্টে যুক্ত করে 'Order Now' বা 'Checkout' বাটনে ক্লিক করুন। আপনার নাম, মোবাইল নম্বর ও ঠিকানা দিয়ে ক্যাশ অন ডেলিভারিতে সহজে অর্ডার সম্পন্ন করুন।",
        sortOrder: 1,
        isActive: true,
      },
      {
        question: "ডেলিভারি চার্জ কত এবং কত দিনে ডেলিভারি পাব?",
        answer: "ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৬০ টাকা (২৪-৪৮ ঘন্টা) এবং ঢাকার বাইরে ১২০ টাকা (২-৩ কার্যদিবস)।",
        sortOrder: 2,
        isActive: true,
      },
      {
        question: "পণ্য হাতে পেয়ে কি চেক করা যাবে?",
        answer: "হ্যাঁ, ডেলিভারি ম্যানের সামনে প্যাকেট খুলে পণ্য দেখে ১০০% সন্তুষ্ট হয়ে মূল্য পরিশোধ করবেন।",
        sortOrder: 3,
        isActive: true,
      },
      {
        question: "পণ্য রিটার্ন বা পরিবর্তন করার নিয়ম কি?",
        answer: "ডেলিভারি পাওয়ার ৭ দিনের মধ্যে আমাদের কাস্টমার সাপোর্টে কল করে খুব সহজেই পণ্য রিটার্ন বা এক্সচেঞ্জ করতে পারবেন।",
        sortOrder: 4,
        isActive: true,
      },
    ],
  });

  // Testimonials
  await prisma.testimonial.createMany({
    data: [
      {
        customerName: "নুসরাত জাহান",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        message: "জামদানি শাড়িটা সত্যি চমৎকার! কাপড়ের মান এবং ফিনিশিং অসাধারণ। ডেলিভারিও খুব দ্রুত পেয়েছি।",
        rating: 5,
        sortOrder: 1,
        isActive: true,
      },
      {
        customerName: "তানভীর আহমেদ",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        message: "স্মার্ট ওয়াচ এবং ইয়ারবাড অর্ডার করেছিলাম। দুইটাই ১০০% অরিজিনাল এবং দারুণ পারফর্ম করছে।",
        rating: 5,
        sortOrder: 2,
        isActive: true,
      },
      {
        customerName: "ফারহানা করিম",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
        message: "অর্গানিক সরিষার তেল এবং মধু একদম খাঁটি। গন্ধ ও স্বাদ অসাধারণ। বারবার অর্ডার করব।",
        rating: 5,
        sortOrder: 3,
        isActive: true,
      },
    ],
  });

  // Brands
  const createdBrands: Record<string, string> = {};
  for (const b of [{"name":"Kinenao Luxe","slug":"kinenao-luxe"},{"name":"Heritage Craft","slug":"heritage-craft"},{"name":"Pure Nature","slug":"pure-nature"}]) {
    const brand = await prisma.brand.create({
      data: { name: b.name, slug: b.slug, isActive: true },
    });
    createdBrands[b.slug] = brand.id;
  }

  // 7. CREATE 11 MAIN PARENT CATEGORIES
  console.log("7. Creating 11 Main Parent Categories...");
  const createdCategories: Record<string, string> = {};

  for (const cat of [
  {
    "name": "শাড়ি",
    "slug": "sari",
    "imageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
    "description": "ঐতিহ্যবাহী ঢাকাই জামদানি, মিরপুর কাতান, বেনারসি, রাজশাহী সিল্ক ও কটন শাড়ির এক্সক্লুসিভ কালেকশন।",
    "sortOrder": 1,
    "isFeatured": true
  },
  {
    "name": "থ্রি-পিস",
    "slug": "three-piece",
    "imageUrl": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
    "description": "এমব্রয়ডারি, পিওর কটন, পাকিস্তানি লন, জর্জেট ও গর্জিয়াস পার্টি থ্রি-পিসের সমাহার।",
    "sortOrder": 2,
    "isFeatured": true
  },
  {
    "name": "বাচ্চাদের পোশাক ও খেলনা",
    "slug": "kids",
    "imageUrl": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop",
    "description": "নবজাতক ও শিশুদের নরম আরামদায়ক পোশাক, বেবি ফ্রক, রম্পার এবং শিক্ষণীয় ও বিনোদনমূলক খেলনা।",
    "sortOrder": 3,
    "isFeatured": true
  },
  {
    "name": "ব্যাগ ও পাম্প",
    "slug": "bag-and-pump",
    "imageUrl": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
    "description": "লেডিস প্রিমিয়াম হ্যান্ডব্যাগ, শোল্ডার ব্যাগ, ফ্যাশনেবল ক্লাচ, ওয়ালেট ও আরামদায়ক হিল পাম্প জুতা।",
    "sortOrder": 4,
    "isFeatured": true
  },
  {
    "name": "প্রেম/কাপল আইটেম",
    "slug": "couple-items",
    "imageUrl": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop",
    "description": "কাপল ম্যাচিং ড্রেস, রোমান্টিক সিরামিক মগ সেট, কাপল ব্রেসলেট, ফটো ফ্রেম ও স্পেশাল গিফট আইটেম।",
    "sortOrder": 5,
    "isFeatured": true
  },
  {
    "name": "জুয়েলারি ও এক্সেসরিজ",
    "slug": "jewelry-and-accessories",
    "imageUrl": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
    "description": "কুন্দন নেকলেস সেট, ঐতিহ্যবাহী ঝুমকা, প্রিমিয়াম চুড়ি সেট, ফিঙ্গার রিং ও ফ্যাশন এক্সেসরিজ।",
    "sortOrder": 6,
    "isFeatured": true
  },
  {
    "name": "ঘড়ি ও ব্যাগেল",
    "slug": "watch-and-bagel",
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop",
    "description": "নারী ও পুরুষের লাক্সারি কোয়ার্টজ ঘড়ি, মেটাল চেইন ওয়াচ, স্মার্ট ঘড়ি ও ট্রেন্ডি ফ্যাশন ব্যাগেল।",
    "sortOrder": 7,
    "isFeatured": true
  },
  {
    "name": "ইলেকট্রনিক্স ও গ্যাজেট",
    "slug": "electronics-and-gadgets",
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
    "description": "ওয়্যারলেস ব্লুটুথ ইয়ারবাড, হেডফোন, ফাস্ট চার্জিং পাওয়ার ব্যাংক, স্পিকার ও স্মার্ট এক্সেসরিজ।",
    "sortOrder": 8,
    "isFeatured": true
  },
  {
    "name": "হোম ডেকোর",
    "slug": "home-decor",
    "imageUrl": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop",
    "description": "দেয়াল ঘড়ি, আধুনিক ফুলদানি, টেবিল ল্যাম্প, ক্যালিগ্রাফি ওয়াল আর্ট, কুশন কভার ও আকর্ষণীয় শোপিস।",
    "sortOrder": 9,
    "isFeatured": true
  },
  {
    "name": "অর্গানিক পণ্য",
    "slug": "organic-products",
    "imageUrl": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=600&auto=format&fit=crop",
    "description": "১০০% প্রাকৃতিক সুন্দরবনের মধু, খাঁটি সরিষার তেল, নারিকেল তেল, খেজুরের গুড় ও পুষ্টিকর ড্রাই ফ্রুটস।",
    "sortOrder": 10,
    "isFeatured": true
  },
  {
    "name": "কিচেন আইটেম",
    "slug": "kitchen-items",
    "imageUrl": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop",
    "description": "নন-স্টিক ফ্রাইপ্যান, স্টেইনলেস স্টিল কুকিং পট সেট, শেফ নাইফ, কাটিং বোর্ড ও কিচেন অর্গানাইজার।",
    "sortOrder": 11,
    "isFeatured": true
  }
]) {
    const created = await prisma.category.create({
      data: cat,
    });
    createdCategories[cat.slug] = created.id;
  }

  console.log("11 Parent Categories created successfully.");

  // 8. CREATE 46 SUBCATEGORIES (with parentId)
  console.log("8. Creating 46 Subcategories...");
  const subcategoryList = [
  {
    "name": "জামদানি শাড়ি",
    "slug": "jamdani-sari",
    "parentSlug": "sari",
    "imageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"
  },
  {
    "name": "কাতান ও বেনারসি",
    "slug": "katan-banarasi-sari",
    "parentSlug": "sari",
    "imageUrl": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800"
  },
  {
    "name": "সিল্ক ও মসলিন শাড়ি",
    "slug": "silk-muslin-sari",
    "parentSlug": "sari",
    "imageUrl": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
  },
  {
    "name": "সুতি ও হ্যান্ডলুম",
    "slug": "cotton-handloom-sari",
    "parentSlug": "sari",
    "imageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"
  },
  {
    "name": "পার্টি ও জর্জেট",
    "slug": "party-georgette-sari",
    "parentSlug": "sari",
    "imageUrl": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
  },
  {
    "name": "পিওর কটন থ্রি-পিস",
    "slug": "cotton-three-piece",
    "parentSlug": "three-piece",
    "imageUrl": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
  },
  {
    "name": "এমব্রয়ডারি থ্রি-পিস",
    "slug": "embroidered-three-piece",
    "parentSlug": "three-piece",
    "imageUrl": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
  },
  {
    "name": "পাকিস্তানি ডিজিটাল লন",
    "slug": "pakistani-lawn",
    "parentSlug": "three-piece",
    "imageUrl": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
  },
  {
    "name": "গর্জিয়াস পার্টি ওয়্যার",
    "slug": "party-three-piece",
    "parentSlug": "three-piece",
    "imageUrl": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
  },
  {
    "name": "কুর্তি ও টিউনিক",
    "slug": "kurti-tunic",
    "parentSlug": "three-piece",
    "imageUrl": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
  },
  {
    "name": "বেবি বয় ড্রেস",
    "slug": "baby-boy-clothing",
    "parentSlug": "kids",
    "imageUrl": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
  },
  {
    "name": "বেবি গার্ল ফ্রক ও ড্রেস",
    "slug": "baby-girl-frocks",
    "parentSlug": "kids",
    "imageUrl": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
  },
  {
    "name": "নিউবর্ন বেবি কেয়ার",
    "slug": "newborn-baby-care",
    "parentSlug": "kids",
    "imageUrl": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
  },
  {
    "name": "শিক্ষণীয় ও বিনোদন খেলনা",
    "slug": "educational-toys",
    "parentSlug": "kids",
    "imageUrl": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
  },
  {
    "name": "লেডিস হ্যান্ডব্যাগ",
    "slug": "ladies-handbags",
    "parentSlug": "bag-and-pump",
    "imageUrl": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
  },
  {
    "name": "পার্টি ক্লাচ ও পার্স",
    "slug": "party-clutches",
    "parentSlug": "bag-and-pump",
    "imageUrl": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
  },
  {
    "name": "হিল ও পাম্প শু",
    "slug": "pump-shoes-heels",
    "parentSlug": "bag-and-pump",
    "imageUrl": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800"
  },
  {
    "name": "লেডিস ওয়ালেট ও ব্যাকপ্যাক",
    "slug": "ladies-wallets",
    "parentSlug": "bag-and-pump",
    "imageUrl": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
  },
  {
    "name": "কাপল ম্যাচিং ড্রেস",
    "slug": "couple-matching-dress",
    "parentSlug": "couple-items",
    "imageUrl": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
  },
  {
    "name": "রোমান্টিক মগ ও ফ্রেম",
    "slug": "couple-mugs-frames",
    "parentSlug": "couple-items",
    "imageUrl": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
  },
  {
    "name": "কাপল ওয়াচ ও ব্রেসলেট",
    "slug": "couple-watch-bracelets",
    "parentSlug": "couple-items",
    "imageUrl": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
  },
  {
    "name": "কাপল কম্বো গিফট বক্স",
    "slug": "couple-gift-box",
    "parentSlug": "couple-items",
    "imageUrl": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
  },
  {
    "name": "কুন্দন ও ব্রাইডাল সেট",
    "slug": "kundan-bridal-sets",
    "parentSlug": "jewelry-and-accessories",
    "imageUrl": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
  },
  {
    "name": "ঐতিহ্যবাহী ঝুমকা ও দুল",
    "slug": "traditional-jhumkas",
    "parentSlug": "jewelry-and-accessories",
    "imageUrl": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
  },
  {
    "name": "প্রিমিয়াম চুড়ি ও বালা",
    "slug": "bangles-bracelets",
    "parentSlug": "jewelry-and-accessories",
    "imageUrl": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
  },
  {
    "name": "ফিঙ্গার রিং ও নূপুর",
    "slug": "rings-accessories",
    "parentSlug": "jewelry-and-accessories",
    "imageUrl": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
  },
  {
    "name": "লেডিস লাক্সারি ঘড়ি",
    "slug": "ladies-luxury-watches",
    "parentSlug": "watch-and-bagel",
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
  },
  {
    "name": "জেন্টস মেটাল ও লেদার ঘড়ি",
    "slug": "gents-chronograph-watches",
    "parentSlug": "watch-and-bagel",
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
  },
  {
    "name": "স্মার্ট ওয়াচ ও ফিটনেস ব্যান্ড",
    "slug": "smart-watches-band",
    "parentSlug": "watch-and-bagel",
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
  },
  {
    "name": "ফ্যাশন ব্যাগেল ও চেইন",
    "slug": "fashion-bagel-chain",
    "parentSlug": "watch-and-bagel",
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
  },
  {
    "name": "ওয়্যারলেস ব্লুটুথ ইয়ারবাড",
    "slug": "bluetooth-earbuds",
    "parentSlug": "electronics-and-gadgets",
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
  },
  {
    "name": "স্মার্ট গ্যাজেট ও অ্যাক্সেসরিজ",
    "slug": "smart-gadgets",
    "parentSlug": "electronics-and-gadgets",
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
  },
  {
    "name": "পোর্টেবল ব্লুটুথ স্পিকার",
    "slug": "bluetooth-speakers",
    "parentSlug": "electronics-and-gadgets",
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
  },
  {
    "name": "ফাস্ট চার্জার ও পাওয়ার ব্যাংক",
    "slug": "powerbanks-chargers",
    "parentSlug": "electronics-and-gadgets",
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
  },
  {
    "name": "দেয়াল ঘড়ি ও আর্ট ফ্রেম",
    "slug": "wall-clocks-art",
    "parentSlug": "home-decor",
    "imageUrl": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
  },
  {
    "name": "টেবিল ল্যাম্প ও লাইটিং",
    "slug": "table-lamps-decor",
    "parentSlug": "home-decor",
    "imageUrl": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
  },
  {
    "name": "সিরামিক ও মেটাল ফুলদানি",
    "slug": "flower-vases",
    "parentSlug": "home-decor",
    "imageUrl": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
  },
  {
    "name": "কুশন কভার ও রাগস",
    "slug": "cushions-rugs",
    "parentSlug": "home-decor",
    "imageUrl": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
  },
  {
    "name": "সুন্দরবনের মধু ও ঘি",
    "slug": "pure-honey-ghee",
    "parentSlug": "organic-products",
    "imageUrl": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
  },
  {
    "name": "সরিষা ও নারিকেল তেল",
    "slug": "cold-pressed-mustard-oil",
    "parentSlug": "organic-products",
    "imageUrl": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
  },
  {
    "name": "ড্রাই ফ্রুটস ও বাদাম",
    "slug": "dry-fruits-nuts",
    "parentSlug": "organic-products",
    "imageUrl": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
  },
  {
    "name": "অর্গানিক চা ও মসলা",
    "slug": "organic-tea-spices",
    "parentSlug": "organic-products",
    "imageUrl": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
  },
  {
    "name": "নন-স্টিক কুকওয়্যার সেট",
    "slug": "nonstick-cookware",
    "parentSlug": "kitchen-items",
    "imageUrl": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
  },
  {
    "name": "শেফ নাইফ ও কাটিং বোর্ড",
    "slug": "chef-knives-boards",
    "parentSlug": "kitchen-items",
    "imageUrl": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
  },
  {
    "name": "স্পাইস ও কিচেন অর্গানাইজার",
    "slug": "kitchen-organizers",
    "parentSlug": "kitchen-items",
    "imageUrl": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
  },
  {
    "name": "ইলেকট্রিক চপার ও ব্লেন্ডার",
    "slug": "choppers-blenders",
    "parentSlug": "kitchen-items",
    "imageUrl": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
  }
];

  for (const sub of subcategoryList) {
    const parentId = createdCategories[sub.parentSlug];
    if (parentId) {
      const createdSub = await prisma.category.create({
        data: {
          name: sub.name,
          slug: sub.slug,
          imageUrl: sub.imageUrl,
          parentId,
          sortOrder: 1,
          isActive: true,
        },
      });
      createdCategories[sub.slug] = createdSub.id;
    }
  }

  console.log("46 Subcategories created successfully.");

  // 9. SEED AT LEAST 5 PRODUCTS FOR EVERY SUBCATEGORY (230+ products total)
  console.log("9. Seeding minimum 5 products for EVERY subcategory (Total: 230+ products)...");

  const subcategoriesDataset = [
  {
    "parentSlug": "sari",
    "subSlug": "jamdani-sari",
    "subName": "জামদানি শাড়ি",
    "products": [
      {
        "name": "ঢাকাই অরিজিনাল জামদানি শাড়ি",
        "price": 4200,
        "discount": 3650,
        "images": [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"
        ]
      },
      {
        "name": "হাতে বোনা সুতি জামদানি শাড়ি",
        "price": 3400,
        "discount": 2950,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      },
      {
        "name": "গর্জিয়াস গোল্ডেন জরি জামদানি",
        "price": 5600,
        "discount": 4850,
        "images": [
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800"
        ]
      },
      {
        "name": "হালকা গোলাপি সফট জামদানি শাড়ি",
        "price": 3800,
        "discount": 3200,
        "images": [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"
        ]
      },
      {
        "name": "বিয়ে ও উৎসব স্পেশাল জামদানি",
        "price": 6200,
        "discount": 5400,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "sari",
    "subSlug": "katan-banarasi-sari",
    "subName": "কাতান ও বেনারসি",
    "products": [
      {
        "name": "মিরপুর কাতান সিল্ক শাড়ি",
        "price": 4800,
        "discount": 4150,
        "images": [
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800"
        ]
      },
      {
        "name": "ব্রাইডাল রেড বেনারসি কাতান",
        "price": 8500,
        "discount": 7400,
        "images": [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"
        ]
      },
      {
        "name": "রয়েল ব্লু অপেরা কাতান শাড়ি",
        "price": 5200,
        "discount": 4600,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      },
      {
        "name": "গোল্ডেন জরি বর্ডার বেনারসি",
        "price": 6900,
        "discount": 5950,
        "images": [
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800"
        ]
      },
      {
        "name": "ঐতিহ্যবাহী বেনারসি কাতান শাড়ি",
        "price": 7200,
        "discount": 6300,
        "images": [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "sari",
    "subSlug": "silk-muslin-sari",
    "subName": "সিল্ক ও মসলিন শাড়ি",
    "products": [
      {
        "name": "রাজশাহী পিওর সিল্ক শাড়ি",
        "price": 4500,
        "discount": 3900,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      },
      {
        "name": "হ্যান্ডপেইন্টেড ঢাকাই মসলিন শাড়ি",
        "price": 7800,
        "discount": 6800,
        "images": [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"
        ]
      },
      {
        "name": "টসর সিল্ক এম্ব্রয়ডারি শাড়ি",
        "price": 5100,
        "discount": 4450,
        "images": [
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800"
        ]
      },
      {
        "name": "ফ্লোরাল প্রিন্ট মসলিন সিল্ক",
        "price": 4200,
        "discount": 3600,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      },
      {
        "name": "প্রিমিয়াম কাতান মসলিন শাড়ি",
        "price": 6500,
        "discount": 5700,
        "images": [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "sari",
    "subSlug": "cotton-handloom-sari",
    "subName": "সুতি ও হ্যান্ডলুম",
    "products": [
      {
        "name": "টাঙ্গাইল তাঁতের সুতি শাড়ি",
        "price": 1850,
        "discount": 1550,
        "images": [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"
        ]
      },
      {
        "name": "কুমিল্লা খাদি কটন শাড়ি",
        "price": 2100,
        "discount": 1750,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      },
      {
        "name": "ব্লক প্রিন্ট সফট কটন শাড়ি",
        "price": 1650,
        "discount": 1390,
        "images": [
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800"
        ]
      },
      {
        "name": "হাতে বোনা মনিপুরী কটন শাড়ি",
        "price": 2400,
        "discount": 1990,
        "images": [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"
        ]
      },
      {
        "name": "প্রাকৃতিক ডাই হ্যান্ডলুম শাড়ি",
        "price": 2250,
        "discount": 1850,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "sari",
    "subSlug": "party-georgette-sari",
    "subName": "পার্টি ও জর্জেট",
    "products": [
      {
        "name": "সিকোয়েন্স ওয়ার্ক জর্জেট শাড়ি",
        "price": 3200,
        "discount": 2750,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      },
      {
        "name": "শিফন জর্জেট এম্ব্রয়ডারি শাড়ি",
        "price": 2950,
        "discount": 2450,
        "images": [
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800"
        ]
      },
      {
        "name": "ওয়েডিং স্পেশাল গর্জিয়াস জর্জেট",
        "price": 4600,
        "discount": 3990,
        "images": [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"
        ]
      },
      {
        "name": "ওমব্রে শেড ডিজাইনার জর্জেট",
        "price": 3500,
        "discount": 2990,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      },
      {
        "name": "লেস বর্ডার পার্টি ওয়্যার জর্জেট",
        "price": 3100,
        "discount": 2600,
        "images": [
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "three-piece",
    "subSlug": "cotton-three-piece",
    "subName": "পিওর কটন থ্রি-পিস",
    "products": [
      {
        "name": "প্রিমিয়াম পিওর কটন থ্রি-পিস",
        "price": 2450,
        "discount": 2050,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "জয়পুরি কটন ব্লক প্রিন্ট থ্রি-পিস",
        "price": 2200,
        "discount": 1850,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "বাটিক প্রিন্ট সুতি থ্রি-পিস",
        "price": 1750,
        "discount": 1450,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      },
      {
        "name": "মালহার সফট কটন থ্রি-পিস",
        "price": 2600,
        "discount": 2190,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "প্রিন্টেড কটন উইথ শিফন ওড়না",
        "price": 1950,
        "discount": 1650,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "three-piece",
    "subSlug": "embroidered-three-piece",
    "subName": "এমব্রয়ডারি থ্রি-পিস",
    "products": [
      {
        "name": "লাক্সারি নেক এমব্রয়ডারি থ্রি-পিস",
        "price": 3200,
        "discount": 2690,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      },
      {
        "name": "কাশ্মীরি সুতা এমব্রয়ডারি থ্রি-পিস",
        "price": 3800,
        "discount": 3250,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "চিকেনকারি এমব্রয়ডারি কটন ড্রেস",
        "price": 2900,
        "discount": 2450,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "জারদৌসি ওয়ার্ক পার্টি থ্রি-পিস",
        "price": 4200,
        "discount": 3600,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      },
      {
        "name": "হ্যান্ড এমব্রয়ডারি ফ্যাশন থ্রি-পিস",
        "price": 3500,
        "discount": 2990,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "three-piece",
    "subSlug": "pakistani-lawn",
    "subName": "পাকিস্তানি ডিজিটাল লন",
    "products": [
      {
        "name": "পাকিস্তানি মারিয়া বি ডিজিটাল লন",
        "price": 3600,
        "discount": 3100,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "সানাসাফিনাজ প্রিন্ট ডিজিটাল লন",
        "price": 3400,
        "discount": 2890,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "গুল আহমেদ লাক্সারি লন কালেকশন",
        "price": 3900,
        "discount": 3350,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      },
      {
        "name": "আঘানুর এমব্রয়ডারি লন থ্রি-পিস",
        "price": 4400,
        "discount": 3790,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "অরিজিনাল পাকিস্তানি ডিজিটাল লন",
        "price": 3100,
        "discount": 2650,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "three-piece",
    "subSlug": "party-three-piece",
    "subName": "গর্জিয়াস পার্টি ওয়্যার",
    "products": [
      {
        "name": "ওয়েডিং পার্টি সিল্ক থ্রি-পিস",
        "price": 4800,
        "discount": 4100,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "অর্গানজা টিস্যু পার্টি থ্রি-পিস",
        "price": 4200,
        "discount": 3590,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "জর্জেট সিকোয়েন্স পার্টি ড্রেস",
        "price": 3800,
        "discount": 3200,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      },
      {
        "name": "ভেলভেট এম্ব্রয়ডারি উইন্টার স্পেশাল",
        "price": 5400,
        "discount": 4600,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "রয়েল ব্লু পার্টি সিল্ক ড্রেস",
        "price": 4600,
        "discount": 3950,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "three-piece",
    "subSlug": "kurti-tunic",
    "subName": "কুর্তি ও টিউনিক",
    "products": [
      {
        "name": "রেডিমেড কটন ডিজাইনার কুর্তি",
        "price": 1450,
        "discount": 1190,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "লং এম্ব্রয়ডারি পার্টি গাউন",
        "price": 2800,
        "discount": 2350,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "ফ্লোরাল প্রিন্ট সামার কুর্তি",
        "price": 1250,
        "discount": 990,
        "images": [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
        ]
      },
      {
        "name": "অ্যাংগরাখা স্টাইল রেডিমেড কুর্তি",
        "price": 1850,
        "discount": 1550,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "টপস ও টিউনিক টু-পিস সেট",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "kids",
    "subSlug": "baby-boy-clothing",
    "subName": "বেবি বয় ড্রেস",
    "products": [
      {
        "name": "বেবি বয় ৩-পিস স্যুট ও প্যান্ট",
        "price": 1850,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "কিডস কটন পাঞ্জাবি ও পায়জামা",
        "price": 1250,
        "discount": 990,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "ছেলে শিশুদের ডেনিম জিন্স ও শার্ট",
        "price": 1500,
        "discount": 1250,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "কার্টুন প্রিন্ট কটন টি-শার্ট কম্বো",
        "price": 950,
        "discount": 750,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "উইন্টার হুডি ও ট্রাউজার সেট",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "kids",
    "subSlug": "baby-girl-frocks",
    "subName": "বেবি গার্ল ফ্রক ও ড্রেস",
    "products": [
      {
        "name": "প্রিন্সেস পার্টি ফ্রক উইথ বো",
        "price": 1950,
        "discount": 1590,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "কিডস এম্ব্রয়ডারি লেহেঙ্গা সেট",
        "price": 2600,
        "discount": 2190,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "ফ্লোরাল কটন সামার ফ্রক",
        "price": 850,
        "discount": 690,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "বেবি গার্ল টু-পিস টপস ও স্কার্ট",
        "price": 1350,
        "discount": 1090,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "বার্থডে স্পেশাল টিস্যু ফ্রক",
        "price": 2200,
        "discount": 1850,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "kids",
    "subSlug": "newborn-baby-care",
    "subName": "নিউবর্ন বেবি কেয়ার",
    "products": [
      {
        "name": "নিউবর্ন বেবি সফট কটন রম্পার সেট",
        "price": 1200,
        "discount": 950,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "বেবি স্লিপিং ব্যাগ ও ক্যারিয়ার",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "নরম বেবি কমফোর্টার ব্ল্যাঙ্কেট",
        "price": 1400,
        "discount": 1150,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "বেবি কেয়ার গ্রুমিং ও বাথ কিট",
        "price": 990,
        "discount": 790,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "নিউবর্ন গিফট বক্স ৮-ইন-১ সেট",
        "price": 2450,
        "discount": 1990,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "kids",
    "subSlug": "educational-toys",
    "subName": "শিক্ষণীয় ও বিনোদন খেলনা",
    "products": [
      {
        "name": "ম্যাগনেটিক বিল্ডিং ব্লক টয়",
        "price": 1450,
        "discount": 1150,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "বাচ্চাদের ডিজিটাল রাইটিং ড্রয়িং প্যাড",
        "price": 650,
        "discount": 490,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "উডেন বর্ণমালা ও গণিত পাজল বোর্ড",
        "price": 850,
        "discount": 690,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "রিমোট কন্ট্রোল ৪×৪ স্টান্ট কার",
        "price": 1850,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      },
      {
        "name": "টকিং ক্যাকটাস ড্যান্সিং টয়",
        "price": 790,
        "discount": 590,
        "images": [
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "bag-and-pump",
    "subSlug": "ladies-handbags",
    "subName": "লেডিস হ্যান্ডব্যাগ",
    "products": [
      {
        "name": "লাক্সারি লেদার হ্যান্ডব্যাগ",
        "price": 2850,
        "discount": 2350,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "টোট ব্যাগ উইথ মেটাল স্ট্র্যাপ",
        "price": 1950,
        "discount": 1590,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "ক্লাসিক শোল্ডার স্লিং ব্যাগ",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "কোরিয়ান মিনি ক্রস বডি ব্যাগ",
        "price": 1450,
        "discount": 1190,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "অফিসিয়াল প্রিমিয়াম লেডিস ব্যাগ",
        "price": 3200,
        "discount": 2690,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "bag-and-pump",
    "subSlug": "party-clutches",
    "subName": "পার্টি ক্লাচ ও পার্স",
    "products": [
      {
        "name": "ক্রিস্টাল এমব্রয়ডারি পার্টি ক্লাচ",
        "price": 1850,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "গোল্ডেন মেটালিক ইভিনিং ক্লাচ",
        "price": 1600,
        "discount": 1290,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "ভেলভেট হ্যান্ডক্রাফটেড পার্টি পার্স",
        "price": 2100,
        "discount": 1750,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "পার্ল ওয়ার্ক ব্রাইডাল হ্যান্ড পার্স",
        "price": 2400,
        "discount": 1990,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "সিলভার গ্লিটার পার্টি ক্লাচ",
        "price": 1750,
        "discount": 1390,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "bag-and-pump",
    "subSlug": "pump-shoes-heels",
    "subName": "হিল ও পাম্প শু",
    "products": [
      {
        "name": "ক্লাসিক পয়েন্টেড টো হিল পাম্প",
        "price": 2450,
        "discount": 1990,
        "images": [
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800"
        ]
      },
      {
        "name": "ব্লক হিল পার্টি পাম্প জুতা",
        "price": 2100,
        "discount": 1750,
        "images": [
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800"
        ]
      },
      {
        "name": "কমফোর্ট ফ্ল্যাট পাম্প শু",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800"
        ]
      },
      {
        "name": "ওয়েডিং ব্রাইডাল গ্লিটার হিল",
        "price": 2900,
        "discount": 2450,
        "images": [
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800"
        ]
      },
      {
        "name": "লেদার লোফার পাম্প শু",
        "price": 1850,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "bag-and-pump",
    "subSlug": "ladies-wallets",
    "subName": "লেডিস ওয়ালেট ও ব্যাকপ্যাক",
    "products": [
      {
        "name": "ট্রিপল জিপার লেদার ওয়ালেট",
        "price": 950,
        "discount": 750,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "লেডিস ফ্যাশন ব্যাকপ্যাক",
        "price": 1850,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "কার্ড হোল্ডার মিনি পার্স ওয়ালেট",
        "price": 550,
        "discount": 420,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "ক্যাজুয়াল কলেজ ব্যাকপ্যাক",
        "price": 1650,
        "discount": 1290,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      },
      {
        "name": "স্মার্টফোন পকেট লং ওয়ালেট",
        "price": 1100,
        "discount": 890,
        "images": [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "couple-items",
    "subSlug": "couple-matching-dress",
    "subName": "কাপল ম্যাচিং ড্রেস",
    "products": [
      {
        "name": "কাপল ম্যাচিং শাড়ি ও পাঞ্জাবি কম্বো",
        "price": 4200,
        "discount": 3600,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "কটন ম্যাচিং কাপল টি-শার্ট সেট",
        "price": 1250,
        "discount": 990,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "উৎসব স্পেশাল কাপল পাঞ্জাবি ও কুর্তি",
        "price": 3400,
        "discount": 2890,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "উইন্টার কাপল হুডি কম্বো",
        "price": 2100,
        "discount": 1750,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "রয়েল ব্লু কাপল কালেকশন",
        "price": 3800,
        "discount": 3250,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "couple-items",
    "subSlug": "couple-mugs-frames",
    "subName": "রোমান্টিক মগ ও ফ্রেম",
    "products": [
      {
        "name": "কাস্টমাইজড লাভ সিরামিক মগ সেট",
        "price": 850,
        "discount": 650,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "রোমান্টিক ফটো ফ্রেম উইথ এলইডি লাইট",
        "price": 1100,
        "discount": 850,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "ম্যাজিক কাপল মগ পেয়ার",
        "price": 750,
        "discount": 590,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "লাভ মেমোরি কাঠের ওয়াল ফ্রেম",
        "price": 1450,
        "discount": 1150,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "কাপল থিমড কোট কিচেন মগ",
        "price": 690,
        "discount": 520,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "couple-items",
    "subSlug": "couple-watch-bracelets",
    "subName": "কাপল ওয়াচ ও ব্রেসলেট",
    "products": [
      {
        "name": "লাক্সারি কাপল ওয়াচ সেট (হিজ অ্যান্ড হার্স)",
        "price": 2450,
        "discount": 1990,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "ম্যাগনেটিক হার্ট কাপল ব্রেসলেট পেয়ার",
        "price": 650,
        "discount": 490,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "সিলভার চেইন কাপল ফিঙ্গার রিং সেট",
        "price": 850,
        "discount": 650,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "স্টেইনলেস স্টিল কাপল ওয়াচ পেয়ার",
        "price": 2900,
        "discount": 2350,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "কাস্টম নেইম এনগ্রেভড কাপল ব্রেসলেট",
        "price": 950,
        "discount": 750,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "couple-items",
    "subSlug": "couple-gift-box",
    "subName": "কাপল কম্বো গিফট বক্স",
    "products": [
      {
        "name": "রোমান্টিক ভ্যালেন্টাইন গিফট কম্বো বক্স",
        "price": 2200,
        "discount": 1790,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "চকলেট ও পারফিউম স্পেশাল গিফট বক্স",
        "price": 1850,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "অ্যানিভার্সারি সারপ্রাইজ গিফট হ্যাম্পার",
        "price": 2900,
        "discount": 2400,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "টেডি বেয়ার ও ফ্লাওয়ার কম্বো বক্স",
        "price": 1450,
        "discount": 1190,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      },
      {
        "name": "লাক্সারি উডেন মেমোরি গিফট বক্স",
        "price": 2600,
        "discount": 2150,
        "images": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "jewelry-and-accessories",
    "subSlug": "kundan-bridal-sets",
    "subName": "কুন্দন ও ব্রাইডাল সেট",
    "products": [
      {
        "name": "গোল্ড প্লেটেড কুন্দন ব্রাইডাল নেকলেস সেট",
        "price": 3450,
        "discount": 2890,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "রুবি এমারেল্ড কুন্দন চকার সেট",
        "price": 2900,
        "discount": 2450,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "পার্ল ড্রপ ব্রাইডাল গোল্ডেন হার সেট",
        "price": 4200,
        "discount": 3600,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "রানি হার উইথ ম্যাচিং টিকলি ও দুল",
        "price": 3800,
        "discount": 3190,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "ঐতিহ্যবাহী মিয়াকি কুন্দন সেট",
        "price": 3100,
        "discount": 2590,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "jewelry-and-accessories",
    "subSlug": "traditional-jhumkas",
    "subName": "ঐতিহ্যবাহী ঝুমকা ও দুল",
    "products": [
      {
        "name": "গোল্ডেন ময়ূর ডিজাইন কাশ্মীরি ঝুমকা",
        "price": 1100,
        "discount": 850,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "পার্ল স্টাডেড ট্রেডিশনাল ঝুমকা",
        "price": 950,
        "discount": 750,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "অক্সিডাইজ সিলভার পার্টি কানের দুল",
        "price": 650,
        "discount": 490,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "চাঁদবালি ব্রাইডাল দুল উইথ কানপাশা",
        "price": 1350,
        "discount": 1050,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "কালারফুল স্টোন ড্রপ ঝুমকা",
        "price": 850,
        "discount": 650,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "jewelry-and-accessories",
    "subSlug": "bangles-bracelets",
    "subName": "প্রিমিয়াম চুড়ি ও বালা",
    "products": [
      {
        "name": "গোল্ড প্লেটেড ব্রাইডাল চুড়ি ৪-পিস সেট",
        "price": 1850,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "ভেলভেট মেটাল চুড়ি ডজন সেট",
        "price": 550,
        "discount": 420,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "কুন্দন কারুকাজ করা শাখা বাঁধানো বালা",
        "price": 2100,
        "discount": 1750,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "এডজাস্টেবল স্টার্লিং সিলভার ব্রেসলেট",
        "price": 1250,
        "discount": 990,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "ট্রেডিশনাল পলার বালা গোল্ডেন ক্যাপ",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "jewelry-and-accessories",
    "subSlug": "rings-accessories",
    "subName": "ফিঙ্গার রিং ও নূপুর",
    "products": [
      {
        "name": "এডজাস্টেবল কুন্দন ফিঙ্গার রিং",
        "price": 650,
        "discount": 490,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "ট্রেডিশনাল ঘুংঘুর গোল্ডেন নূপুর পেয়ার",
        "price": 1100,
        "discount": 850,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "হ্যান্ডমেড ফ্লোরাল নথ ও টিকলি",
        "price": 750,
        "discount": 590,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "সিলভার পায়েল উইথ বেলস",
        "price": 950,
        "discount": 750,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      },
      {
        "name": "রোজ গোল্ড জিরকন স্টোন রিং",
        "price": 850,
        "discount": 650,
        "images": [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "watch-and-bagel",
    "subSlug": "ladies-luxury-watches",
    "subName": "লেডিস লাক্সারি ঘড়ি",
    "products": [
      {
        "name": "রোজ গোল্ড ডায়মন্ড কাট লেডিস ঘড়ি",
        "price": 2150,
        "discount": 1750,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "চেইন স্ট্র্যাপ ম্যাগনেটিক লেডিস ওয়াচ",
        "price": 1450,
        "discount": 1190,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "মার্বেল ডায়াল ক্লাসিক লেডিস ওয়াচ",
        "price": 1850,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "সিলভার ডায়াল কোয়ার্টজ লেডিস ঘড়ি",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "লেদার বেল্ট এলিগ্যান্ট লেডিস ঘড়ি",
        "price": 1250,
        "discount": 990,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "watch-and-bagel",
    "subSlug": "gents-chronograph-watches",
    "subName": "জেন্টস মেটাল ও লেদার ঘড়ি",
    "products": [
      {
        "name": "জেন্টস ওয়াটারপ্রুফ ক্রোনোগ্রাফ ঘড়ি",
        "price": 2850,
        "discount": 2350,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "জেন্টস প্রিমিয়াম লেদার বেল্ট ওয়াচ",
        "price": 1950,
        "discount": 1590,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "ব্ল্যাক মেটাল লাক্সারি মেনস ওয়াচ",
        "price": 2600,
        "discount": 2150,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "স্পোর্টস সিলিকন স্ট্র্যাপ ঘড়ি",
        "price": 1350,
        "discount": 1090,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "অটোমেটিক মেকানিক্যাল জেন্টস ওয়াচ",
        "price": 3900,
        "discount": 3250,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "watch-and-bagel",
    "subSlug": "smart-watches-band",
    "subName": "স্মার্ট ওয়াচ ও ফিটনেস ব্যান্ড",
    "products": [
      {
        "name": "এমোলেড ডিসপ্লে ব্লুটুথ কলিং স্মার্টওয়াচ",
        "price": 3450,
        "discount": 2890,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "হার্ট রেট ও স্লিপ মনিটরিং ফিটনেস ব্যান্ড",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "ওয়াটারপ্রুফ স্পোর্টস স্মার্টওয়াচ",
        "price": 2600,
        "discount": 2190,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "লেডিস গোল্ডেন স্মার্ট ফিটনেস ওয়াচ",
        "price": 2950,
        "discount": 2450,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "অ্যাল্ট্রা ৮ ম্যাক্স এইচডি স্মার্টওয়াচ",
        "price": 2100,
        "discount": 1750,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "watch-and-bagel",
    "subSlug": "fashion-bagel-chain",
    "subName": "ফ্যাশন ব্যাগেল ও চেইন",
    "products": [
      {
        "name": "স্টেইনলেস স্টিল মেনস কিউবান চেইন",
        "price": 850,
        "discount": 650,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "লেদার র‍্যাপ ফ্যাশন ব্রেসলেট ব্যাগেল",
        "price": 650,
        "discount": 490,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "গোল্ডেন মেটাল ফ্যাশন ব্যাগেল",
        "price": 950,
        "discount": 750,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "টাইটানিয়াম স্টিল ক্রস লকেট চেইন",
        "price": 790,
        "discount": 590,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      },
      {
        "name": "সিলভার সিলিন্ডার ম্যাগনেটিক ব্যাগেল",
        "price": 890,
        "discount": 690,
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "electronics-and-gadgets",
    "subSlug": "bluetooth-earbuds",
    "subName": "ওয়্যারলেস ব্লুটুথ ইয়ারবাড",
    "products": [
      {
        "name": "ট্রু ওয়্যারলেস ব্লুটুথ ৫.৩ ইয়ারবাড",
        "price": 1850,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "অ্যাক্টিভ নয়েজ ক্যানসেলিং ইয়ারবাড",
        "price": 2950,
        "discount": 2450,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "গেমিং লো লেটেন্সি আরজিবি ইয়ারবাড",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "হেভি বেস ওয়ারলেস ব্লুটুথ নেকব্যান্ড",
        "price": 1250,
        "discount": 990,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "প্রো ওভার-ইয়ার স্টুডিও হেডফোন",
        "price": 2600,
        "discount": 2190,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "electronics-and-gadgets",
    "subSlug": "smart-gadgets",
    "subName": "স্মার্ট গ্যাজেট ও অ্যাক্সেসরিজ",
    "products": [
      {
        "name": "স্মার্ট অটোমেটিক ওয়াটার ডিসপেনসার",
        "price": 950,
        "discount": 750,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "রিচার্জেবল মিনি পোর্টেবল ফ্যান",
        "price": 790,
        "discount": 590,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "স্মার্ট সেন্সর নাইট লাইট ল্যাম্প",
        "price": 650,
        "discount": 490,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "ব্লুটুথ সেলফি স্টিক ট্রাইপড উইথ লাইট",
        "price": 1100,
        "discount": 850,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "কার ড্যাশবোর্ড ম্যাগনেটিক মোবাইল হোল্ডার",
        "price": 550,
        "discount": 390,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "electronics-and-gadgets",
    "subSlug": "bluetooth-speakers",
    "subName": "পোর্টেবল ব্লুটুথ স্পিকার",
    "products": [
      {
        "name": "পোর্টেবল ওয়াটারপ্রুফ ব্লুটুথ স্পিকার",
        "price": 2150,
        "discount": 1750,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "আরজিবি লাইটিং পার্টি স্পিকার উইথ মাইক",
        "price": 3450,
        "discount": 2890,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "মিনি পকেট ব্লুটুথ স্পিকার",
        "price": 950,
        "discount": 750,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "টিভি হোম থিয়েটার সাউন্ডবার স্পিকার",
        "price": 4600,
        "discount": 3950,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "উডেন ভিনটেজ ব্লুটুথ স্পিকার",
        "price": 2400,
        "discount": 1990,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "electronics-and-gadgets",
    "subSlug": "powerbanks-chargers",
    "subName": "ফাস্ট চার্জার ও পাওয়ার ব্যাংক",
    "products": [
      {
        "name": "২০,০০০ এমএএইচ ২২.৫ ওয়াট ফাস্ট পাওয়ার ব্যাংক",
        "price": 2250,
        "discount": 1850,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "৬৫ ওয়াট গান ফাস্ট টাইপ-সি চার্জার",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "১০,০০০ এমএএইচ ম্যাগনেটিক ওয়্যারলেস পাওয়ার ব্যাংক",
        "price": 1950,
        "discount": 1590,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "১০০ ওয়াট ব্রেইডেড টাইপ-সি ফাস্ট কেবল",
        "price": 450,
        "discount": 320,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      },
      {
        "name": "মাল্টি-প্লাগ এক্সটেনশন উইথ ইউএসবি পোর্ট",
        "price": 1250,
        "discount": 990,
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "home-decor",
    "subSlug": "wall-clocks-art",
    "subName": "দেয়াল ঘড়ি ও আর্ট ফ্রেম",
    "products": [
      {
        "name": "আধুনিক ৩ডি মেটাল দেয়াল ঘড়ি",
        "price": 2600,
        "discount": 2150,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "ইসলামিক ক্যালিগ্রাফি গোল্ডেন ওয়াল আর্ট",
        "price": 1850,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "ভিনটেজ উডেন সাইলেন্ট দেয়াল ঘড়ি",
        "price": 1450,
        "discount": 1190,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "ক্যানভাস ৩-পিস পেইন্টিং ফ্রেম সেট",
        "price": 2200,
        "discount": 1790,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "মডার্ন অ্যাক্রিলিক মিরর ওয়াল ক্লক",
        "price": 1100,
        "discount": 850,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "home-decor",
    "subSlug": "table-lamps-decor",
    "subName": "টেবিল ল্যাম্প ও লাইটিং",
    "products": [
      {
        "name": "ক্রিস্টাল টাচ কন্ট্রোল টেবিল ল্যাম্প",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "হিমালয়ান পিংক রক সল্ট ল্যাম্প",
        "price": 1450,
        "discount": 1190,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "উডেন বেইজ রিডিং বেডসাইড ল্যাম্প",
        "price": 1850,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "আরজিবি কালার চেঞ্জিং কর্নার ফ্লোর ল্যাম্প",
        "price": 3200,
        "discount": 2690,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "সফট ওয়ার্ম ফেয়ারি স্ট্রিং লাইটস",
        "price": 450,
        "discount": 320,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "home-decor",
    "subSlug": "flower-vases",
    "subName": "সিরামিক ও মেটাল ফুলদানি",
    "products": [
      {
        "name": "নর্ডিক সিরামিক ফ্লাওয়ার ভাস সেট",
        "price": 1450,
        "discount": 1190,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "গোল্ডেন মেটাল জিওমেট্রিক ফুলদানি",
        "price": 1250,
        "discount": 990,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "হ্যান্ডক্রাফটেড টেরাকোটা ফুলদানি",
        "price": 950,
        "discount": 750,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "প্রিমিয়াম আর্টিফিশিয়াল টিউলিপ ফুল সেট",
        "price": 850,
        "discount": 650,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "মডার্ন বোহো ফ্লাওয়ার পট ভাস",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "home-decor",
    "subSlug": "cushions-rugs",
    "subName": "কুশন কভার ও রাগস",
    "products": [
      {
        "name": "ভেলভেট এম্ব্রয়ডারি কুশন কভার ৫-পিস",
        "price": 1350,
        "discount": 1090,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "সফট ফার লিভিং রুম ফ্লোর রাগস কার্পেট",
        "price": 2850,
        "discount": 2350,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "জ্যাকোয়ার্ড কটন সোফা কুশন কভার সেট",
        "price": 1100,
        "discount": 850,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "অ্যান্টি-স্লিপ ডোরম্যাট কম্বো ৩-পিস",
        "price": 650,
        "discount": 490,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      },
      {
        "name": "বোহিমিয়ান হ্যান্ড-ওভেন ফ্লোর রানার",
        "price": 1950,
        "discount": 1590,
        "images": [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "organic-products",
    "subSlug": "pure-honey-ghee",
    "subName": "সুন্দরবনের মধু ও ঘি",
    "products": [
      {
        "name": "১০০% প্রাকৃতিক সুন্দরবনের খলিশা ফুলের মধু ১কেজি",
        "price": 1450,
        "discount": 1250,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "গাভীর খাঁটি গাওয়া ঘি ৫০০ গ্রাম",
        "price": 1100,
        "discount": 950,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "কালোজিরা ফুলের প্রাকৃতিক মধু ৫০০ গ্রাম",
        "price": 750,
        "discount": 650,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "প্রিমিয়াম মাখন তোলা দেশি ঘি ১কেজি",
        "price": 2150,
        "discount": 1850,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "অর্গানিক কম্বো: মধু + ঘি ৫০০ গ্রাম সেট",
        "price": 1750,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "organic-products",
    "subSlug": "cold-pressed-mustard-oil",
    "subName": "সরিষা ও নারিকেল তেল",
    "products": [
      {
        "name": "কাঠের ঘানির খাঁটি সরিষার তেল ১ লিটার",
        "price": 380,
        "discount": 340,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "কোল্ড প্রেসড এক্সট্রা ভার্জিন নারিকেল তেল ৫০০ মি.লি",
        "price": 550,
        "discount": 480,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "ঘানির সরিষার তেল ৫ লিটার জার",
        "price": 1850,
        "discount": 1650,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "কালোজিরা তেল ১০০ মি.লি বোতল",
        "price": 350,
        "discount": 290,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "তিলের তেল ২৫০ মি.লি",
        "price": 420,
        "discount": 360,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "organic-products",
    "subSlug": "dry-fruits-nuts",
    "subName": "ড্রাই ফ্রুটস ও বাদাম",
    "products": [
      {
        "name": "প্রিমিয়াম প্রি-মিক্স নাটস ও ড্রাই ফ্রুটস ৫০০ গ্রাম",
        "price": 950,
        "discount": 820,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "আমেরিকান রোস্টেড কাজুবাদাম ৫০০ গ্রাম",
        "price": 850,
        "discount": 750,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "ইরানি মরিয়ম খেজুর ১কেজি বক্স",
        "price": 1250,
        "discount": 1050,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "আফগান গোল্ডেন কিশমিশ ৫০০ গ্রাম",
        "price": 480,
        "discount": 390,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "ক্যালিফোর্নিয়া কাঠবাদাম ৫০০ গ্রাম",
        "price": 650,
        "discount": 550,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "organic-products",
    "subSlug": "organic-tea-spices",
    "subName": "অর্গানিক চা ও মসলা",
    "products": [
      {
        "name": "শ্রীমঙ্গল স্পেশাল প্রিমিয়াম ব্ল্যাক টি ৫০০ গ্রাম",
        "price": 420,
        "discount": 360,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "অর্গানিক গ্রিন টি উইথ লেমনগ্রাস",
        "price": 380,
        "discount": 320,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "খাঁটি গুঁড়া হলুদ ও মরিচ কম্বো প্যাক",
        "price": 550,
        "discount": 460,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "প্রাকৃতিক চিয়া সিড ২৫০ গ্রাম",
        "price": 390,
        "discount": 320,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      },
      {
        "name": "স্পেশাল শাহী গরম মসলা মিক্স ২০০ গ্রাম",
        "price": 450,
        "discount": 380,
        "images": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "kitchen-items",
    "subSlug": "nonstick-cookware",
    "subName": "নন-স্টিক কুকওয়্যার সেট",
    "products": [
      {
        "name": "৭-পিস গ্রানাইট নন-স্টিক কুকওয়্যার সেট",
        "price": 4850,
        "discount": 4190,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "২৮ সে.মি নন-স্টিক ফ্রাইপ্যান উইথ গ্লাস লিড",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "ইন্ডাকশন বটম দোসা তাওয়া",
        "price": 1250,
        "discount": 990,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "স্টেইনলেস স্টিল প্রেশার কুকার ৫ লিটার",
        "price": 2950,
        "discount": 2450,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "নন-স্টিক মিল্ক প্যান উইth স্পাউট",
        "price": 850,
        "discount": 690,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "kitchen-items",
    "subSlug": "chef-knives-boards",
    "subName": "শেফ নাইফ ও কাটিং বোর্ড",
    "products": [
      {
        "name": "৬-পিস প্রফেশনাল স্টেইনলেস স্টিল নাইফ সেট",
        "price": 1850,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "প্রাকৃতিক ব্যাম্বু উডেন কাটিং বোর্ড",
        "price": 950,
        "discount": 750,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "মাল্টি-ফাংশন কিচেন সিজর ও ব্লেড",
        "price": 450,
        "discount": 320,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "জাপানিজ দামেস্ক শেফ নাইফ ৮ ইঞ্চি",
        "price": 2200,
        "discount": 1790,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "অ্যান্টি-ব্যাকটেরিয়াল সিলিকন কাটিং ম্যাট",
        "price": 550,
        "discount": 390,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "kitchen-items",
    "subSlug": "kitchen-organizers",
    "subName": "স্পাইস ও কিচেন অর্গানাইজার",
    "products": [
      {
        "name": "৩৬০ ডিগ্রি রোটেটিং স্পাইস রেক ১২ জার",
        "price": 1650,
        "discount": 1350,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "স্টেইনলেস স্টিল সিংক ডিশ ড্রাইং রেক",
        "price": 2450,
        "discount": 1990,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "এয়ারটাইট ফুড স্টোরেজ কন্টেইনার ৬-পিস সেট",
        "price": 1250,
        "discount": 990,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "ওয়াল মাউন্টেড কিচেন র্যাক ও হোল্ডার",
        "price": 1100,
        "discount": 850,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "কাটলারি ও চামচ অর্গানাইজার বক্স",
        "price": 650,
        "discount": 490,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      }
    ]
  },
  {
    "parentSlug": "kitchen-items",
    "subSlug": "choppers-blenders",
    "subName": "ইলেকট্রিক চপার ও ব্লেন্ডার",
    "products": [
      {
        "name": "ইলেকট্রিক মিট ও ভেজিটেবল ফুড চপার ২ লিটার",
        "price": 1850,
        "discount": 1490,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "রিচার্জেবল পোর্টেবল ইউএসবি স্মুদি ব্লেন্ডার",
        "price": 1250,
        "discount": 990,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "৩-ইন-১ মাল্টিফাংশনাল হ্যান্ড ব্লেন্ডার সেট",
        "price": 2600,
        "discount": 2150,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "ম্যানুয়াল পুশ হ্যান্ড চপার ৯০০ মি.লি",
        "price": 550,
        "discount": 390,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      },
      {
        "name": "ইলেকট্রিক স্পাইস ও কফি গ্রাইন্ডার",
        "price": 1450,
        "discount": 1150,
        "images": [
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
        ]
      }
    ]
  }
];

  let totalProducts = 0;
  const brandIds = Object.values(createdBrands);

  for (const subGroup of subcategoriesDataset) {
    const subcategoryId = createdCategories[subGroup.subSlug];
    const parentId = createdCategories[subGroup.parentSlug];

    if (!subcategoryId) {
      console.warn("Subcategory not found:", subGroup.subSlug);
      continue;
    }

    let pIdx = 1;
    for (const prod of subGroup.products) {
      totalProducts++;
      const uniqueSlug = subGroup.subSlug + "-" + pIdx + "-" + Date.now().toString().slice(-4);
      const uniqueSku = (subGroup.subSlug.substring(0, 4).toUpperCase() + "-" + String(pIdx).padStart(3, '0') + "-" + totalProducts);

      const brandId = brandIds[totalProducts % brandIds.length];

      await prisma.product.create({
        data: {
          name: prod.name,
          slug: uniqueSlug,
          sku: uniqueSku,
          categoryId: subcategoryId, // Linked directly to subcategory
          brandId,
          price: prod.price,
          discountPrice: prod.discount,
          stockQty: 25 + (totalProducts % 30),
          soldQty: 10 + (totalProducts % 40),
          isFeatured: pIdx === 1 || pIdx === 3,
          isBestSeller: pIdx === 1 || pIdx === 2,
          promotionalBadges: pIdx === 1 ? ["👑 Best Seller", "🔥 Hot Deal"] : ["✨ New Arrival"],
          tags: subGroup.subName + ", " + prod.name + ", " + subGroup.parentSlug,
          description: "<p>১০০% খাঁটি ও সর্বোচ্চ মানের <strong>" + prod.name + "</strong>। সারা দেশে দ্রুততম সময়ে হোম ডেলিভারি ও ক্যাশ অন ডেলিভারিতে চেক করে মূল্য পরিশোধের সুবিধা।</p>",
          images: prod.images,
          thumbnail: prod.images[0],
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          isActive: true,
          variants: {
            create: [
              {
                name: "Standard",
                sku: uniqueSku + "-STD",
                price: prod.discount || prod.price,
                stockQty: 15,
                isActive: true,
              },
              {
                name: "Premium Edition",
                sku: uniqueSku + "-PRM",
                price: (prod.discount || prod.price) + 200,
                stockQty: 10,
                isActive: true,
              },
            ],
          },
        },
      });

      pIdx++;
    }
  }

  console.log("==========================================================");
  console.log("ALL SUBCATEGORIES SEEDED SUCCESSFULLY WITH 5+ PRODUCTS EACH");
  console.log("TOTAL SUBCATEGORIES: 46");
  console.log("TOTAL PRODUCTS SEEDED: " + totalProducts);
  console.log("==========================================================");
}

main()
  .catch((e) => {
    console.error("Seed execution error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
