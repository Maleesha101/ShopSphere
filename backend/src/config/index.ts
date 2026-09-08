// Backend Configuration for ShopSphere
// Reads environment variables from .env and LAB_MODE from process.env

import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000"),
  jwtSecret: process.env.JWT_SECRET || "shopsphere-lab-jwt-secret-never-use-in-production",
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12"),
  labMode: process.env.LAB_MODE || "vulnerable",
  databaseUrl: process.env.DATABASE_URL,
};

export const mode = {
  isVulnerable: (): boolean => config.labMode === "vulnerable",
  isHardened: (): boolean => config.labMode === "hardened",
  corsConfig: (): object => {
    if (mode.isVulnerable()) {
      return {
        origin: "*",
        credentials: false,
      };
    } else {
      return {
        origin: ["http://localhost:5173", "http://localhost:8080", "http://localhost:8443"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      };
    }
  },
  securityHeaders: (): Record<string, string> => {
    if (mode.isVulnerable()) {
      return {};
    } else {
      return {
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
      };
    }
  },
  debugEndpoint: (): boolean => config.labMode === "vulnerable",
  errorHandler: (): object => {
    if (mode.isVulnerable()) {
      return { verbose: true, stackTrace: true };
    } else {
      return { verbose: false, stackTrace: false, requestId: true };
    }
  },
  storagePermissions: (): Record<string, string[]> => {
    if (mode.isVulnerable()) {
      return {
        public: ["all"],
        private: ["all"],
      };
    } else {
      return {
        public: ["all"],
        private: ["authenticated"],
      };
    }
  },
};

export default config;