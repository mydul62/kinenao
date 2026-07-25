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
  console.log("Seeding Expanded Bangla Categories & Data Catalog...");

  // 1. Clear existing data in correct dependency order
  await prisma.timelineEvent.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
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

  // 2. Create Users
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
          fullName: "সিস্টেম অ্যাডমিন",
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
          fullName: "স্টোর ম্যানেজার",
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
          fullName: "আনিকা রহমান",
          phoneNumber: "01900000003",
          addresses: {
            create: [
              {
                street: "হাউস ১২, রোড ৫, সেক্টর ৩",
                city: "ঢাকা",
                postalCode: "১২৩০",
                area: "উত্তরা",
                isDefault: true,
              },
            ],
          },
        },
      },
    },
  });

  console.log("Users created.");

  // 3. Create Delivery Zones
  await prisma.deliveryZone.create({
    data: {
      zoneName: "ঢাকার ভিতরে",
      charge: 60.0,
      estDeliveryTime: "১-২ দিন",
    },
  });

  await prisma.deliveryZone.create({
    data: {
      zoneName: "ঢাকার বাইরে",
      charge: 120.0,
      estDeliveryTime: "৩-৫ দিন",
    },
  });

  console.log("Delivery Zones created.");

  // 4. Create Payment Methods
  await prisma.paymentMethod.create({
    data: {
      name: "bKash (বিকাশ)",
      accountNumber: "01700000001",
      accountName: "KineNao Shop",
      accountType: "Merchant",
      instructions: "বিকাশ মার্চেন্ট নম্বরে (01700000001) পেমেন্ট সম্পন্ন করে রেফারেন্স নম্বর দিন।",
      logoUrl: "",
      isActive: true,
    },
  });

  await prisma.paymentMethod.create({
    data: {
      name: "Nagad (নগদ)",
      accountNumber: "01800000001",
      accountName: "KineNao Shop",
      accountType: "Merchant",
      instructions: "নগদ মার্চেন্ট নম্বরে (01800000001) পেমেন্ট সম্পন্ন করুন।",
      logoUrl: "",
      isActive: true,
    },
  });

  await prisma.paymentMethod.create({
    data: {
      name: "Cash on Delivery (ক্যাশ অন ডেলিভারি)",
      accountNumber: "COD",
      accountName: "COD",
      accountType: "COD",
      instructions: "পণ্য হাতে পেয়ে টাকা পরিশোধ করুন। কোনো অগ্রিম পেমেন্ট প্রয়োজন নেই।",
      logoUrl: "",
      isActive: true,
    },
  });

  console.log("Payment Methods created.");

  // 5. Create 10 Rich Categories in Bangla
  const sareeCat = await prisma.category.create({
    data: { name: "শাড়ি", slug: "saree" },
  });

  const threePieceCat = await prisma.category.create({
    data: { name: "থ্রি-পিস", slug: "three-piece" },
  });

  const kidsCat = await prisma.category.create({
    data: { name: "বাচ্চাদের খেলনা ও বই", slug: "kids-toys-books" },
  });

  const makeupCat = await prisma.category.create({
    data: { name: "মেকআপ আইটেম", slug: "makeup-items" },
  });

  const homeDecorCat = await prisma.category.create({
    data: { name: "হোম ডেকোর", slug: "home-decor" },
  });

  const bagsCat = await prisma.category.create({
    data: { name: "ব্যাগ ও পার্স", slug: "bags-purses" },
  });

  const gadgetsCat = await prisma.category.create({
    data: { name: "ইলেকট্রনিক্স ও গ্যাজেট", slug: "electronics-gadgets" },
  });

  const healthCat = await prisma.category.create({
    data: { name: "হেলথ ও পার্সোনাল কেয়ার", slug: "health-personal-care" },
  });

  const jewelryCat = await prisma.category.create({
    data: { name: "জুয়েলারি ও এক্সেসরিজ", slug: "jewelry-accessories" },
  });

  const watchesCat = await prisma.category.create({
    data: { name: "ঘড়ি ও ফ্যাশন", slug: "watches-fashion" },
  });

  console.log("10 Bangla categories created.");

  // 6. Create Brands
  const htBrand = await prisma.brand.create({
    data: { name: "HT Brand", slug: "ht-brand" },
  });

  // Helper description generator matching exact demo image HTML structure
  const makeDesc = (title: string, quote: string, bullets: string[]) => `
<p>${title}</p>
<p>"${quote}"</p>
<p><strong>পণ্যের বিবরণ:-</strong></p>
${bullets.map((b) => `<p>🎀 ${b}</p>`).join("\n")}
<p>⛳ সারা দেশে হোম ডেলিভারি এবং ঢাকায় ১০০% ক্যাশ অন হোম ডেলিভারি দেয়া হয়</p>
`;

  // 7. Seed 18+ Products across all 10 categories
  const productsData = [
    // --- Category: শাড়ি ---
    {
      name: "জর্জেট এম্ব্রয়ডারি পার্টি শাড়ি",
      slug: "georgette-embroidery-party-saree",
      sku: "SAREE-GEO-01",
      categoryId: sareeCat.id,
      price: 3500.0,
      discountPrice: 2450.0,
      stockQty: 50,
      isFeatured: true,
      isBestSeller: true,
      isFlashSale: true,
      thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "এক্সক্লুসিভ জর্জেট এম্ব্রয়ডারি শাড়ি 🥻 ✨",
        "যেকোনো পার্টি বা উৎসবে আপনাকে দেবে অনন্য ও মার্জিত লুক। হাই-কোয়ালিটি জর্জেট ফেব্রিক ও গর্জিয়াস কারুকাজ।",
        [
          "প্রিমিয়াম কোয়ালিটি জর্জেট কাপড়ে নিখুঁত সুতার এম্ব্রয়ডারি কাজ।",
          "সাথে থাকছে মেচিং ব্লাউজ পিস।",
          "পরে অত্যন্ত আরামদায়ক এবং দীর্ঘস্থায়ী কালার গ্যারান্টি।"
        ]
      ),
    },
    {
      name: "প্রিমিয়াম তাঁতের সুতি জামদানি শাড়ি",
      slug: "premium-jamdani-cotton-saree",
      sku: "SAREE-JAM-02",
      categoryId: sareeCat.id,
      price: 2800.0,
      discountPrice: 1990.0,
      stockQty: 40,
      isFeatured: true,
      isBestSeller: true,
      thumbnail: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "হাতে বোনা তাঁতের জামদানি শাড়ি 🌸",
        "ঐতিহ্যবাহী জামদানি নকশায় তৈরি ১০০% কটন সুতি শাড়ি। ক্যাজুয়াল পরার জন্য সেরা পছন্দ।",
        [
          "সফট কটন ফেব্রিক, গরমে পরতে খুবই আরামদায়ক।",
          "আকর্ষণীয় ট্র্যাডিশনাল ডিজাইন ও স্থায়ী রং।"
        ]
      ),
    },

    // --- Category: থ্রি-পিস ---
    {
      name: "ডিজাইনার কটন ডিজিটাল প্রিন্ট থ্রি-পিস",
      slug: "designer-cotton-digital-print-three-piece",
      sku: "3PC-COT-01",
      categoryId: threePieceCat.id,
      price: 2200.0,
      discountPrice: 1450.0,
      stockQty: 80,
      isFeatured: true,
      isBestSeller: true,
      thumbnail: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "ডিজাইনার কটন থ্রি-পিস ৩-পিস কালেকশন 👗",
        "নান্দনিক ডিজিটাল প্রিন্ট ও সুতার নিখুঁত এমব্রয়ডারি কাজের আকর্ষণীয় থ্রি-পিস।",
        [
          "কামিজ: প্রিমিয়াম ডিজিটাল প্রিন্টেড কটন।",
          "সালোয়ার: ম্যাচিং সফট সুতি ফেব্রিক।",
          "ওড়না: বড় সাইজের শিফন/কটন ফুল প্রিন্টেড ওড়না।"
        ]
      ),
    },
    {
      name: "ইন্ডিয়ান লাক্সারি ভেলভেট থ্রি-পিস",
      slug: "indian-luxury-velvet-three-piece",
      sku: "3PC-VEL-02",
      categoryId: threePieceCat.id,
      price: 4500.0,
      discountPrice: 2990.0,
      stockQty: 30,
      isFeatured: true,
      isFlashSale: true,
      thumbnail: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "গর্জিয়াস ভেলভেট পার্টি থ্রি-পিস 💎",
        "শীতের পার্টি ও ওয়েডিং সিজনের জন্য রাজকীয় লাক্সারি ভেলভেট ড্রেস।",
        [
          "প্রিমিয়াম ভেলভেট কাপড়ে গোল্ডেন জরি ও চুমকির কারুকাজ।",
          "সাথে হেভি এমব্রয়ডারি ওড়না ও সালোয়ার।"
        ]
      ),
    },

    // --- Category: বাচ্চাদের খেলনা ও বই ---
    {
      name: "বাচ্চাদের ম্যাজিক ড্রয়িং বুক ও কালার পেন্সিল সেট",
      slug: "kids-magic-drawing-book-set",
      sku: "KIDS-BOOK-01",
      categoryId: kidsCat.id,
      price: 850.0,
      discountPrice: 490.0,
      stockQty: 150,
      isFeatured: true,
      isBestSeller: true,
      thumbnail: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "বাচ্চাদের ওয়াটার ম্যাজিক ড্রয়িং বুক 🎨 📖",
        "পাস ও পানি দিয়ে আঁকলে রঙ ভেসে ওঠে, শুকিয়ে গেলে আবার আঁকা যায়! বারবার ব্যবহারযোগ্য।",
        [
          "সম্পূর্ণ কেমিক্যাল মুক্ত ও বাচ্চাদের জন্য নিরাপদ।",
          "বাচ্চাদের ছবি আঁকা ও হাতের লেখা শেখার সেরা শিক্ষণীয় বই।",
          "সাথে পাচ্ছেন ম্যাজিক ওয়াটার পেন ও কালার পেন্সিল সেট।"
        ]
      ),
    },
    {
      name: "রিচার্জেবল টকিং ক্যাকটাস খেলনা",
      slug: "rechargeable-talking-cactus-toy",
      sku: "KIDS-TOY-02",
      categoryId: kidsCat.id,
      price: 950.0,
      discountPrice: 590.0,
      stockQty: 100,
      isFeatured: true,
      isFlashSale: true,
      thumbnail: "https://images.unsplash.com/photo-1558060370-d644479be6e7?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1558060370-d644479be6e7?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "ড্যান্সিং ও টকিং ক্যাকটাস খেলনা 🌵 🎵",
        "কথা বললে হুবহু অনুকরণ করে হাসায় এবং গান গেয়ে নেচে বাচ্চাদের আনন্দ দেয়!",
        [
          "১২০টি গান ও ভয়েস রেকর্ডিং ফিচার।",
          "ইউএসবি রিচার্জেবল ও লাইটিং ড্যান্স মোড।"
        ]
      ),
    },

    // --- Category: মেকআপ আইটেম ---
    {
      name: "Coil holder (মেটাল মস্কিউটো কয়েল হোল্ডার)",
      slug: "coil-holder",
      sku: "HT-COIL-01",
      categoryId: makeupCat.id,
      price: 550.0,
      discountPrice: 195.0,
      stockQty: 120,
      isFeatured: true,
      isBestSeller: true,
      isFlashSale: true,
      thumbnail: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop"
      ],
      description: makeDesc(
        "Metal Mosquito Coil Holder 🦟 🦟",
        "মশার উপদ্রব এখন চারিদিকেই, তাই নিরাপদে কয়েল ব্যবহার করতে আজই নিন Mosquito Coil Holder যাতে নেই কোথাও আগুন লাগার ভয়, ছাই ছড়াবে না ঘরের কোথাও",
        [
          "উচ্চ গ্রেড লোহা উপাদান তৈরি, যা নিরাপদ এবং ব্যবহার টেকসই।",
          "অত্যাধুনিক পাখির খাঁচা নকশা যা আপনার মার্জিত অভ্যন্তরীণ প্রসাধনে একীভূত করে।",
          "নিচে ঢাকনা দিয়ে, ছাই সংগ্রহ করা সহজ এবং চারপাশে কোনও অগোছালো নেই।",
          "এই পণ্যটি আপনার মশার কয়েল বা বিপরীতমুখী পোর্টেবল মশার ধূপের যেকোনো আকারের জন্য উপযুক্ত।",
          "সুবিধাজনক কয়েল ধারকটি বহন করা সহজ এবং আপনাকে বিরক্তিকর মশার উদ্বেগ ছাড়ে না।"
        ]
      ),
    },
    {
      name: "ম্যাট ওয়াটারপ্রুফ লিপস্টিক সেট (১২ পিস)",
      slug: "matte-waterproof-lipstick-set-12pcs",
      sku: "MKP-LIP-12",
      categoryId: makeupCat.id,
      price: 1800.0,
      discountPrice: 990.0,
      stockQty: 90,
      isFeatured: true,
      isBestSeller: true,
      thumbnail: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "১২ পিস লং-লাস্টিং ম্যাট লিপস্টিক সেট 💄 ✨",
        "স্মাজপ্রুফ ও ওয়াটারপ্রুফ ফর্মুলা যা সারাদিন ঠোঁটে সুন্দর কালার ধরে রাখে।",
        [
          "১২টি আকর্ষণীয় ভিন্ন শেড।",
          "ঠোঁট শুষ্ক করে না এবং স্মুথ ফিনিশিং দেয়।"
        ]
      ),
    },
    {
      name: "অল-ইন-ওয়ান প্রফেশনাল মেকআপ কিট",
      slug: "all-in-one-professional-makeup-kit",
      sku: "MKP-KIT-01",
      categoryId: makeupCat.id,
      price: 3200.0,
      discountPrice: 1850.0,
      stockQty: 60,
      isFeatured: true,
      isFlashSale: true,
      thumbnail: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "কমপ্লিট মেকআপ কম্বো প্যাক 💅 💄",
        "আইশ্যাডো প্যালেন্ট, ব্লাশ, লিপস্টিক ও মেকআপ ব্রাশের অল-ইন-ওয়ান প্রফেশনাল সেট।",
        [
          "ব্রাইডাল ও ডেইলি মেকআপের জন্য পারফেক্ট।",
          "স্কিন ফ্রেন্ডলি ও দীর্ঘস্থায়ী পগমেন্টেশন।"
        ]
      ),
    },

    // --- Category: হোম ডেকোর ---
    {
      name: "দুই পাশে রিং যুক্ত - Dolna",
      slug: "dual-ring-dolna",
      sku: "HT-DOLNA-RING",
      categoryId: homeDecorCat.id,
      price: 750.0,
      discountPrice: 499.0,
      stockQty: 90,
      isFeatured: true,
      isFlashSale: true,
      thumbnail: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "হাতে বোনা ঝুলন্ত দোলনা 🏡",
        "বাসা, বারান্দা কিংবা গার্ডেনে ঝুলানোর জন্য আরামদায়ক হ্যান্ডমেড কটন দোলনা।",
        [
          "শক্তিশালী মেটাল রিং সাপোর্ট ও ২০০ কেজির বেশি ওজন সহ্য ক্ষমতা।",
          "ঘরের সৌন্দর্য বৃদ্ধিতে অনবদ্য।"
        ]
      ),
    },
    {
      name: "VIP Bedding (Mosquito Net Tent)",
      slug: "vip-bedding-mosquito-net-tent",
      sku: "HT-VIP-NET-TENT",
      categoryId: homeDecorCat.id,
      price: 3500.0,
      discountPrice: 2999.0,
      stockQty: 60,
      isFeatured: true,
      thumbnail: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "ভিআইপি ফোল্ডিং মশারি টেন্ট ⛺",
        "সহজেই ভাঁজ করে বহনযোগ্য প্রিমিয়াম কোয়ালিটি মশারি।",
        [
          "ডাবল ও সিঙ্গেল সাইজ এভেলেবল।",
          "ছোট বাচ্চাদের ও বড়দের নিরাপদে মশার কামড় থেকে বাঁচায়।"
        ]
      ),
    },

    // --- Category: ব্যাগ ও পার্স ---
    {
      name: "লেডিজ লাক্সারি লেদার হ্যান্ডব্যাগ",
      slug: "ladies-luxury-leather-handbag",
      sku: "BAG-LEA-01",
      categoryId: bagsCat.id,
      price: 2500.0,
      discountPrice: 1650.0,
      stockQty: 75,
      isFeatured: true,
      isBestSeller: true,
      thumbnail: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "প্রিমিয়াম পিইউ লেদার হ্যান্ডব্যাগ 👜",
        "অফিস, শপিং ও পার্টিতে ব্যবহারের জন্য মার্জিত ডিজাইনের লেদার ব্যাগ।",
        [
          "পানিরোধক ওয়াটারপ্রুফ মেটেরিয়াল।",
          "যথেষ্ট স্পেস ও আলাদা জিপার পকেট।"
        ]
      ),
    },

    // --- Category: ইলেকট্রনিক্স ও গ্যাজেট ---
    {
      name: "Rechargeable Electric Mosquito Racket",
      slug: "rechargeable-electric-mosquito-racket",
      sku: "HT-ELEC-RACKET",
      categoryId: gadgetsCat.id,
      price: 600.0,
      discountPrice: 450.0,
      stockQty: 100,
      isFeatured: true,
      isBestSeller: true,
      thumbnail: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "রিচার্জেবল ইলেকট্রিক মশা মারার র‍্যাকেট ⚡",
        "হাই ভোল্টেজ ব্যাকলাইট ইউভি লাইট সহ কার্যকর রিচার্জেবল র‍্যাকেট।",
        [
          "শক্তিশালী ব্যাটারি ও দ্রুত চার্জিং সাপোর্ট।",
          "ট্রিপল লেয়ার সেফটি নেট।"
        ]
      ),
    },
    {
      name: "পোর্টেবল ব্লুটুথ স্পিকার (ওয়াটারপ্রুফ)",
      slug: "portable-bluetooth-speaker-waterproof",
      sku: "GDT-SPK-01",
      categoryId: gadgetsCat.id,
      price: 1800.0,
      discountPrice: 1150.0,
      stockQty: 85,
      isFeatured: true,
      isFlashSale: true,
      thumbnail: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "পোর্টেবল ওয়ারলেস স্পিকার 🔊",
        "হাই বাস ক্রিস্টাল ক্লিয়ার সাউন্ড সহ মিনি ব্লুটুথ স্পিকার।",
        [
          "১০ ঘণ্টা একটানা প্লেব্যাক ব্যাটারি ব্যাকআপ।",
          "ওয়াটারপ্রুফ বডি ডিজাইন।"
        ]
      ),
    },

    // --- Category: হেলথ ও পার্সোনাল কেয়ার ---
    {
      name: "Body massager (বডি ম্যাসাজার)",
      slug: "body-massager",
      sku: "HT-BODY-MASSAGER",
      categoryId: healthCat.id,
      price: 550.0,
      discountPrice: 320.0,
      stockQty: 80,
      isFeatured: true,
      isBestSeller: true,
      thumbnail: "https://images.unsplash.com/photo-1519824145371-296894a0daf9?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1519824145371-296894a0daf9?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "Electric Body Massager 💆‍♂️",
        "ঘাড়, কাঁধ এবং শরীরের মাংসপেশীর ক্লান্তি দূর করতে কার্যকরী হ্যান্ডহেল্ড ম্যাসাজার।",
        [
          "৩টি পরিবর্তনযোগ্য হেড ও রিল্যাক্সেশন মোড।",
          "রক্ত সঞ্চালন বৃদ্ধি করে এবং শরীর দ্রুত সতেজ করে।"
        ]
      ),
    },
    {
      name: "Mesh Nebulizer (Model: JSL-W302)",
      slug: "mesh-nebulizer-jsl-w302",
      sku: "HT-NEBULIZER-W302",
      categoryId: healthCat.id,
      price: 2200.0,
      discountPrice: 1250.0,
      stockQty: 45,
      isFeatured: true,
      isFlashSale: true,
      thumbnail: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "পোর্টেবল মেস নেবুলাইজার 🩺",
        "বাচ্চা ও বড়দের শ্বাসকষ্ট উপশমে নিঃশব্দ ও পোর্টেবল নেবুলাইজার মেশিন।",
        [
          "পকেটে বহনযোগ্য সাইজ।",
          "ব্যাটারি ও ইউএসবি ক্যাবল উভয় দিয়ে চালিত।"
        ]
      ),
    },

    // --- Category: জুয়েলারি ও এক্সেসরিজ ---
    {
      name: "গোল্ড প্লেটেড ট্রেডিশনাল নেকলেস সেট",
      slug: "gold-plated-traditional-necklace-set",
      sku: "JWL-NECK-01",
      categoryId: jewelryCat.id,
      price: 1950.0,
      discountPrice: 1290.0,
      stockQty: 70,
      isFeatured: true,
      isBestSeller: true,
      thumbnail: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "এক্সক্লুসিভ গয়না সেট 💍 ✨",
        "শাড়ি বা থ্রি-পিসের সাথে পরার জন্য গর্জিয়াস গোল্ড প্লেটেড নেকলেস ও কানের দুল সেট।",
        [
          "দীর্ঘস্থায়ী শাইনিং কালার কোটিং।",
          "হালকা ওজন ও কমফোর্টেবল পরা।"
        ]
      ),
    },

    // --- Category: ঘড়ি ও ফ্যাশন ---
    {
      name: "লাক্সারি মেটাল স্ট্র্যাপ লেডিস ওয়াচ",
      slug: "luxury-metal-strap-ladies-watch",
      sku: "WTC-MET-01",
      categoryId: watchesCat.id,
      price: 2400.0,
      discountPrice: 1490.0,
      stockQty: 60,
      isFeatured: true,
      isFlashSale: true,
      thumbnail: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop"],
      description: makeDesc(
        "প্রিমিয়াম স্টেইনলেস স্টিল ঘড়ি ⌚ ✨",
        "ওয়াটারপ্রুফ ডায়াল ও এলিগ্যান্ট ডায়মন্ড কাট ফিনিশিং ঘড়ি।",
        [
          "জাপানি কুয়ার্টজ মুভমেন্ট।",
          "১ বছরের গ্যারান্টি কার্ড।"
        ]
      ),
    },
  ];

  for (const item of productsData) {
    await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        categoryId: item.categoryId,
        price: item.price,
        discountPrice: item.discountPrice,
        stockQty: item.stockQty,
        isFeatured: item.isFeatured,
        isBestSeller: item.isBestSeller,
        isFlashSale: item.isFlashSale,
        thumbnail: item.thumbnail,
        images: item.images,
        description: item.description,
        brandId: htBrand.id,
        unit: "kg",
        weight: 0.5,
        isActive: true,
      },
    });
  }

  console.log(`${productsData.length} products seeded successfully.`);

  // 8. Create Coupons
  await prisma.coupon.create({
    data: {
      code: "BANGLA10",
      type: CouponType.PERCENTAGE,
      value: 10.0,
      minPurchase: 500.0,
      usageLimit: 500,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Database reset & expanded seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
