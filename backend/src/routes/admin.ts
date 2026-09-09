// Admin Route for ShopSphere
// Handles admin-only endpoints for users, orders, and reports

import { Router } from "express";
import { prisma } from "../config/database.ts";
import { authorizeRoles } from "../middleware/auth.ts";

const router = Router();

// All admin routes require admin role
router.use(authorizeRoles("admin"));

/**
 * GET /api/admin/users
 *
 * Returns all users (admin only).
 */
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
      orderBy: { id: "asc" },
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Admin users route error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * GET /api/admin/orders
 *
 * Returns all orders (admin only).
 */
router.get("/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { orderItems: { include: { product: true } }, user: { select: { email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Admin orders route error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/**
 * GET /api/admin/reports
 *
 * Returns admin reports (admin only).
 */
router.get("/reports", async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalRevenue, recentOrders] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.findMany({
        include: { orderItems: { include: { product: true } }, user: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue: (totalRevenue._sum.total || 0),
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Admin reports route error:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

/**
 * GET /api/admin/storage
 *
 * Returns storage permissions overview (admin only).
 */
router.get("/storage", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        permissions: {
          public: "all (vulnerable) / authenticated (hardened)",
          private: "all (vulnerable) / authenticated only (hardened)",
          users: { customer: "READ own", admin: "ALL", service: "LIMITED" },
        },
      },
    });
  } catch (error) {
    console.error("Admin storage route error:", error);
    res.status(500).json({ error: "Failed to fetch storage info" });
  }
});

export default router;
