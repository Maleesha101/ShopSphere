// Seed Script for ShopSphere
// Creates synthetic demo users, products, and initial data
// All credentials are lab-specific and non-functional for real authentication

import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// LAB CREDENTIALS - NEVER USE IN PRODUCTION
// These are synthetic credentials for the security lab only
const CREDENTIALS = {
  customer: {
    email: "customer@example.local",
    password: "LAB-Customer-Password-123",
    firstName: "Test",
    lastName: "Customer",
    role: "customer",
  },
  admin: {
    email: "admin@example.local",
    password: "LAB-Admin-Password-123",
    firstName: "Test",
    lastName: "Admin",
    role: "admin",
  },
} as const;

// Sample products for the e-commerce platform
const products: Prisma.ProductCreateInput[] = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "Premium noise-cancelling wireless headphones with 30-hour battery life",
    price: 89.99,
    stock: 150,
    category: "electronics",
  },
  {
    name: "Organic Coffee Beans",
    description: "Single-origin Ethiopian coffee beans, medium roast, 1kg bag",
    price: 24.99,
    stock: 500,
    category: "food",
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with Cherry MX switches and aluminum frame",
    price: 149.99,
    stock: 75,
    category: "electronics",
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Double-walled insulated water bottle, 750ml, keeps drinks cold 24hrs",
    price: 29.99,
    stock: 200,
    category: "accessories",
  },
  {
    name: "Yoga Mat Premium",
    description: "Eco-friendly non-slip yoga mat with alignment guides, 6mm thick",
    price: 39.99,
    stock: 80,
    category: "fitness",
  },
  {
    name: "Desk Lamp LED",
    description: "Adjustable LED desk lamp with dimming and color temperature control",
    price: 45.99,
    stock: 120,
    category: "home",
  },
];

async function main(): Promise<void> {
  console.log("🌱 Starting ShopSphere seed...");

  // Clear existing data (reverse order due to foreign keys)
  await prisma.auditLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const customerPassword = await bcrypt.hash(CREDENTIALS.customer.password, 12);
  const adminPassword = await bcrypt.hash(CREDENTIALS.admin.password, 12);

  // Create demo users
  const customer = await prisma.user.create({
    data: {
      email: CREDENTIALS.customer.email,
      passwordHash: customerPassword,
      role: CREDENTIALS.customer.role,
      firstName: CREDENTIALS.customer.firstName,
      lastName: CREDENTIALS.customer.lastName,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: CREDENTIALS.admin.email,
      passwordHash: adminPassword,
      role: CREDENTIALS.admin.role,
      firstName: CREDENTIALS.admin.firstName,
      lastName: CREDENTIALS.admin.lastName,
    },
  });

  console.log(`✅ Created user: ${customer.email} (role: customer)`);
  console.log(`✅ Created user: ${admin.email} (role: admin)`);

  // Create sample products
  const createdProducts = await prisma.product.createMany({
    data: products,
  });

  console.log(`✅ Created ${createdProducts.count} products`);

  // Create audit log entry
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SEED_DATABASE",
    },
  });

  console.log("🌱 ShopSphere seed complete!");
  console.log("\n📝 Lab Credentials (SYNTHETIC):");
  console.log(`   Customer: ${CREDENTIALS.customer.email} / ${CREDENTIALS.customer.password}`);
  console.log(`   Admin:    ${CREDENTIALS.admin.email} / ${CREDENTIALS.admin.password}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });