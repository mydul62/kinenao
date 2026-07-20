"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcryptjs"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not set in env variables");
}
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log("Seeding started...");
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
            email: "admin@grocery.com",
            password: adminPassword,
            role: client_1.Role.ADMIN,
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
            email: "manager@grocery.com",
            password: managerPassword,
            role: client_1.Role.MANAGER,
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
            email: "customer@grocery.com",
            password: customerPassword,
            role: client_1.Role.CUSTOMER,
            profile: {
                create: {
                    fullName: "John Doe",
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
            accountName: "Kinenao Grocery Shop",
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
            accountName: "Kinenao Grocery Shop",
            accountType: "Merchant",
            instructions: "Go to your Nagad app, select Payment, enter merchant account number (01800000001), type the amount, and write reference details.",
            logoUrl: "https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/nagad_logo.png",
            isActive: true,
        },
    });
    const bank = await prisma.paymentMethod.create({
        data: {
            name: "Bank Transfer",
            accountNumber: "1234567890",
            accountName: "Kinenao Grocery Ltd.",
            accountType: "Corporate Current Account",
            instructions: "Transfer the grand total to our bank account. Bank: Dutch-Bangla Bank, Branch: Uttara. Send screenshot of transfer receipt.",
            logoUrl: "https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/bank_logo.png",
            isActive: true,
        },
    });
    console.log("Payment Methods seeded.");
    // 5. Create Categories
    const groceries = await prisma.category.create({
        data: { name: "Groceries", slug: "groceries" },
    });
    const rice = await prisma.category.create({
        data: { name: "Rice", slug: "rice", parentId: groceries.id },
    });
    const oil = await prisma.category.create({
        data: { name: "Oil", slug: "oil", parentId: groceries.id },
    });
    const fruits = await prisma.category.create({
        data: { name: "Fruits", slug: "fruits" },
    });
    const vegetables = await prisma.category.create({
        data: { name: "Vegetables", slug: "vegetables" },
    });
    const dairy = await prisma.category.create({
        data: { name: "Dairy", slug: "dairy" },
    });
    const beverages = await prisma.category.create({
        data: { name: "Beverages", slug: "beverages" },
    });
    const snacks = await prisma.category.create({
        data: { name: "Snacks", slug: "snacks" },
    });
    console.log("Categories seeded.");
    // 6. Create Brands
    const pran = await prisma.brand.create({
        data: { name: "Pran", slug: "pran", logoUrl: "https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/pran.png" },
    });
    const radhuni = await prisma.brand.create({
        data: { name: "Radhuni", slug: "radhuni", logoUrl: "https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/radhuni.png" },
    });
    console.log("Brands seeded.");
    // 7. Create Products
    await prisma.product.create({
        data: {
            name: "Miniket Rice Premium",
            slug: "miniket-rice-premium",
            sku: "RICE-MIN-001",
            barcode: "8934567890123",
            description: "Premium Miniket Rice, sorted and polished for a fluffy white texture when cooked.",
            categoryId: rice.id,
            brandId: pran.id,
            price: 85.0,
            discountPrice: 80.0,
            weight: 5,
            unit: "kg",
            stockQty: 100,
            tags: "rice,groceries,miniket",
            isFeatured: true,
            isBestSeller: true,
            isActive: true,
            thumbnail: "https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/rice.png",
            images: ["https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/rice.png"],
            seoTitle: "Miniket Rice Premium 5kg - Buy Online",
            seoDescription: "Get premium Miniket rice online at best prices. Fast delivery inside Dhaka.",
        },
    });
    await prisma.product.create({
        data: {
            name: "Soyabean Oil",
            slug: "soyabean-oil-5l",
            sku: "OIL-SOY-005",
            barcode: "8934567890456",
            description: "Healthy and pure soyabean oil for your daily cooking needs.",
            categoryId: oil.id,
            brandId: pran.id,
            price: 820.0,
            discountPrice: 799.0,
            weight: 5,
            unit: "litre",
            stockQty: 50,
            tags: "oil,cooking oil,groceries",
            isFeatured: true,
            isBestSeller: true,
            isFlashSale: true,
            isActive: true,
            thumbnail: "https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/oil.png",
            images: ["https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/oil.png"],
        },
    });
    await prisma.product.create({
        data: {
            name: "Fresh Mango",
            slug: "fresh-mango-himshagor",
            sku: "FRU-MAN-002",
            description: "Sweet and juicy Himshagor mangoes, directly sourced from Rajshahi orchards.",
            categoryId: fruits.id,
            price: 150.0,
            weight: 1,
            unit: "kg",
            stockQty: 40,
            tags: "mango,fruits,fresh",
            isFeatured: true,
            isActive: true,
            thumbnail: "https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/mango.png",
            images: ["https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/mango.png"],
        },
    });
    console.log("Products seeded.");
    // 8. Create Coupons
    await prisma.coupon.create({
        data: {
            code: "SAVE10",
            type: client_1.CouponType.PERCENTAGE,
            value: 10.0,
            minPurchase: 500.0,
            usageLimit: 100,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
        },
    });
    await prisma.coupon.create({
        data: {
            code: "FREESHIP",
            type: client_1.CouponType.FREE_DELIVERY,
            value: 0.0,
            minPurchase: 1000.0,
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
                    title: "Fresh Groceries Delivered To Your Doorstep",
                    subtitle: "Get up to 30% discount on daily essential products.",
                    image: "https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/banner1.png",
                    link: "/catalog?category=groceries",
                },
                {
                    id: 2,
                    title: "Fresh Fruits & Organic Vegetables",
                    subtitle: "100% organic products sourced directly from farmers.",
                    image: "https://res.cloudinary.com/z80cuap2/image/upload/v1721495000/banner2.png",
                    link: "/catalog?category=fruits",
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
