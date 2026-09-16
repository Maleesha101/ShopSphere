// Storage Route for ShopSphere
// Simulates object storage with mode-dependent access control

import { Router } from "express";
import { prisma } from "../config/database";
import { config } from "../config/index";

const router = Router();

/**
 * GET /api/storage/public/:file
 *
 * Public storage access.
 * Vulnerable mode: accessible without authentication.
 * Hardened mode: requires authentication.
 */
router.get("/public/:file", async (req, res) => {
  try {
    const { file } = req.params;

    // In hardened mode, require authentication
    if (config.labMode === "hardened") {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: "Authentication required for private storage" });
        return;
      }
    }

    // Read from the simulated storage
    const fs = await import("fs");
    const path = require("path");
    const storagePath = path.join(__dirname, "../../../storage/public", file);

    if (!fs.existsSync(storagePath)) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const content = fs.readFileSync(storagePath, "utf-8");
    res.status(200).json({
      success: true,
      data: {
        fileName: file,
        content,
        access: "public",
        mode: config.labMode,
      },
    });
  } catch (error) {
    console.error("Storage route error:", error);
    res.status(500).json({ error: "Failed to access storage" });
  }
});

/**
 * GET /api/storage/private/:file
 *
 * Private storage access.
 * Vulnerable mode: accessible without authentication (SM-07).
 * Hardened mode: requires authentication and proper authorization.
 */
router.get("/private/:file", async (req, res) => {
  try {
    const { file } = req.params;

    // In vulnerable mode, allow access without authentication (SM-07)
    if (config.labMode === "vulnerable") {
      const fs = await import("fs");
      const path = require("path");
      const storagePath = path.join(__dirname, "../../../storage/private", file);

      if (!fs.existsSync(storagePath)) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      const content = fs.readFileSync(storagePath, "utf-8");
      res.status(200).json({
        success: true,
        data: {
          fileName: file,
          content,
          access: "public (VULNERABLE - private files exposed!)",
          mode: config.labMode,
        },
      });
      return;
    }

    // Hardened mode: require authentication
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Authentication required for private storage" });
      return;
    }

    const fs = await import("fs");
    const path = require("path");
    const storagePath = path.join(__dirname, "../../../storage/private", file);

    if (!fs.existsSync(storagePath)) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    // Check user permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Only admins can read private files in hardened mode
    if (user.role !== "admin") {
      res.status(403).json({ error: "Insufficient permissions for private storage" });
      return;
    }

    const content = fs.readFileSync(storagePath, "utf-8");
    res.status(200).json({
      success: true,
      data: {
        fileName: file,
        content,
        access: "private (authenticated + authorized)",
        mode: config.labMode,
      },
    });
  } catch (error) {
    console.error("Storage route error:", error);
    res.status(500).json({ error: "Failed to access storage" });
  }
});

export default router;
