// Auth Route for ShopSphere
// Handles user login, token generation, and user profile

import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { compare } from "bcryptjs";
import { config } from "../config/index";

const router = Router();

/**
 * POST /api/auth/login
 *
 * User login endpoint.
 * Validates credentials and returns JWT token.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const passwordMatch = await compare(password, user.passwordHash);

    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

  } catch (error) {
    console.error("Auth route error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * GET /api/auth/me
 *
 * Returns the current authenticated user's profile.
 */
router.get("/me", async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ success: true, data: user });

  } catch (error) {
    console.error("Profile route error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;