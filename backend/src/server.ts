// Main Express server entry point
// Initializes Express app, middleware, routes, and starts the server

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/index";
import { prisma } from "./config/database";
import errorHandler from "./middleware/errorHandler";
import authMiddleware from "./middleware/auth";

// Routes
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";
import productsRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import ordersRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import storageRoutes from "./routes/storage";
import debugRoutes from "./routes/debug";
import labRoutes from "./routes/lab";
import { legacyConfig } from "./services/legacyConfig";
import bcrypt from "bcryptjs";

// Configure CORS based on LAB_MODE
const corsConfig = config.labMode === "vulnerable"
  ? { origin: "*", credentials: false }
  : { origin: ["http://localhost:5173", "http://localhost:8080", "http://localhost:8443"], credentials: true };

const app: Application = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply CORS with mode-specific configuration
app.use(cors(corsConfig as cors.CorsOptions));

// Apply security headers based on LAB_MODE
if (config.labMode === "hardened") {
  // SM-01: Security headers enabled in hardened mode
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        styleSrc: ["'self'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
        blockAllMixedContent: [],
      },
    },
    frameguard: { action: "sameorigin" },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }));
}

// Parse cookies
app.use(express.json({ limit: "10mb" }));

// Set lab mode on app for routes to access
app.set("labMode", config.labMode);

// Apply authentication middleware globally
app.use(authMiddleware);

// Application routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/storage", storageRoutes);

// LAB VULNERABILITIES - only exposed in vulnerable mode
if (config.labMode === "vulnerable") {
  // SM-06: Debug endpoint exposed in vulnerable mode
  app.use("/api/debug", debugRoutes);

  // SM-05: Error disclosure endpoint
  app.use("/api/lab", labRoutes);

  // SM-08: Legacy dependency usage
  legacyConfig.load();
}

// Error handling middleware
app.use(errorHandler as express.ErrorRequestHandler);

// Health check endpoint
app.get("/", async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      service: "shopsphere-api",
      labMode: config.labMode,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      service: "shopsphere-api",
      error: "Database connection failed",
    });
  }
});

// Start server
async function startServer(): Promise<void> {
  await initDatabase();

  app.listen(config.port, () => {
    console.log(`\n🚀 ShopSphere API running on port ${config.port}`);
    console.log(`📊 Lab Mode: ${config.labMode}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`\n📚 Lab Documentation:
   - Vulnerable mode: http://localhost:${config.port}/api/debug/config
   - Health check: http://localhost:${config.port}/
   - Browse Products: http://localhost:${config.port}/api/products`);
  });
}

// Initialize database connection
async function initDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    await seedDemoData();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

async function seedDemoData(): Promise<void> {
  const productCount = await prisma.product.count();
  if (productCount > 0) return;

  const customerPassword = await bcrypt.hash("LAB-Customer-Password-123", 12);
  const adminPassword = await bcrypt.hash("LAB-Admin-Password-123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.local" },
    update: {},
    create: {
      email: "admin@example.local",
      passwordHash: adminPassword,
      role: "admin",
      firstName: "Test",
      lastName: "Admin",
    },
  });
  await prisma.user.upsert({
    where: { email: "customer@example.local" },
    update: {},
    create: {
      email: "customer@example.local",
      passwordHash: customerPassword,
      role: "customer",
      firstName: "Test",
      lastName: "Customer",
    },
  });
  await prisma.product.createMany({
    data: [
      { name: "Wireless Bluetooth Headphones", description: "Premium noise-cancelling headphones with 30-hour battery life", price: 89.99, stock: 150, category: "electronics" },
      { name: "Organic Coffee Beans", description: "Single-origin Ethiopian beans, medium roast, 1kg bag", price: 24.99, stock: 500, category: "food" },
      { name: "Mechanical Keyboard", description: "RGB mechanical keyboard with tactile switches and aluminum frame", price: 149.99, stock: 75, category: "electronics" },
      { name: "Stainless Steel Water Bottle", description: "Double-walled insulated bottle, 750ml", price: 29.99, stock: 200, category: "accessories" },
      { name: "Yoga Mat Premium", description: "Eco-friendly non-slip mat with alignment guides", price: 39.99, stock: 80, category: "fitness" },
      { name: "Desk Lamp LED", description: "Adjustable lamp with dimming and color temperature control", price: 45.99, stock: 120, category: "home" },
    ],
  });
  await prisma.auditLog.create({ data: { userId: admin.id, action: "BOOTSTRAP_DATABASE" } });
  console.log("🌱 Demo users and products seeded");
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down gracefully...");
  await prisma.$disconnect();
  console.log("✅ ShopSphere API shutdown complete");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🔄 Shutting down gracefully...");
  await prisma.$disconnect();
  console.log("✅ ShopSphere API shutdown complete");
  process.exit(0);
});

// Start the application
if (require.main === module) {
  startServer().catch((error) => {
    console.error("❌ Failed to start ShopSphere API:", error);
    process.exit(1);
  });
}

export { app };
