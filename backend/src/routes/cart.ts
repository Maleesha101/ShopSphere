// Cart Route for ShopSphere
// Handles shopping cart operations

import { Request, Response, Router } from "express";
import { prisma } from "../config/database";

const router = Router();

/**
 * GET /api/cart
 *
 * Returns the current user's cart items.
 */
export async function getCart(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { id: "asc" },
    });

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    res.status(200).json({
      success: true,
      data: cartItems,
      summary: {
        totalItems,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
      },
    });

  } catch (error) {
    console.error("Cart route error:", error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
}

/**
 * POST /api/cart
 *
 * Adds a product to the cart or updates quantity.
 */
export async function addToCart(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const { productId, quantity } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ error: "Insufficient stock" });
      return;
    }

    // Upsert cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId: Number(productId),
        },
      },
      update: { quantity: { increment: quantity } },
      create: {
        userId,
        productId: Number(productId),
        quantity,
      },
    });

    // Update stock
    await prisma.product.update({
      where: { id: Number(productId) },
      data: { stock: { decrement: quantity } },
    });

    res.status(200).json({
      success: true,
      data: cartItem,
      message: "Product added to cart",
    });

  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: "Failed to add to cart" });
  }
}

router.get("/", getCart);
router.post("/", addToCart);

export default router;