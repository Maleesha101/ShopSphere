// Lab Error Route for ShopSphere
// SM-05: Error disclosure endpoint exposed only in vulnerable mode
// Intentionally triggers a controlled exception to demonstrate verbose error output

import { Router } from "express";

const router = Router();

/**
 * GET /api/lab/error
 *
 * Intentionally triggers a controlled exception.
 * Vulnerable mode: returns full stack trace (SM-05).
 * Hardened mode: returns generic error message.
 */
router.get("/error", (req, res) => {
  if (req.app.get("labMode") !== "vulnerable") {
    // Even in hardened mode, the endpoint exists but returns generic error
    // However, the error handler would mask it
  }

  // Intentionally create an error to demonstrate verbose error disclosure
  const errorMessage = new Error("Intentional lab error for demonstration purposes");
  errorMessage.name = "TypeError";
  errorMessage.stack = `TypeError: Cannot read properties of undefined (reading 'id')
    at Module.<anonymous> (/app/src/routes/lab.ts:27:15)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
    at next (/app/node_modules/express/lib/router/route.js:144:13)
    at Route.dispatch (/app/node_modules/express/lib/router/route.js:114:3)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
    at /app/node_modules/express/lib/router/index.js:284:15
    at Function.process_params (/app/node_modules/express/lib/router/index.js:346:12)
    at next (/app/node_modules/express/lib/router/index.js:280:10)
    at jsonParser (/app/node_modules/body-parser/lib/types/json.js:113:7)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
    at trim_body (/app/node_modules/express/lib/router/layer.js:336:14)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
    at /app/node_modules/express/lib/router/index.js:284:15`;

  // This error will be caught by the errorHandler middleware
  // In vulnerable mode, it exposes full stack trace
  // In hardened mode, it returns generic error
  const err = errorMessage as any;
  err.statusCode = 500;
  throw err;
});

/**
 * GET /api/lab/slow
 *
 * Simulates a slow endpoint for demonstration purposes.
 */
router.get("/slow", async (req, res) => {
  // Simulate slow processing
  await new Promise((resolve) => setTimeout(resolve, 2000));
  res.status(200).json({
    success: true,
    message: "Slow endpoint completed",
    labMode: process.env.LAB_MODE || "vulnerable",
  });
});

export default router;
