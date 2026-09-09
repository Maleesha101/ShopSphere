# ShopSphere Testing Guide

Complete testing instructions for the ShopSphere security lab.

**⚠️ WARNING: This application is intentionally vulnerable for educational purposes only.**

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Starting the Lab](#starting-the-lab)
- [Lab 1 - Missing Security Headers](#lab-1---missing-security-headers)
- [Lab 2 - Weak CORS](#lab-2---weak-cors)
- [Lab 3 - Missing TLS/HTTP](#lab-3---missing-tlshttp)
- [Lab 4 - Unnecessary HTTP Methods](#lab-4---unnecessary-http-methods)
- [Lab 5 - Verbose Error Messages](#lab-5---verbose-error-messages)
- [Lab 6 - Debug Endpoint](#lab-6---debug-endpoint)
- [Lab 7 - Public Object Storage](#lab-7---public-object-storage)
- [Lab 8 - Outdated Dependency](#lab-8---outdated-dependency)
- [Lab 9 - Weak Server Hardening](#lab-9---weak-server-hardening)
- [Lab 10 - Excessive Permissions](#lab-10---excessive-permissions)
- [Burp Suite Testing](#burp-suite-testing)
- [OWASP ZAP Testing](#owasp-zap-testing)
- [Testing Checklist](#testing-checklist)

---

## Prerequisites

- Docker
- Docker Compose
- Git
- curl
- Browser
- Optional: Burp Suite, OWASP ZAP

---

## Starting the Lab

### Vulnerable Mode

```bash
make up
# or
LAB_MODE=vulnerable docker compose up --build -d
```

### Hardened Mode

```bash
make up-hardened
# or
LAB_MODE=hardened docker compose up --build -d
```

### Reset

```bash
make reset
```

---

## Lab 1 - Missing Security Headers

### Objective

Understand the importance of security headers in preventing common web vulnerabilities.

### Background

Security headers are HTTP response headers that help protect against common attacks like XSS, clickjacking, MIME sniffing, and downgrade attacks.

### Vulnerable Configuration

Nginx and Express are configured without security headers.

### Test

```bash
curl -I http://localhost:8080
```

### Expected Result

No security headers present in the response.

### Why It Matters

- Missing `X-Content-Type-Options` allows MIME sniffing attacks
- Missing `X-Frame-Options` allows clickjacking
- Missing `Content-Security-Policy` enables XSS
- Missing `Strict-Transport-Security` allows SSL stripping

### Remediation

Configure security headers in Nginx or Express.

### Retest

```bash
curl -I http://localhost:8080
```

Expected: All security headers present (`Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`).

---

## Lab 2 - Weak CORS Configuration

### Objective

Understand the risks of overly permissive CORS policies.

### Background

CORS (Cross-Origin Resource Sharing) controls which domains can access the API. A wildcard `*` allows any domain to make requests.

### Vulnerable Configuration

Express configured with `origin: "*"` (allows all origins).

### Test

```bash
curl -i \
  -H "Origin: http://evil.example.local" \
  http://localhost:8080/api/products
```

### Expected Result

Response includes `Access-Control-Allow-Origin: *`.

### Why It Matters

An attacker can create a malicious website that reads sensitive data from the API via JavaScript.

### Remediation

Restrict CORS to trusted origins only.

### Retest

```bash
curl -i \
  -H "Origin: http://evil.example.local" \
  http://localhost:8080/api/products
```

Expected: No CORS headers or only for trusted origins.

---

## Lab 3 - Missing TLS/HTTP Only

### Objective

Understand the risks of unencrypted HTTP traffic.

### Background

HTTP sends data in plaintext, allowing attackers to intercept credentials, session tokens, and sensitive data.

### Vulnerable Configuration

Application only listens on HTTP (port 8080), no TLS/HTTPS.

### Test

```bash
curl -v http://localhost:8080
curl -vk https://localhost:8443
```

### Expected Result

HTTP works (vulnerable), HTTPS redirects or works (hardened).

### Why It Matters

- Man-in-the-middle attacks
- Credential theft
- Data interception
- Session hijacking

### Remediation

Enable HTTPS with a valid certificate.

### Retest

```bash
curl -vk https://localhost:8443
```

Expected: HTTPS connection successful.

---

## Lab 4 - Unnecessary HTTP Methods

### Objective

Understand the risks of accepting unnecessary HTTP methods.

### Background

HTTP methods like TRACE can be exploited for XST (Cross-Site Tracing) attacks. OPTIONS reveals API endpoints.

### Vulnerable Configuration

Nginx/Express accepts all HTTP methods (OPTIONS, TRACE, DELETE, PUT, PATCH).

### Test

```bash
curl -i -X OPTIONS http://localhost:8080/api/products
curl -i -X TRACE http://localhost:8080/api/products
```

### Expected Result

HTTP 200 with allow headers listing all methods (vulnerable).

### Why It Matters

- TRACE enables XST attacks
- OPTIONS reveals API structure
- DELETE/PUT allow unauthorized data modification

### Remediation

Disable unnecessary methods at the server level.

### Retest

```bash
curl -i -X TRACE http://localhost:8080/api/products
```

Expected: HTTP 405 Method Not Allowed (hardened).

---

## Lab 5 - Verbose Error / Stack Trace Disclosure

### Objective

Understand the risks of verbose error messages in production.

### Background

Stack traces reveal internal implementation details, file paths, framework versions, and database structure.

### Vulnerable Configuration

Express error handler returns full stack traces and internal details.

### Test

```bash
curl -i http://localhost:8080/api/lab/error
```

### Expected Result

HTTP 500 with stack trace, file path, and framework info.

### Why It Matters

- Reveals framework and version
- Discloses file paths
- Exposes internal structure
- Helps attackers find vulnerabilities

### Remediation

Return generic error messages in production; log details server-side only.

### Retest

```bash
curl -i http://localhost:8080/api/lab/error
```

Expected: Generic error message only, no stack trace.

---

## Lab 6 - Debug/Diagnostic Endpoint

### Objective

Understand the risks of exposing debug/info endpoints.

### Background

Debug endpoints reveal server configuration, database info, and internal infrastructure details.

### Vulnerable Configuration

`/api/debug/config` and `/api/debug/health` endpoints are accessible.

### Test

```bash
curl -i http://localhost:8080/api/debug/config
curl -i http://localhost:8080/api/debug/health
```

### Expected Result

HTTP 200 with configuration details including database host, environment, version.

### Why It Matters

- Discovers database host
- Reveals framework details
- Finds internal infrastructure
- Maps attack surface

### Remediation

Disable debug endpoints in production.

### Retest

```bash
curl -i http://localhost:8080/api/debug/config
```

Expected: HTTP 404.

---

## Lab 7 - Public Object Storage Permissions

### Objective

Understand the risks of overly permissive object storage access.

### Background

Cloud object storage should have proper access controls. Public access to private files is a common misconfiguration.

### Vulnerable Configuration

Private storage files accessible without authentication.

### Test

```bash
curl -i http://localhost:8080/api/storage/private/private-report.txt
```

### Expected Result

File content returned without authentication.

### Why It Matters

- Sensitive data exposure
- Compliance violations
- Unauthorized access to private reports

### Remediation

Require authentication and authorization for private files.

### Retest

```bash
curl -i http://localhost:8080/api/storage/private/private-report.txt
```

Expected: HTTP 401 or 403 (hardened).

---

## Lab 8 - Outdated / Vulnerable Dependency

### Objective

Understand the risks of using outdated dependencies with known vulnerabilities.

### Background

`lodash@4.17.15` has a known prototype pollution vulnerability (CVE-2019-10744).

### Vulnerable Configuration

Backend uses `lodash@4.17.15`.

### Test

```bash
cd backend && npm audit
```

### Expected Result

Vulnerability found in lodash@4.17.15.

### Why It Matters

Prototype pollution can lead to remote code execution, denial of service, data tampering, and privilege escalation.

### Remediation

Update lodash to a patched version.

### Retest

```bash
cd backend && npm audit
```

Expected: No lodash vulnerabilities.

---

## Lab 9 - Weak Server Hardening

### Objective

Understand the risks of weak server hardening configurations.

### Background

Server should hide version information, limit request sizes, and configure timeouts.

### Vulnerable Configuration

Nginx discloses server version, no request limits, no timeouts.

### Test

```bash
curl -I http://localhost:8080
```

### Expected Result

Server version disclosed in headers.

### Why It Matters

- Identifies server software and version
- Enables version-specific attacks
- Allows DoS with large requests
- Enables endpoint probing without limits

### Remediation

Hide server tokens, configure limits and timeouts.

### Retest

```bash
curl -I http://localhost:8080
```

Expected: No server version info.

---

## Lab 10 - Excessive Permissions

### Objective

Understand the risks of excessive permissions and authentication bypass.

### Background

Authentication middleware is permissive in vulnerable mode, allowing unauthenticated access to admin endpoints.

### Vulnerable Configuration

Authentication middleware allows access without valid tokens in vulnerable mode.

### Test

```bash
curl -i http://localhost:8080/api/admin/users
```

### Expected Result

User data returned without proper authentication.

### Why It Matters

- Unauthorized data access
- Privilege escalation
- Admin functionality accessible to anyone

### Remediation

Enforce authentication and authorization for all admin endpoints.

### Retest

```bash
curl -i http://localhost:8080/api/admin/users
```

Expected: HTTP 401 or 403 (hardened).

---

## Burp Suite Testing

### Setup

1. Open Burp Suite Community Edition
2. Go to Proxy → Options → Proxy Listeners
3. Add listener on port 8080 (or your configured proxy port)
4. Enable "Intercept is off" to allow traffic through

### Configure Browser

1. Set browser proxy to `localhost:8080`
2. Visit `http://localhost:8080`

### Testing Steps

1. **Browse ShopSphere** - Navigate through the application
2. **Capture Requests** - View intercepted requests in Burp
3. **Inspect Response Headers** - Check for security headers
4. **Modify Origin Header** - Add `Origin: http://evil.example.local` to CORS test
5. **Test HTTP Methods** - Use Repeater to test OPTIONS and TRACE
6. **Inspect Error Responses** - Visit `/api/lab/error` and view response
7. **Compare Vulnerable/Hardened** - Test both modes side by side

### Burp Suite Features

- **Proxy**: Intercept and inspect HTTP traffic
- **Repeater**: Modify and resend requests
- **Intruder**: Automated testing
- **Scanner**: Automated vulnerability scanning

---

## OWASP ZAP Testing

### Setup

1. Start OWASP ZAP
2. Go to Tools → Options → Local Proxies
3. Note the proxy port (default: 8080)

### Configure Target

1. Right-click in Sites tab → Add Context
2. Set target URL to `http://localhost:8080`
3. Add user credentials if needed

### Testing Steps

1. **Spider the Application** - Automated crawling
2. **Passive Scan** - Analyze traffic without modifying requests
3. **Active Scan** - Test for vulnerabilities (may break things)
4. **Inspect Security Headers** - Check response headers
5. **Inspect CORS Behavior** - Check CORS headers
6. **Review Error Messages** - Check error disclosure

### OWASP ZAP Features

- **Spider**: Automated crawling
- **Passive Scan**: Non-intrusive scanning
- **Active Scan**: Intrusive vulnerability testing
- **Alerts**: Vulnerability notifications
- **Reports**: Generate test reports

---

## Testing Checklist

- [ ] Missing security headers
- [ ] Weak CORS
- [ ] HTTP instead of HTTPS
- [ ] Unnecessary HTTP methods
- [ ] Verbose error messages
- [ ] Debug endpoint
- [ ] Public object storage
- [ ] Excessive permissions
- [ ] Outdated dependency
- [ ] Weak server hardening

---

## Quick Reference

### Vulnerable Mode Commands

```bash
# Start vulnerable mode
make up

# Test security headers
curl -I http://localhost:8080

# Test CORS
curl -i -H "Origin: http://evil.example.local" http://localhost:8080/api/products

# Test HTTP methods
curl -i -X OPTIONS http://localhost:8080/api/products
curl -i -X TRACE http://localhost:8080/api/products

# Test error disclosure
curl -i http://localhost:8080/api/lab/error

# Test debug endpoint
curl -i http://localhost:8080/api/debug/config

# Test storage
curl -i http://localhost:8080/api/storage/public/demo-report.txt
curl -i http://localhost:8080/api/storage/private/private-report.txt
```

### Hardened Mode Commands

```bash
# Start hardened mode
make up-hardened

# Test security headers
curl -I http://localhost:8080

# Test CORS
curl -i -H "Origin: http://evil.example.local" http://localhost:8080/api/products

# Test HTTP methods
curl -i -X TRACE http://localhost:8080/api/products

# Test error disclosure
curl -i http://localhost:8080/api/lab/error

# Test debug endpoint
curl -i http://localhost:8080/api/debug/config

# Test storage
curl -i http://localhost:8080/api/storage/private/private-report.txt
```