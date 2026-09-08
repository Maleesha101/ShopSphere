// Health Check Route for ShopSphere
// Provides health status and basic service information

import { Request, Response } from "express";

/**
 * GET /api/health
 *
 * Health check endpoint that verifies service health.
 * Docker Compose health checks use this endpoint to verify service health.
 */
export default function healthRoute(req: Request, res: Response): void {
  res.status(200).json({
    status: "ok",
    service: "shopsphere-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}