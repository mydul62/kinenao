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
  console.log("Seeding premium cosmetics data...");

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

  const admin = await prisma.user.create({
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

  const manager = await prisma.user.create({
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

  const customer = await prisma.user.create({
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

  console.log("Users and Profiles seeded.");

  // 3. Create Delivery Zones
  const dhakaInside = await prisma.deliveryZone.create({
    data: {
      zoneName: "Dhaka Inside",
      charge: 60.0,
      estDeliveryTime: "1-2 Days",
    },
  });

  const dhakaOutside = await prisma.deliveryZone.create({
    data: {
      zoneName: "Dhaka Outside",
      charge: 120.0,
      estDeliveryTime: "3-5 Days",
    },
  });

  console.log("Delivery Zones seeded.");

  // 4. Create Payment Methods
  const bkash = await prisma.paymentMethod.create({
    data: {
      name: "bKash",
      accountNumber: "01700000001",
      accountName: "KineNao Beauty Shop",
      accountType: "Merchant",
      instructions: "Go to your bKash app, select Payment, enter merchant account number (01700000001), type the amount, and use your order number as reference.",
      logoUrl: "https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/bkash_logo.png",
      isActive: true,
    },
  });

  const nagad = await prisma.paymentMethod.create({
    data: {
      name: "Nagad",
      accountNumber: "01800000001",
      accountName: "KineNao Beauty Shop",
      accountType: "Merchant",
      instructions: "Go to your Nagad app, select Payment, enter merchant account number (01800000001), type the amount, and write reference details.",
      logoUrl: "https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/nagad_logo.png",
      isActive: true,
    },
  });

  const cod = await prisma.paymentMethod.create({
    data: {
      name: "Cash on Delivery",
      accountNumber: "COD",
      accountName: "COD",
      accountType: "COD",
      instructions: "Pay with cash upon receiving your delivery at your doorstep. No prepayment or txnId is required.",
      logoUrl: "",
      isActive: true,
    },
  });

  console.log("Payment Methods seeded.");

  // 5. Create Categories
  const skincare = await prisma.category.create({
    data: { name: "Skincare", slug: "skincare" },
  });
  const makeup = await prisma.category.create({
    data: { name: "Makeup", slug: "makeup" },
  });
  const lipsticks = await prisma.category.create({
    data: { name: "Lipsticks", slug: "lipsticks", parentId: makeup.id },
  });
  const foundations = await prisma.category.create({
    data: { name: "Foundations", slug: "foundations", parentId: makeup.id },
  });
  const concealers = await prisma.category.create({
    data: { name: "Concealers", slug: "concealers", parentId: makeup.id },
  });
  const eyeliners = await prisma.category.create({
    data: { name: "Eyeliners", slug: "eyeliners", parentId: makeup.id },
  });
  const mascaras = await prisma.category.create({
    data: { name: "Mascaras", slug: "mascaras", parentId: makeup.id },
  });
  const blush = await prisma.category.create({
    data: { name: "Blush", slug: "blush", parentId: makeup.id },
  });
  const perfumes = await prisma.category.create({
    data: { name: "Perfumes", slug: "perfumes" },
  });
  const haircare = await prisma.category.create({
    data: { name: "Hair Care", slug: "hair-care" },
  });
  const beautytools = await prisma.category.create({
    data: { name: "Beauty Tools", slug: "beauty-tools" },
  });
  const nailcare = await prisma.category.create({
    data: { name: "Nail Care", slug: "nail-care" },
  });

  console.log("Categories seeded.");

  // 6. Create Brands
  const chanel = await prisma.brand.create({
    data: { name: "Chanel", slug: "chanel", logoUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=200&auto=format&fit=crop" },
  });
  const dior = await prisma.brand.create({
    data: { name: "Dior", slug: "dior", logoUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=200&auto=format&fit=crop" },
  });
  const mac = await prisma.brand.create({
    data: { name: "MAC Cosmetics", slug: "mac", logoUrl: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?q=80&w=200&auto=format&fit=crop" },
  });
  const fenty = await prisma.brand.create({
    data: { name: "Fenty Beauty", slug: "fenty", logoUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200&auto=format&fit=crop" },
  });
  const estee = await prisma.brand.create({
    data: { name: "Estée Lauder", slug: "estee-lauder", logoUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=200&auto=format&fit=crop" },
  });
  const loreal = await prisma.brand.create({
    data: { name: "L'Oréal", slug: "loreal", logoUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200&auto=format&fit=crop" },
  });

  console.log("Brands seeded.");

  // 7. Create Products
  await prisma.product.create({
    data: {
      name: "MAC Matte Retro Lipstick - Ruby Woo",
      slug: "mac-matte-retro-ruby-woo",
      sku: "MAC-LIP-RWOO",
      barcode: "8934567890123",
      description: "Ruby Woo is a very matte vivid blue-red lipstick that features an intense color payoff. It is one of the most famous and iconic shades of red in the world, loved by celebrities and makeup artists alike for its universally flattering undertones.",
      categoryId: lipsticks.id,
      brandId: mac.id,
      price: 2450.0,
      discountPrice: 2200.0,
      weight: 3.0,
      unit: "g",
      stockQty: 85,
      tags: "lipstick,makeup,mac,red",
      isFeatured: true,
      isBestSeller: true,
      isActive: true,
      thumbnail: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop", "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?q=80&w=600&auto=format&fit=crop"],
      seoTitle: "MAC Matte Retro Ruby Woo Lipstick - Buy Authentic Online",
      seoDescription: "Shop authentic MAC Retro Matte Lipstick in Ruby Woo inside Bangladesh. Next-day delivery.",
    },
  });

  await prisma.product.create({
    data: {
      name: "Dior Addict Lip Glow - Pink Cherry",
      slug: "dior-addict-lip-glow-pink",
      sku: "DIOR-LIP-GLOW",
      barcode: "8934567890456",
      description: "The iconic Dior lip balm formulated with 97% natural-origin ingredients that subtly revives the natural color of lips with a custom glow for 6h and hydrates lips for 24h.",
      categoryId: lipsticks.id,
      brandId: dior.id,
      price: 4800.0,
      discountPrice: 4500.0,
      weight: 3.2,
      unit: "g",
      stockQty: 40,
      tags: "balm,dior,lipwear,makeup",
      isFeatured: true,
      isFlashSale: true,
      isActive: true,
      thumbnail: "https://images.unsplash.com/photo-1631730359575-38e4755d772b?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1631730359575-38e4755d772b?q=80&w=600&auto=format&fit=crop"],
    },
  });

  await prisma.product.create({
    data: {
      name: "Fenty Beauty Pro Filt'r Soft Matte Foundation",
      slug: "fenty-pro-filtr-soft-matte-foundation",
      sku: "FENTY-FND-MATTE",
      description: "A soft matte, longwear foundation with buildable, medium-to-full coverage, in a boundary-breaking range of 50 shades. Oil-free, sweat-resistant, and won't clog pores.",
      categoryId: foundations.id,
      brandId: fenty.id,
      price: 4200.0,
      discountPrice: 3900.0,
      weight: 32.0,
      unit: "ml",
      stockQty: 50,
      tags: "foundation,makeup,fenty,matte",
      isFeatured: true,
      isBestSeller: true,
      isActive: true,
      thumbnail: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop"],
    },
  });

  await prisma.product.create({
    data: {
      name: "Estée Lauder Advanced Night Repair Serum",
      slug: "estee-lauder-advanced-night-repair-serum",
      sku: "ESTEE-SRM-ANR",
      description: "Our #1 serum to help reduce the look of multiple signs of aging. Experience the next generation of our revolutionary formula. Fast penetrating, this serum reduces the look of multiple signs of aging caused by environmental assaults.",
      categoryId: skincare.id,
      brandId: estee.id,
      price: 8500.0,
      discountPrice: 7900.0,
      weight: 50.0,
      unit: "ml",
      stockQty: 30,
      tags: "serum,skincare,estee,anti-aging",
      isFeatured: true,
      isBestSeller: true,
      isActive: true,
      thumbnail: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop"],
    },
  });

  await prisma.product.create({
    data: {
      name: "Chanel No. 5 Eau de Parfum Spray",
      slug: "chanel-no-5-eau-de-parfum",
      sku: "CHANEL-PERF-NO5",
      description: "Since its creation in 1921, N°5 has expressed the very essence of femininity: an abstract, mysterious scent, alive with countless subtle facets, radiating an extravagant floral richness.",
      categoryId: perfumes.id,
      brandId: chanel.id,
      price: 16500.0,
      discountPrice: 15000.0,
      weight: 100.0,
      unit: "ml",
      stockQty: 15,
      tags: "perfume,fragrance,chanel,luxury",
      isFeatured: true,
      isBestSeller: true,
      isActive: true,
      thumbnail: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop"],
    },
  });

  console.log("Products seeded.");

  // 8. Create Coupons
  await prisma.coupon.create({
    data: {
      code: "BEAUTY10",
      type: CouponType.PERCENTAGE,
      value: 10.0,
      minPurchase: 1000.0,
      usageLimit: 100,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.coupon.create({
    data: {
      code: "FREESHIP",
      type: CouponType.FREE_DELIVERY,
      value: 0.0,
      minPurchase: 1500.0,
      usageLimit: 50,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Coupons seeded.");

  // 9. Homepage Configurations
  await prisma.homepageContent.create({
    data: {
      sectionKey: "hero_banners",
      value: [
        {
          id: 1,
          title: "Luxury Cosmetics & Premium Beauty",
          subtitle: "Discover high-end fragrances, skincare, and makeup collections.",
          image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop",
          link: "/shop?category=makeup",
        },
        {
          id: 2,
          title: "Revitalize Your Skincare Routine",
          subtitle: "Get up to 25% off on award-winning skincare solutions.",
          image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop",
          link: "/shop?category=skincare",
        },
      ],
    },
  });

  console.log("Homepage content seeded.");
  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
