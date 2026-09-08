// Orders Route for ShopSphere
// Handles order creation, retrieval, and management

import { Router } from "express";
import { prisma } from "../config/database.ts";

const router = Router();

/**
 * GET /api/orders
 *
 * Returns the current user's orders.
 */
router.get("/", async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error("Orders route error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/**
 * POST /api/orders
 *
 * Creates a new order from the current user's cart.
 */
router.post("/", async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    // Calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        total: parseFloat(total.toFixed(2)),
        status: "pending",
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price, // Price at time of purchase
          })),
        },
      },
      include: { orderItems: { include: { product: true } } },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    // Update product stock (already decremented in addToCart, but double-checking)
    // Actually, stock is decremented when item is added to cart in cart.ts

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: "ORDER_CREATED",
      },
    });

    res.status(201).json({
      success: true,
      data: order,
      message: "Order created successfully",
    });

  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

/**
 * GET /api/orders/:id
 *
 * Returns details for a specific order.
 */
router.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const orderId = Number(req.params.id);

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

export default router;