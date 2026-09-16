// Main Express server entry point
// Initializes Express app, middleware, routes, and starts the server

import "reflect-metadata";
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
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
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
