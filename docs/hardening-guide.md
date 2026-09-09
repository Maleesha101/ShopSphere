# ShopSphere Hardening Guide

Before/after configurations for every intentional vulnerability in the ShopSphere security lab.

**⚠️ WARNING: This application is intentionally vulnerable for educational purposes only.**

---

## Table of Contents

- [SM-01 Security Headers](#sm-01-security-headers)
- [SM-02 CORS Configuration](#sm-02-cors-configuration)
- [SM-03 TLS/HTTPS](#sm-03-tlshttps)
- [SM-04 HTTP Methods](#sm-04-http-methods)
- [SM-05 Error Handling](#sm-05-error-handling)
- [SM-06 Debug Endpoint](#sm-06-debug-endpoint)
- [SM-07 Object Storage Permissions](#sm-07-object-storage-permissions)
- [SM-08 Dependency Management](#sm-08-dependency-management)
- [SM-09 Server Hardening](#sm-09-server-hardening)
- [SM-10 Permissions](#sm-10-permissions)

---

## SM-01: Security Headers

### Before (Vulnerable Mode)

```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
...
No security headers present
```

### After (Hardened Mode)

```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'none'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none'
```

### Nginx Configuration Example

```nginx
# Hardened security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Content-Security-Policy "default-src 'none'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none'" always;
```

### Express Configuration Example

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      styleSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
      blockAllMixedContent: [],
    },
  },
  frameGuard: { action: "ALLOWALL" },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});
```

---

## SM-02: CORS Configuration

### Before (Vulnerable Mode)

```javascript
// app.ts - Vulnerable CORS config
const corsConfig = { origin: "*", credentials: false };
```

### After (Hardened Mode)

```javascript
// app.ts - Hardened CORS config
const corsConfig = {
  origin: ["http://localhost:5173", "http://localhost:8080", "http://localhost:8443"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
```

### Nginx Configuration Example

```nginx
# Allowed origin for CORS
add_header Access-Control-Allow-Origin "http://localhost:5173" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
add_header Access-Control-Max-Age 86400 always;
```

---

## SM-03: TLS/HTTPS

### Before (Vulnerable Mode)

```
HTTP only on port 8080
No TLS encryption
```

### After (Hardened Mode)

```
Port 8080: HTTP → HTTPS redirect
Port 8443: HTTPS with self-signed dev certificate

# Nginx redirect
server {
    listen 8080;
    server_name localhost;
    return 301 https://$host:8443$request_uri;
}

# HTTPS server
server {
    listen 8443 ssl;
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
}
```

### Test

```bash
# HTTP should redirect to HTTPS
curl -I http://localhost:8080
# Expected: 301 redirect

# HTTPS should work (use -k for self-signed)
curl -vk https://localhost:8443
# Expected: 200 with SSL info
```

---

## SM-04: HTTP Methods

### Before (Vulnerable Mode)

```nginx
# OPTIONS and TRACE accepted
add_header Access-Control-Allow-Origin *;
```

### After (Hardened Mode)

```nginx
# Only allow necessary methods
if ($request_method !~ ^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)$ ) {
    return 405;
}

# OPTIONS for CORS preflight
if ($request_method = OPTIONS) {
    add_header Access-Control-Allow-Origin "http://localhost:5173";
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS";
    add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    add_header Access-Control-Max-Age 86400;
    return 204;
}
```

### Express Example

```javascript
// Only allow safe methods
const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

app.use((req, res, next) => {
  if (!allowedMethods.includes(req.method) && req.method !== 'OPTIONS') {
    res.setAlloweMethods(allowedMethods).status(405).end();
  } else {
    next();
  }
});
```

---

## SM-05: Error Handling

### Before (Vulnerable Mode)

```javascript
// Vulnerable error handler
if (config.labMode === "vulnerable") {
  res.status(statusCode).json({
    error: err.message,
    name: err.name,
    message: err.message,
    stack: err.stack,
    framework: "Express",
    version: "4.x",
    path: req.path,
    method: req.method,
    ip: req.ip,
    headers: { userAgent, accept },
  });
}
```

### After (Hardened Mode)

```javascript
// Hardened error handler
if (config.labMode === "hardened") {
  const requestId = req.headers["x-request-id"] as string || "unknown";

  res.status(statusCode).json({
    error: "Internal server error",
    requestId,
  });
}
```

### Logging (both modes)

```javascript
// Always log full error server-side
console.error("Hardened Error:", {
  requestId,
  message: err.message,
  stack: err.stack,
  path: req.path,
});
```

---

## SM-06: Debug Endpoint

### Before (Vulnerable Mode)

```javascript
// Debug endpoint available
router.get("/config", (req, res) => {
  res.json({
    environment: "development",
    database_host: "postgres",
    debug: true,
    version: "demo-version",
  });
});
```

### After (Hardened Mode)

```javascript
// Debug endpoint disabled entirely
// Request returns 404
router.get("/config", (req, res) => {
  res.status(404).json({ error: "Not found" });
});
```

---

## SM-07: Object Storage Permissions

### Before (Vulnerable Mode)

```javascript
// Private storage accessible without auth
if (config.labMode === "vulnerable") {
  // Read file regardless of user auth
}
```

### After (Hardened Mode)

```javascript
// Private storage requires admin auth
if (config.labMode === "hardened") {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  // Check user role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user?.role !== "admin") {
    res.status(403).json({ error: "Insufficient permissions" });
    return;
  }
}
```

---

## SM-08: Dependency Management

### Before (Vulnerable Mode)

```
# package.json
"lodash": "4.17.15"  // Has CVE-2019-10744 prototype pollution
```

### After (Hardened Mode)

```
# package.json
"lodash": "4.17.21"  // Patched version with CVE-2019-10744 fixed
```

### Update Commands

```bash
# Update lodash
npm install lodash@4.17.21

# Run security audit
npm audit

# Check for vulnerabilities
npx audit-ci  # or equivalent
```

---

## SM-09: Server Hardening

### Before (Vulnerable Mode)

```
# nginx.conf
# Server version disclosed
# No request limits
# No timeouts configured
```

### After (Hardened Mode)

```nginx
# nginx.conf - Hardened

# Hide server version
proxy_hide_header Server;
proxy_hide_header X-Powered-By;

# Request size limit
client_max_body_size 10m;

# Client request timeout
client_body_timeout 60s;
keepalive_timeout 65s;

# Connection limits
limit_conn addr 100;
limit_req zone=one burst=20;

# SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
```

---

## SM-10: Excessive Permissions

### Before (Vulnerable Mode)

```javascript
// authMiddleware - Vulnerable
export const authMiddleware = async (req, res, next) => {
  // Skip auth in vulnerable mode
  if (config.labMode === "vulnerable") {
    req.user = { id: 1, email: "customer@example.local", role: "customer" };
    next();  // No auth required!
  }
  // ... rest of middleware
};
```

### After (Hardened Mode)

```javascript
// authMiddleware - Hardened
export const authMiddleware = async (req, res, next) => {
  // Always require authentication
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Authorization token required" });
    return;
  }

  if (!authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Invalid token format" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (jwtError) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
};
```

### Role-Based Authorization

```javascript
// Express route with authorization
router.get("/admin/users", authorizeRoles("admin"), async (req, res) => {
  // Only admin role can access this
  // ...
});
```