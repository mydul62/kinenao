const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true }
  });
  console.log("USERS IN DATABASE:", JSON.stringify(users, null, 2));

  const orders = await prisma.order.findMany({
    select: { id: true, orderNumber: true, status: true, customerId: true, grandTotal: true, createdAt: true }
  });
  console.log("ORDERS IN DATABASE:", JSON.stringify(orders, null, 2));
}

check().then(() => prisma.$disconnect());
