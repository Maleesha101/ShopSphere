// Error Handler Middleware for ShopSphere
// Provides mode-specific error responses based on LAB_MODE

import { Request, Response, NextFunction } from "express";
import { config } from "../config/index";

/**
 * LAB VULNERABILITY: SM-05
// In vulnerable mode, error handler exposes full stack traces,
// file paths, and internal framework information.
// In hardened mode, returns generic error response.
 */
export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Determine mode-specific error response
  const isVulnerable = config.labMode === "vulnerable";
  const statusCode = err.statusCode || 500;

  if (isVulnerable) {
    // SM-05 Vulnerable: Full error disclosure
    // This includes stack traces, file paths, and framework information
    // DO NOT use this in production - it reveals internal implementation details
    const errorResponse = {
      error: err.message || "Internal server error",
      name: err.name || "Error",
      message: err.message,
      stack: err.stack,
      // LAB INFO: Framework and environment details for debugging
      framework: "Express",
      version: "4.x",
      path: req.path,
      method: req.method,
      ip: req.ip,
      headers: {
        userAgent: req.get("User-Agent"),
        accept: req.get("Accept"),
      },
    };

    // Log the error to application logs (not exposed to client)
    console.error("🚨 Vulnerable Error:", {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    res.status(statusCode).json(errorResponse);
  } else {
    // SM-05 Hardened: Generic error response
    // Detailed errors are only logged server-side, never exposed to clients
    const requestId = req.headers["x-request-id"] as string || "unknown";

    const errorResponse = {
      error: "Internal server error",
      requestId,
    };

    // In production, you would log the full error to a logging system
    // e.g., winston, pino, elasticsearch, etc.
    console.error("🔒 Hardened Error:", {
      requestId,
      message: err.message,
      stack: err.stack,
      path: req.path,
    });

    res.status(statusCode).json(errorResponse);
  }
}