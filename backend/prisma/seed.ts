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
  console.log("Starting comprehensive Kinenao database seeding (All Categories + Minimum 4 Subcategories & Products)...");

  // 1. Clear existing transactional records in correct foreign-key dependency order
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

  console.log("Users created.");

  // 3. Create Delivery Zones
  const insideDhaka = await prisma.deliveryZone.create({
    data: {
      zoneName: "Inside Dhaka (ঢাকার ভিতরে)",
      charge: 60.0,
      estDeliveryTime: "1-2 Days (২৪-৪৮ ঘন্টা)",
    },
  });

  await prisma.deliveryZone.create({
    data: {
      zoneName: "Outside Dhaka (ঢাকার বাইরে)",
      charge: 120.0,
      estDeliveryTime: "3-5 Days (৩-৫ দিন)",
    },
  });

  console.log("Delivery Zones created.");

  // 4. Create Payment Methods (including Cash on Delivery)
  await prisma.paymentMethod.create({
    data: {
      name: "Cash on Delivery (ক্যাশ অন ডেলিভারি)",
      accountNumber: "COD",
      accountName: "Cash on Delivery",
      accountType: "COD",
      instructions: "পণ্য হাতে পেয়ে টাকা পরিশোধ করুন। কোনো প্রকার অগ্রিম পেমেন্ট প্রয়োজন নেই। ১০০% নিরাপদ কেনাকাটা।",
      logoUrl: "",
      isActive: true,
    },
  });

  await prisma.paymentMethod.create({
    data: {
      name: "bKash (বিকাশ মার্চেন্ট)",
      accountNumber: "01700000001",
      accountName: "Kinenao Official",
      accountType: "Merchant",
      instructions: "বিকাশ অ্যাপ থেকে 'Make Payment' অপশন ব্যবহার করে 01700000001 নম্বরে পেমেন্ট করুন।",
      logoUrl: "",
      isActive: true,
    },
  });

  await prisma.paymentMethod.create({
    data: {
      name: "Nagad (নগদ মার্চেন্ট)",
      accountNumber: "01800000001",
      accountName: "Kinenao Official",
      accountType: "Merchant",
      instructions: "নগদ অ্যাপ অথবা ইউএসএসডি কোড দিয়ে মার্চেন্ট পে করুন।",
      logoUrl: "",
      isActive: true,
    },
  });

  console.log("Payment Methods created.");

  // 5. Create Brands
  const brandKinenao = await prisma.brand.create({
    data: { name: "Kinenao Luxe", slug: "kinenao-luxe", isActive: true },
  });
  const brandHeritage = await prisma.brand.create({
    data: { name: "Heritage Craft", slug: "heritage-craft", isActive: true },
  });
  const brandNature = await prisma.brand.create({
    data: { name: "Pure Nature", slug: "pure-nature", isActive: true },
  });

  // 6. Create Multi-Level Categories with 4+ Subcategories each
  const sampleVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  const sampleVideoUrl2 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

  // Category 1: Beauty & Cosmetics
  const beautyCat = await prisma.category.create({
    data: {
      name: "Beauty Products",
      slug: "beauty-products",
      description: "১০০% অথেনটিক লিপস্টিক, স্কিনকেয়ার সিরাম, মেকআপ ও পারফিউম",
      imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 1,
    },
  });
  const subLipsticks = await prisma.category.create({
    data: { name: "Lipsticks & Gloss", slug: "lipsticks", parentId: beautyCat.id, sortOrder: 1 },
  });
  const subSkincare = await prisma.category.create({
    data: { name: "Skincare Serums", slug: "skincare", parentId: beautyCat.id, sortOrder: 2 },
  });
  const subFoundation = await prisma.category.create({
    data: { name: "Foundation & Powders", slug: "foundation", parentId: beautyCat.id, sortOrder: 3 },
  });
  const subPerfumes = await prisma.category.create({
    data: { name: "Designer Perfumes", slug: "perfumes", parentId: beautyCat.id, sortOrder: 4 },
  });

  // Category 2: Beverages
  const beveragesCat = await prisma.category.create({
    data: {
      name: "Beverages",
      slug: "beverages",
      description: "প্রিমিয়াম ব্ল্যাক টি, রোস্টেড কফি বিন্স, এনার্জি ড্রিংকস ও ফলের জুস",
      imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 2,
    },
  });
  const subTea = await prisma.category.create({
    data: { name: "Premium Tea", slug: "tea", parentId: beveragesCat.id, sortOrder: 1 },
  });
  const subCoffee = await prisma.category.create({
    data: { name: "Coffee & Nescafe", slug: "coffee", parentId: beveragesCat.id, sortOrder: 2 },
  });
  const subJuice = await prisma.category.create({
    data: { name: "Fruit Juices", slug: "juice", parentId: beveragesCat.id, sortOrder: 3 },
  });
  const subEnergyDrinks = await prisma.category.create({
    data: { name: "Energy Drinks & Soda", slug: "energy-drinks", parentId: beveragesCat.id, sortOrder: 4 },
  });

  // Category 3: Cooking
  const cookingCat = await prisma.category.create({
    data: {
      name: "Cooking",
      slug: "cooking",
      description: "খাঁটি সরিষার তেল, চাল, ডাল, ঘি, চিনি, মসলা ও রান্নার প্রয়োজনীয় সামগ্রী",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 3,
    },
  });
  const subSpices = await prisma.category.create({
    data: { name: "Spices & Powders", slug: "spices", parentId: cookingCat.id, sortOrder: 1 },
  });
  const subOil = await prisma.category.create({
    data: { name: "Mustard & Cooking Oil", slug: "oil", parentId: cookingCat.id, sortOrder: 2 },
  });
  const subRice = await prisma.category.create({
    data: { name: "Rice & Grain", slug: "rice", parentId: cookingCat.id, sortOrder: 3 },
  });
  const subDal = await prisma.category.create({
    data: { name: "Dal or Lentil", slug: "dal-lentil", parentId: cookingCat.id, sortOrder: 4 },
  });
  const subGhee = await prisma.category.create({
    data: { name: "Ghee", slug: "ghee", parentId: cookingCat.id, sortOrder: 5 },
  });
  const subReadyMix = await prisma.category.create({
    data: { name: "Ready Mix", slug: "ready-mix", parentId: cookingCat.id, sortOrder: 6 },
  });

  // Category 4: Dairy, Eggs & Bakery
  const dairyCat = await prisma.category.create({
    data: {
      name: "Dairy, Eggs & Bakery",
      slug: "dairy-eggs-bakery",
      description: "খাঁটি গরুর তরল দুধ, মাখন, পনির, ফার্মের তাজা ডিম ও বেকারি কুকিজ",
      imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 4,
    },
  });
  const subMilk = await prisma.category.create({
    data: { name: "Liquid Milk", slug: "milk", parentId: dairyCat.id, sortOrder: 1 },
  });
  const subEggs = await prisma.category.create({
    data: { name: "Eggs", slug: "eggs", parentId: dairyCat.id, sortOrder: 2 },
  });
  const subButter = await prisma.category.create({
    data: { name: "Butter & Cheese", slug: "butter-cheese", parentId: dairyCat.id, sortOrder: 3 },
  });
  const subBakery = await prisma.category.create({
    data: { name: "Bread & Bakery", slug: "bakery-bread", parentId: dairyCat.id, sortOrder: 4 },
  });

  // Category 5: Fruits & Vegetables
  const fruitsCat = await prisma.category.create({
    data: {
      name: "Fruits & Vegetables",
      slug: "fruits-vegetables",
      description: "ফরমালিনমুক্ত তাজা দেশি-বিদেশি ফলমূল ও অর্গানিক শাকসবজি",
      imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 5,
    },
  });
  const subFreshFruits = await prisma.category.create({
    data: { name: "Fresh Fruits", slug: "fresh-fruits", parentId: fruitsCat.id, sortOrder: 1 },
  });
  const subFreshVeg = await prisma.category.create({
    data: { name: "Fresh Vegetables", slug: "fresh-veg", parentId: fruitsCat.id, sortOrder: 2 },
  });
  const subOrganicSalad = await prisma.category.create({
    data: { name: "Organic Salad & Herbs", slug: "organic-salad", parentId: fruitsCat.id, sortOrder: 3 },
  });
  const subDryFruits = await prisma.category.create({
    data: { name: "Dry Fruits & Nuts", slug: "dry-fruits", parentId: fruitsCat.id, sortOrder: 4 },
  });

  // Category 6: Health Products
  const healthCat = await prisma.category.create({
    data: {
      name: "Health Products",
      slug: "health-products",
      description: "হ্যান্ড ওয়াশ, স্যাভলন, অ্যান্টিসেপ্টিক ও স্বাস্থ্য সচেতনতার পণ্য",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 6,
    },
  });
  const subHandwash = await prisma.category.create({
    data: { name: "Hand Wash & Soaps", slug: "handwash", parentId: healthCat.id, sortOrder: 1 },
  });
  const subFirstAid = await prisma.category.create({
    data: { name: "First Aid & Hygiene", slug: "first-aid", parentId: healthCat.id, sortOrder: 2 },
  });
  const subAntiseptic = await prisma.category.create({
    data: { name: "Antiseptic Liquid", slug: "antiseptic", parentId: healthCat.id, sortOrder: 3 },
  });
  const subSupplements = await prisma.category.create({
    data: { name: "Health Supplements", slug: "supplements", parentId: healthCat.id, sortOrder: 4 },
  });

  // Category 7: Home & Cleaning
  const homeCleaningCat = await prisma.category.create({
    data: {
      name: "Home & Cleaning",
      slug: "home-cleaning",
      description: "ঘর সাজানো, ডিসওয়াশ লিকুইড, ডিটারজেন্ট ও ক্লিনিং ইকুইপমেন্ট",
      imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 7,
    },
  });
  const subMops = await prisma.category.create({
    data: { name: "Brooms & Mops", slug: "mops-brooms", parentId: homeCleaningCat.id, sortOrder: 1 },
  });
  const subDetergent = await prisma.category.create({
    data: { name: "Detergent & Cleaner", slug: "detergents", parentId: homeCleaningCat.id, sortOrder: 2 },
  });
  const subDishwash = await prisma.category.create({
    data: { name: "Dishwashing Liquids", slug: "dishwash", parentId: homeCleaningCat.id, sortOrder: 3 },
  });
  const subAirFreshener = await prisma.category.create({
    data: { name: "Air Fresheners", slug: "air-fresheners", parentId: homeCleaningCat.id, sortOrder: 4 },
  });

  // Category 8: Meat & Fish
  const meatFishCat = await prisma.category.create({
    data: {
      name: "Meat & Fish",
      slug: "meat-fish",
      description: "তাজা দেশি মুরগি, বিফ, খাসির মাংস এবং নদী ও সাগরের টাটকা মাছ",
      imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 8,
    },
  });
  const subChicken = await prisma.category.create({
    data: { name: "Fresh Chicken", slug: "chicken", parentId: meatFishCat.id, sortOrder: 1 },
  });
  const subBeef = await prisma.category.create({
    data: { name: "Beef & Mutton", slug: "beef-mutton", parentId: meatFishCat.id, sortOrder: 2 },
  });
  const subHilsha = await prisma.category.create({
    data: { name: "Fresh Hilsha Fish", slug: "hilsha-fish", parentId: meatFishCat.id, sortOrder: 3 },
  });
  const subShrimp = await prisma.category.create({
    data: { name: "Prawn & Shrimp", slug: "shrimp-prawn", parentId: meatFishCat.id, sortOrder: 4 },
  });

  // Category 9: Pet Care
  const petCareCat = await prisma.category.create({
    data: {
      name: "Pet Care",
      slug: "pet-care",
      description: "বিড়াল ও কুকুরের পুষ্টিকর ড্রাইড ফুড, ক্যাট লিটার ও আনুষাঙ্গিক",
      imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 9,
    },
  });
  const subCatFood = await prisma.category.create({
    data: { name: "Cat Food & Treats", slug: "cat-food", parentId: petCareCat.id, sortOrder: 1 },
  });
  const subDogFood = await prisma.category.create({
    data: { name: "Dog Food", slug: "dog-food", parentId: petCareCat.id, sortOrder: 2 },
  });
  const subCatLitter = await prisma.category.create({
    data: { name: "Cat Litter & Sand", slug: "cat-litter", parentId: petCareCat.id, sortOrder: 3 },
  });
  const subPetAccessories = await prisma.category.create({
    data: { name: "Pet Accessories", slug: "pet-accessories", parentId: petCareCat.id, sortOrder: 4 },
  });

  // Category 10: Stationery & Office
  const stationeryCat = await prisma.category.create({
    data: {
      name: "Stationery & Office",
      slug: "stationery-office",
      description: "A4 পেপার, নোটবুক, কলম, মার্কার, ফাইল ও প্রয়োজনীয় অফিস সামগ্রী",
      imageUrl: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 10,
    },
  });
  const subPaper = await prisma.category.create({
    data: { name: "A4 Paper & Notebooks", slug: "paper-notes", parentId: stationeryCat.id, sortOrder: 1 },
  });
  const subPens = await prisma.category.create({
    data: { name: "Pens & Highlighters", slug: "pens-markers", parentId: stationeryCat.id, sortOrder: 2 },
  });
  const subFiles = await prisma.category.create({
    data: { name: "Files & Folders", slug: "files-folders", parentId: stationeryCat.id, sortOrder: 3 },
  });
  const subArtSupplies = await prisma.category.create({
    data: { name: "Art & Craft Supplies", slug: "art-craft", parentId: stationeryCat.id, sortOrder: 4 },
  });

  // Category 11: Saree (শাড়ি)
  const sareeCat = await prisma.category.create({
    data: {
      name: "Saree",
      slug: "saree",
      description: "এক্সক্লুসিভ জর্জেট, সুতি, সিল্ক ও ঢাকাই জামদানি শাড়ির বিশাল কালেকশন",
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 11,
    },
  });
  const subCottonSaree = await prisma.category.create({
    data: { name: "Cotton Saree", slug: "cotton-saree", parentId: sareeCat.id, sortOrder: 1 },
  });
  const subSilkSaree = await prisma.category.create({
    data: { name: "Silk Saree", slug: "silk-saree", parentId: sareeCat.id, sortOrder: 2 },
  });
  const subJamdani = await prisma.category.create({
    data: { name: "Jamdani", slug: "jamdani-saree", parentId: sareeCat.id, sortOrder: 3 },
  });
  const subGeorgette = await prisma.category.create({
    data: { name: "Georgette Saree", slug: "georgette-saree", parentId: sareeCat.id, sortOrder: 4 },
  });

  // Category 12: Three Piece
  const threePieceCat = await prisma.category.create({
    data: {
      name: "Three Piece",
      slug: "three-piece",
      description: "ডিজাইনার এম্ব্রয়ডারি, পার্টি ওয়্যার ও লন থ্রি-পিস স্যুট কালেকশন",
      imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 12,
    },
  });
  const subEmbroidered = await prisma.category.create({
    data: { name: "Embroidered", slug: "embroidered-three-piece", parentId: threePieceCat.id, sortOrder: 1 },
  });
  const subPartyWear = await prisma.category.create({
    data: { name: "Party Wear", slug: "party-wear-three-piece", parentId: threePieceCat.id, sortOrder: 2 },
  });
  const subLawn = await prisma.category.create({
    data: { name: "Lawn Suits", slug: "lawn-suits", parentId: threePieceCat.id, sortOrder: 3 },
  });
  const subBoutique = await prisma.category.create({
    data: { name: "Boutique Collection", slug: "boutique-collection", parentId: threePieceCat.id, sortOrder: 4 },
  });

  // Category 13: Bags & Purses
  const bagsCat = await prisma.category.create({
    data: {
      name: "Bags & Purses",
      slug: "bags-purses",
      description: "স্টাইলিশ লেদার হ্যান্ডব্যাগ, ক্লাচ, শোল্ডার ব্যাগ ও ওয়ালেট",
      imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 13,
    },
  });
  const subLeatherBags = await prisma.category.create({
    data: { name: "Leather Handbags", slug: "leather-handbags", parentId: bagsCat.id, sortOrder: 1 },
  });
  const subClutches = await prisma.category.create({
    data: { name: "Party Clutches", slug: "party-clutches", parentId: bagsCat.id, sortOrder: 2 },
  });
  const subWallets = await prisma.category.create({
    data: { name: "Ladies Wallets", slug: "ladies-wallets", parentId: bagsCat.id, sortOrder: 3 },
  });
  const subTote = await prisma.category.create({
    data: { name: "Tote Bags", slug: "tote-bags", parentId: bagsCat.id, sortOrder: 4 },
  });

  // Category 14: Jewellery
  const jewelleryCat = await prisma.category.create({
    data: {
      name: "Jewellery",
      slug: "jewellery",
      description: "গোল্ড প্লেটেড ব্রাইডাল সেট, পার্ল নেকলেস ও ট্রেন্ডি কানের দুল",
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 14,
    },
  });
  const subBridalSets = await prisma.category.create({
    data: { name: "Bridal Sets", slug: "bridal-sets", parentId: jewelleryCat.id, sortOrder: 1 },
  });
  const subNecklaces = await prisma.category.create({
    data: { name: "Pearl Necklaces", slug: "pearl-necklaces", parentId: jewelleryCat.id, sortOrder: 2 },
  });
  const subEarrings = await prisma.category.create({
    data: { name: "Traditional Earrings", slug: "traditional-earrings", parentId: jewelleryCat.id, sortOrder: 3 },
  });
  const subBangles = await prisma.category.create({
    data: { name: "Gold Plated Bangles", slug: "gold-bangles", parentId: jewelleryCat.id, sortOrder: 4 },
  });

  // Category 15: Kids & Toys
  const kidsCat = await prisma.category.create({
    data: {
      name: "Kids & Toys",
      slug: "kids-toys",
      description: "বাচ্চাদের আকর্ষণীয় খেলনা, সুন্দর পোশাক ও শিক্ষণীয় বই",
      imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 15,
    },
  });
  const subEducationalToys = await prisma.category.create({
    data: { name: "Educational Toys", slug: "educational-toys", parentId: kidsCat.id, sortOrder: 1 },
  });
  const subKidsClothes = await prisma.category.create({
    data: { name: "Kids Fashion", slug: "kids-fashion", parentId: kidsCat.id, sortOrder: 2 },
  });
  const subKidsBooks = await prisma.category.create({
    data: { name: "Drawing & Story Books", slug: "kids-books", parentId: kidsCat.id, sortOrder: 3 },
  });
  const subBabyCare = await prisma.category.create({
    data: { name: "Baby Care Items", slug: "baby-care", parentId: kidsCat.id, sortOrder: 4 },
  });

  // Category 16: Watches
  const watchesCat = await prisma.category.create({
    data: {
      name: "Watches",
      slug: "watches",
      description: "লাক্সারি ক্লাসিক ক্রোনোগ্রাফ ঘড়ি ও প্রিমিয়াম বেল্ট",
      imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop",
      isFeatured: true,
      sortOrder: 16,
    },
  });
  const subLadiesWatches = await prisma.category.create({
    data: { name: "Ladies Elegant Watches", slug: "ladies-watches", parentId: watchesCat.id, sortOrder: 1 },
  });
  const subSmartWatches = await prisma.category.create({
    data: { name: "Smart Fitness Watches", slug: "smart-watches", parentId: watchesCat.id, sortOrder: 2 },
  });
  const subClassicWatches = await prisma.category.create({
    data: { name: "Classic Chronograph", slug: "classic-watches", parentId: watchesCat.id, sortOrder: 3 },
  });
  const subBelts = await prisma.category.create({
    data: { name: "Leather Belts", slug: "leather-belts", parentId: watchesCat.id, sortOrder: 4 },
  });

  console.log("16 Categories and 64+ Subcategories created.");

  // 7. Seed Products with Video URL, Color Variants (with Hex codes), and Stock
  console.log("Seeding products across all categories...");

  // Product 1: Cotton Saree
  await prisma.product.create({
    data: {
      name: "Premium Handloom Soft Cotton Saree",
      slug: "premium-handloom-soft-cotton-saree",
      sku: "SAR-COT-001",
      description: "<h3>প্রিমিয়াম হ্যান্ডলুম কটন শাড়ি</h3><p>আমাদের নিজস্ব তাঁতে তৈরি শতভাগ খাঁটি সুতি শাড়ি। হালকা ও আরামদায়ক।</p>",
      categoryId: subCottonSaree.id,
      brandId: brandHeritage.id,
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
      ],
      videoUrl: sampleVideoUrl,
      videoPosterUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
      variants: {
        create: [
          { name: "Crimson Red (লাল)", colorName: "Red", colorCode: "#DC2626", sku: "SAR-COT-001-RED", price: 1750.0, stockQty: 30, sortOrder: 1 },
          { name: "Royal Blue (নীল)", colorName: "Royal Blue", colorCode: "#2563EB", sku: "SAR-COT-001-BLU", price: 1750.0, stockQty: 25, sortOrder: 2 },
          { name: "Emerald Green (সবুজ)", colorName: "Emerald Green", colorCode: "#059669", sku: "SAR-COT-001-GRN", price: 1750.0, stockQty: 20, sortOrder: 3 },
          { name: "Mustard Gold (হলুদ)", colorName: "Mustard Gold", colorCode: "#F59E0B", sku: "SAR-COT-001-GLD", price: 1750.0, stockQty: 10, sortOrder: 4 },
        ],
      },
    },
  });

  // Product 2: Silk Saree
  await prisma.product.create({
    data: {
      name: "Pure Katan Silk Traditional Festive Saree",
      slug: "pure-katan-silk-traditional-festive-saree",
      sku: "SAR-SLK-002",
      description: "<h3>খাঁটি কাতান সিল্ক শাড়ি</h3><p>জমকালো অনুষ্ঠান ও উৎসবের জন্য আকর্ষণীয় গোল্ডেন জরির কারুকাজ করা শাড়ি।</p>",
      categoryId: subSilkSaree.id,
      brandId: brandHeritage.id,
      price: 3800.0,
      discountPrice: 2850.0,
      stockQty: 40,
      isActive: true,
      isFeatured: true,
      thumbnail: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
      ],
      videoUrl: sampleVideoUrl2,
      variants: {
        create: [
          { name: "Magenta Pink", colorName: "Magenta", colorCode: "#BE185D", sku: "SAR-SLK-002-PNK", price: 2850.0, stockQty: 20, sortOrder: 1 },
          { name: "Deep Maroon", colorName: "Maroon", colorCode: "#831843", sku: "SAR-SLK-002-MRN", price: 2850.0, stockQty: 20, sortOrder: 2 },
        ],
      },
    },
  });

  // Product 3: Cooking Oil
  await prisma.product.create({
    data: {
      name: "Pure Mustard Cooking Oil (ঘানি ভাঙা খাঁটি সরিষার তেল)",
      slug: "pure-mustard-cooking-oil",
      sku: "CKG-OIL-001",
      description: "<h3>কাঠের ঘানিতে ভাঙানো খাঁটি সরিষার তেল</h3><p>১০০% খাঁটি দেশি সরিষা থেকে প্রস্তুত। ঝাঁঝালো সুবাস ও পুষ্টিগুণ অক্ষুণ্ণ।</p>",
      categoryId: subOil.id,
      brandId: brandNature.id,
      price: 380.0,
      discountPrice: 320.0,
      stockQty: 100,
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      customBadge: "⭐ 100% Pure",
      thumbnail: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1589927986089-35812388d1f4?q=80&w=800&auto=format&fit=crop",
      ],
      videoUrl: sampleVideoUrl,
      variants: {
        create: [
          { name: "1 Litre Bottle", colorName: "1 Litre", colorCode: "#D97706", sku: "CKG-OIL-001-1L", price: 320.0, stockQty: 50, sortOrder: 1 },
          { name: "2 Litre Jar", colorName: "2 Litre", colorCode: "#B45309", sku: "CKG-OIL-001-2L", price: 620.0, stockQty: 30, sortOrder: 2 },
          { name: "5 Litre Can", colorName: "5 Litre", colorCode: "#92400E", sku: "CKG-OIL-001-5L", price: 1520.0, stockQty: 20, sortOrder: 3 },
        ],
      },
    },
  });

  // Product 4: Spices Combo Pack
  await prisma.product.create({
    data: {
      name: "Organic Special Spices Powder Mix (খাঁটি গুঁড়া মসলা প্যাকেজ)",
      slug: "organic-special-spices-powder-mix",
      sku: "CKG-SPC-004",
      description: "<h3>সম্পূর্ণ ভেজালমুক্ত গুঁড়া মসলা কম্বো প্যাক</h3><p>হলুদ, মরিচ, ধনিয়া ও জিরা গুঁড়ার ফ্রেশ কম্বিনেশন।</p>",
      categoryId: subSpices.id,
      brandId: brandNature.id,
      price: 650.0,
      discountPrice: 490.0,
      stockQty: 90,
      isActive: true,
      isFeatured: true,
      thumbnail: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop",
      ],
    },
  });

  // Product 5: Three Piece Embroidered
  await prisma.product.create({
    data: {
      name: "Designer Embroidered Cotton Three Piece Suit",
      slug: "designer-embroidered-cotton-three-piece-suit",
      sku: "THR-EMB-003",
      description: "<h3>ডিজাইনার এম্ব্রয়ডারি থ্রি-পিস</h3><p>উন্নত মানের প্রিমিয়াম জর্জেট ও কটন কম্বিনেশনের গর্জিয়াস থ্রি-পিস সেট।</p>",
      categoryId: subEmbroidered.id,
      brandId: brandKinenao.id,
      price: 3200.0,
      discountPrice: 2290.0,
      stockQty: 60,
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      thumbnail: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
      ],
      videoUrl: sampleVideoUrl2,
      variants: {
        create: [
          { name: "Deep Maroon (মেরুন)", colorName: "Maroon", colorCode: "#831843", sku: "THR-EMB-003-MRN", price: 2290.0, stockQty: 20, sortOrder: 1 },
          { name: "Navy Blue (নেভি ব্লু)", colorName: "Navy", colorCode: "#1E3A8A", sku: "THR-EMB-003-NVY", price: 2290.0, stockQty: 25, sortOrder: 2 },
          { name: "Teal Green", colorName: "Teal", colorCode: "#0F766E", sku: "THR-EMB-003-TEL", price: 2290.0, stockQty: 15, sortOrder: 3 },
        ],
      },
    },
  });

  // Product 6: Matte Liquid Lipstick
  await prisma.product.create({
    data: {
      name: "Long Lasting Waterproof Matte Liquid Lipstick Set",
      slug: "long-lasting-waterproof-matte-liquid-lipstick-set",
      sku: "BEA-LIP-005",
      description: "<h3>ওয়াটারপ্রুফ ম্যাট লিকুইড লিপস্টিক</h3><p>১৬ ঘন্টা দীর্ঘস্থায়ী প্রিমিয়াম কালার পিগমেন্টেশন। ঠোঁটকে রাখে মসৃণ।</p>",
      categoryId: subLipsticks.id,
      brandId: brandKinenao.id,
      price: 1200.0,
      discountPrice: 850.0,
      stockQty: 75,
      isActive: true,
      isFeatured: true,
      customBadge: "💄 Matte Look",
      thumbnail: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop",
      ],
      variants: {
        create: [
          { name: "Nude Velvet", colorName: "Nude", colorCode: "#BE7B72", sku: "BEA-LIP-005-NUD", price: 850.0, stockQty: 25, sortOrder: 1 },
          { name: "Ruby Glam", colorName: "Ruby Red", colorCode: "#991B1B", sku: "BEA-LIP-005-RUB", price: 850.0, stockQty: 30, sortOrder: 2 },
          { name: "Berry Plum", colorName: "Berry", colorCode: "#581C87", sku: "BEA-LIP-005-BER", price: 850.0, stockQty: 20, sortOrder: 3 },
        ],
      },
    },
  });

  // Product 7: Leather Handbag
  await prisma.product.create({
    data: {
      name: "Luxury Leather Handbag with Shoulder Strap",
      slug: "luxury-leather-handbag-shoulder-strap",
      sku: "BAG-LTH-005",
      description: "<h3>প্রিমিয়াম লেদার হ্যান্ডব্যাগ</h3><p>উন্নত মানের পিইউ লেদার ও ওয়াটারপ্রুফ ইনার লাইনিং দিয়ে তৈরি স্টাইলিশ ব্যাগ।</p>",
      categoryId: subLeatherBags.id,
      brandId: brandKinenao.id,
      price: 2800.0,
      discountPrice: 1950.0,
      stockQty: 45,
      isActive: true,
      isFeatured: true,
      customBadge: "✨ New Style",
      thumbnail: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
      ],
      variants: {
        create: [
          { name: "Classic Black", colorName: "Black", colorCode: "#111827", sku: "BAG-LTH-005-BLK", price: 1950.0, stockQty: 25, sortOrder: 1 },
          { name: "Tan Brown", colorName: "Brown", colorCode: "#78350F", sku: "BAG-LTH-005-BRN", price: 1950.0, stockQty: 20, sortOrder: 2 },
        ],
      },
    },
  });

  // Product 8: Gold Plated Bridal Jewellery Set
  await prisma.product.create({
    data: {
      name: "Traditional Gold Plated Bridal Jewellery Set",
      slug: "traditional-gold-plated-bridal-jewellery-set",
      sku: "JWL-SET-002",
      description: "<h3>রয়্যাল গোল্ড প্লেটেড জুয়েলারি সেট</h3><p>নেকলেস, কানের দুল ও টিকলিসহ সম্পূর্ণ জমকালো সেট। দীর্ঘস্থায়ী কালার গ্যারান্টি।</p>",
      categoryId: subBridalSets.id,
      brandId: brandHeritage.id,
      price: 3500.0,
      discountPrice: 2450.0,
      stockQty: 30,
      isActive: true,
      isFeatured: true,
      customBadge: "👑 Bridal Choice",
      thumbnail: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
      ],
    },
  });

  // Product 9: Educational Kids Toy
  await prisma.product.create({
    data: {
      name: "Kids Wooden Educational Learning Block Set",
      slug: "kids-wooden-educational-learning-block-set",
      sku: "KID-TOY-007",
      description: "<h3>বাচ্চাদের শিক্ষণীয় কাঠের ব্লক খেলনা</h3><p>শিশুর মেধার বিকাশ ও রঙের পরিচিতির জন্য নিরাপদ কাঠের তৈরি ব্লক সেট।</p>",
      categoryId: subEducationalToys.id,
      price: 1100.0,
      discountPrice: 790.0,
      stockQty: 50,
      isActive: true,
      isFeatured: true,
      thumbnail: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop",
      ],
    },
  });

  // Product 10: Luxury Ladies Watch
  await prisma.product.create({
    data: {
      name: "Rose Gold Stainless Steel Luxury Ladies Watch",
      slug: "rose-gold-stainless-steel-luxury-ladies-watch",
      sku: "WAT-ROSE-009",
      description: "<h3>রোজ গোল্ড লাক্সারি লেডিস ঘড়ি</h3><p>জাপানিজ কোয়ার্টজ মুভমেন্ট, স্ক্র্যাচ-প্রুফ গ্লাস ও ওয়াটার রেজিস্ট্যান্ট।</p>",
      categoryId: subLadiesWatches.id,
      price: 2400.0,
      discountPrice: 1650.0,
      stockQty: 40,
      isActive: true,
      isFeatured: true,
      thumbnail: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop",
      ],
      variants: {
        create: [
          { name: "Rose Gold", colorName: "Rose Gold", colorCode: "#E0A96D", sku: "WAT-ROSE-009-RSG", price: 1650.0, stockQty: 25, sortOrder: 1 },
          { name: "Silver Metal", colorName: "Silver", colorCode: "#9CA3AF", sku: "WAT-ROSE-009-SLV", price: 1650.0, stockQty: 15, sortOrder: 2 },
        ],
      },
    },
  });

  // Product 11: Fresh Fuji Apples
  await prisma.product.create({
    data: {
      name: "Fresh Sweet Fuji Apples (তাজা মিষ্টি ফুজি আপেল)",
      slug: "fresh-sweet-fuji-apples-1kg",
      sku: "FRT-APP-001",
      description: "<h3>তাজা ফুজি আপেল (১ কেজি)</h3><p>১০০% ফরমালিনমুক্ত, মিষ্টি ও রসালো প্রিমিয়াম কোয়ালিটি ফুজি আপেল। প্রতিদিন তাজা স্টক সংগ্রহ করা হয়।</p>",
      categoryId: subFreshFruits.id,
      brandId: brandNature.id,
      price: 320.0,
      discountPrice: 280.0,
      weight: 1,
      unit: "kg",
      stockQty: 80,
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      customBadge: "🍎 ১০০% ফ্রেশ",
      thumbnail: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=800&auto=format&fit=crop",
      ],
    },
  });

  // Product 12: Rajshahi Himsagar Mango
  await prisma.product.create({
    data: {
      name: "Premium Rajshahi Himsagar Mango (হিমসাগর আম)",
      slug: "premium-rajshahi-himsagar-mango-5kg",
      sku: "FRT-MNG-002",
      description: "<h3>রাজশাহীর বিখ্যাত হিমসাগর আম (৫ কেজি)</h3><p>গাছপাকা, রাসায়নিক ও কার্বাইড মুক্ত সুস্বাদু সুবাসিত হিমসাগর আম সরাসরি বাগান থেকে প্যাকিং।</p>",
      categoryId: subFreshFruits.id,
      brandId: brandNature.id,
      price: 650.0,
      discountPrice: 550.0,
      weight: 5,
      unit: "kg",
      stockQty: 60,
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      customBadge: "🥭 রাজশাহীর আম",
      thumbnail: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop",
      ],
    },
  });

  // Product 13: Fresh Red Tomatoes
  await prisma.product.create({
    data: {
      name: "Farm Fresh Red Tomatoes (দেশি পাকা টমেটো)",
      slug: "farm-fresh-red-tomatoes-1kg",
      sku: "VEG-TOM-001",
      description: "<h3>দেশি খামারের তাজা লাল টমেটো (১ কেজি)</h3><p>সম্পূর্ণ অর্গানিক উপায়ে উৎপাদিত রসালো টমেটো। সালাদ ও রান্নার জন্য পারফেক্ট।</p>",
      categoryId: subFreshVeg.id,
      brandId: brandNature.id,
      price: 90.0,
      discountPrice: 75.0,
      weight: 1,
      unit: "kg",
      stockQty: 100,
      isActive: true,
      isFeatured: false,
      isBestSeller: true,
      customBadge: "🍅 খামার ফ্রেশ",
      thumbnail: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop",
      ],
    },
  });

  // Product 14: Organic Green Spinach
  await prisma.product.create({
    data: {
      name: "Organic Green Spinach (তাজা সবুজ পালং শাক)",
      slug: "organic-green-spinach-bundle",
      sku: "VEG-SPN-002",
      description: "<h3>অর্গানিক সবুজ পালং শাক (১ আঁটি)</h3><p>পুষ্টিগুণে ভরপুর কীটনাশকমুক্ত তাজা পালং শাক। প্রতিদিন ভোরে জমি থেকে তোলা।</p>",
      categoryId: subFreshVeg.id,
      brandId: brandNature.id,
      price: 45.0,
      discountPrice: 35.0,
      weight: 1,
      unit: "bundle",
      stockQty: 50,
      isActive: true,
      isFeatured: false,
      isBestSeller: true,
      customBadge: "🥬 অর্গানিক শাক",
      thumbnail: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=800&auto=format&fit=crop",
      ],
    },
  });

  // Product 15: Crisp Green Lettuce Salad Mix
  await prisma.product.create({
    data: {
      name: "Crisp Green Lettuce & Salad Mix (লেটুস ও সালাদ মিক্স)",
      slug: "crisp-green-lettuce-salad-mix",
      sku: "SLD-LET-001",
      description: "<h3>ফ্রেশ লেটুস পাতা ও প্রিমিয়াম সালাদ বক্স</h3><p>হাইড্রোফোনিক পদ্ধতিতে চাষ করা স্বাস্থ্যকর কুঁচকানো লেটুস ও পুদিনা পাতার ফ্রেশ মিক্স।</p>",
      categoryId: subOrganicSalad.id,
      brandId: brandNature.id,
      price: 120.0,
      discountPrice: 95.0,
      weight: 250,
      unit: "gm",
      stockQty: 45,
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      customBadge: "🥗 ফ্রেশ সালাদ",
      thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
      ],
    },
  });

  // Product 16: California Roasted Almonds
  await prisma.product.create({
    data: {
      name: "California Roasted Almonds (আমন্ড বাদাম)",
      slug: "california-roasted-almonds-500g",
      sku: "NUT-ALM-001",
      description: "<h3>ক্যালিফোর্নিয়া রোস্টেড আমন্ড বাদাম (৫০০ গ্রাম)</h3><p>পুষ্টিগুণ ও এনার্জিতে ভরপুর ক্রিস্পি আমন্ড। ১০০% আসল ও প্রিমিয়াম গ্রেড।</p>",
      categoryId: subDryFruits.id,
      brandId: brandNature.id,
      price: 750.0,
      discountPrice: 620.0,
      weight: 500,
      unit: "gm",
      stockQty: 60,
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      customBadge: "🌰 প্রিমিয়াম নাটস",
      thumbnail: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=800&auto=format&fit=crop",
      ],
    },
  });

  // 8. Create Active Coupon
  await prisma.coupon.create({
    data: {
      code: "KINENAO50",
      type: CouponType.FIXED,
      value: 50.0,
      minPurchase: 1000.0,
      usageLimit: 500,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // 9. Create Hero Banners in DB
  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
      {
        title: "১০০% খাঁটি ও প্রিমিয়াম কালেকশন",
        subtitle: "সারা দেশে ক্যাশ অন ডেলিভারি সহ ঘরে বসেই কেনাকাটা করুন সেরা দামে।",
        imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
        linkUrl: "/shop",
        isActive: true,
        sortOrder: 1,
      },
      {
        title: "তাজা ফল ও অর্গানিক শাকসবজি",
        subtitle: "ফরমালিনমুক্ত তাজা ফলের সমাহার সরাসরি বাগান থেকে আপনার দোরগোড়ায়।",
        imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1200&auto=format&fit=crop",
        linkUrl: "/category/fruits-vegetables",
        isActive: true,
        sortOrder: 2,
      },
      {
        title: "প্রিমিয়াম ফ্যাশন ও কসমেটিক্স",
        subtitle: "নতুন ডিজাইনের এক্সক্লুসিভ কালেকশনে উপভোগ করুন আকর্ষণীয় ছাড়।",
        imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop",
        linkUrl: "/category/beauty-cosmetics",
        isActive: true,
        sortOrder: 3,
      },
    ],
  });

  // 10. Create FAQs in DB
  await prisma.fAQ.deleteMany({});
  await prisma.fAQ.createMany({
    data: [
      {
        question: "অর্ডার ডেলিভারি হতে কত দিন সময় লাগে?",
        answer: "ঢাকার ভেতরে ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২-৩ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।",
        isActive: true,
        sortOrder: 1,
      },
      {
        question: "পণ্য হাতে পেয়ে চেক করে কি মূল্য পরিশোধ করা যাবে?",
        answer: "হ্যাঁ, আমাদের সব অর্ডারে ১০০% ক্যাশ অন হোম ডেলিভারি সুবিধা রয়েছে। আপনি ডেলিভারিম্যানের সামনে পণ্য চেক করে নিতে পারবেন।",
        isActive: true,
        sortOrder: 2,
      },
      {
        question: "পণ্য পছন্দ না হলে কি রিটার্ন করা সম্ভব?",
        answer: "হ্যাঁ, ডেলিভারি পাওয়ার ৭ দিনের মধ্যে যেকোনো ত্রুটিযুক্ত বা অপ্রত্যাশিত পণ্য সহজে রিটার্ন বা এক্সচেঞ্জ করতে পারবেন।",
        isActive: true,
        sortOrder: 3,
      },
    ],
  });

  // 11. Create Testimonials in DB
  await prisma.testimonial.deleteMany({});
  await prisma.testimonial.createMany({
    data: [
      {
        customerName: "তানজিলা আহমেদ",
        message: "কিনেনাও থেকে কেনা ফলমূল ও শাকসবজি অত্যন্ত তাজা ও ভালো মানের ছিল। ডেলিভারিও খুব দ্রুত পেয়েছি।",
        rating: 5,
        isActive: true,
        sortOrder: 1,
      },
      {
        customerName: "মাহমুদুর রহমান",
        message: "অর্ডার করার পরদিনই ঢাকার ভিতরে ডেলিভারি পেয়েছি। পণ্যের প্যাকেজিং অসাধারণ ছিল!",
        rating: 5,
        isActive: true,
        sortOrder: 2,
      },
      {
        customerName: "সুমাইয়া জান্নাত",
        message: "ক্যাশ অন ডেলিভারিতে চেক করে নিতে পেরেছি। ১০০% আসল ও নির্ভরযোগ্য স্টোর।",
        rating: 5,
        isActive: true,
        sortOrder: 3,
      },
    ],
  });

  console.log("Coupons, Banners, FAQs, and Testimonials created.");
  console.log("Database successfully seeded with complete Kinenao catalog!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
