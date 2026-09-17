// Logger Utility for ShopSphere
// Provides structured logging for audit trail and debugging

import winston from "winston";
import { config } from "../config/index";

// Create logger instance
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "shopsphere-api" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          let output = `[${timestamp}] ${level}: ${message}`;
          if (Object.keys(meta).length > 0) {
            output += ` ${JSON.stringify(meta)}`;
          }
          return output;
        })
      ),
    }),
  ],
});

// Audit logger specifically for security-relevant actions
const auditLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export interface AuditLogEntry {
  userId?: number;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

export const audit = {
  log: async (entry: AuditLogEntry): Promise<void> => {
    auditLogger.info("Audit Log", {
      userId: entry.userId,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      metadata: entry.metadata,
    });
  },
};

export default logger;