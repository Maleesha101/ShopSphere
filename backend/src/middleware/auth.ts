// Authentication Middleware for ShopSphere
// Validates JWT tokens and attaches user context to requests

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index";

// Extend Express Request interface to include user data
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
    }

    interface Request {
      user?: User;
    }
  }
}

// JWT payload interface
interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

// JWT_SECRET is read from environment variables
// Never hardcode secrets in production
const JWT_SECRET = config.jwtSecret;

// LAB VULNERABILITY: SM-01
// In vulnerable mode, authentication middleware is permissive
// This allows unauthenticated access to some endpoints
// DO NOT use this permissive middleware in production
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Public storefront and session bootstrap endpoints do not require a token.
  const requestPath = req.originalUrl.split("?", 1)[0];
  if (
    requestPath === "/api/health" ||
    requestPath === "/api/lab/error" ||
    requestPath === "/api/auth/login" ||
    requestPath === "/api/products" ||
    requestPath.startsWith("/api/products/")
  ) {
    next();
    return;
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // In vulnerable mode, skip auth for some endpoints
      if (config.labMode === "vulnerable") {
        req.user = {
          id: 1,
          email: "customer@example.local",
          role: "customer",
        } as Express.User;
        next();
        return;
      } else {
        res.status(401).json({
          error: "No authorization token provided",
        });
        return;
      }
    }

    // Validate token format
    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Invalid token format. Expected: Bearer <token>",
      });
      return;
    }

    // Extract and verify JWT token
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      } as Express.User;
      next();
    } catch (jwtError) {
      res.status(401).json({
        error: "Invalid or expired token",
      });
      return;
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      error: "Authentication error",
    });
  }
};

// Role-based authorization middleware
// Ensures only authorized users can access admin endpoints
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

// Optional auth middleware - does not require authentication
// Used for endpoints that should work with or without auth
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      } as Express.User;
    }

    next();
  } catch (error) {
    // Token is optional - proceed without user context
    next();
  }
};

export default authMiddleware;