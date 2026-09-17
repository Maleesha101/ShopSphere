// Products Route for ShopSphere
// Handles product listing, details, and search

import { Router } from "express";
import { prisma } from "../config/database";

const router = Router();

/**
 * GET /api/products
 *
 * Returns a list of all products in the shop.
 * Supports optional category filtering and pagination.
 */
router.get("/", async (req, res) => {
  try {
    const { category, page = "1", limit = "10" } = req.query;

    const where = category ? { category: category as string } : undefined;
    const skip = (Number(page) - 1) * Number(limit);

    const products = await prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { id: "desc" },
    });

    const total = await prisma.product.count({ where });

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });

  } catch (error) {
    console.error("Products route error:", error);
    res.status(500).json({
      error: "Failed to fetch products",
    });
  }
});

/**
 * GET /api/products/:id
 *
 * Returns details for a specific product.
 */
router.get("/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (isNaN(productId)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });

  } catch (error) {
    console.error("Product detail route error:", error);
    res.status(500).json({
      error: "Failed to fetch product details",
    });
  }
});

export default router;