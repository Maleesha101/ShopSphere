// Debug Route for ShopSphere
// SM-06: Debug endpoint exposed only in vulnerable mode
// Provides server configuration info (intentionally weak in vulnerable mode)

import { Router } from "express";
import { config } from "../config/index";

const router = Router();

/**
 * GET /api/debug/config
 *
 * Returns server configuration.
 * Vulnerable mode: exposes configuration details (SM-06).
 * Hardened mode: endpoint is completely disabled.
 */
router.get("/config", (req, res) => {
  if (config.labMode !== "vulnerable") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  // SM-06: Exposing configuration details
  // This reveals internal server configuration including database host
  res.status(200).json({
    environment: "development",
    database_host: "postgres",
    debug: true,
    version: "demo-version",
    lab_mode: config.labMode,
    server: "Express",
    framework: "Node.js",
    redis_enabled: true,
    cache_enabled: true,
    // NOTE: No real secrets, passwords, or tokens are exposed
    // Only synthetic configuration information is returned
  });
});

/**
 * GET /api/debug/health
 *
 * Debug health check with detailed diagnostics.
 * Vulnerable mode: exposes detailed diagnostics.
 */
router.get("/health", (req, res) => {
  if (config.labMode !== "vulnerable") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    labMode: config.labMode,
  });
});

export default router;
