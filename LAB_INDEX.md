# ShopSphere Lab Index

This file lists every intentionally vulnerable component in the ShopSphere security lab.

**⚠️ WARNING: This application is intentionally vulnerable for educational purposes only.**

---

## SM-01 - Missing Security Headers
**Component:** Nginx / Express

- Vulnerable: No security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Hardened: All security headers enabled
- Test: `curl -I http://localhost:8080`
- Docs: [docs/vulnerability-matrix.md](#sm-01-missing-security-headers)

## SM-02 - Weak CORS Configuration
**Component:** Express

- Vulnerable: `Access-Control-Allow-Origin: *` (allows any origin)
- Hardened: CORS restricted to `http://localhost:5173`, `http://localhost:8080`, `http://localhost:8443`
- Test: `curl -i -H "Origin: http://evil.example.local" http://localhost:8080/api/products`
- Docs: [docs/vulnerability-matrix.md](#sm-02-weak-cors-configuration)

## SM-03 - Missing TLS / HTTP Only
**Component:** Nginx

- Vulnerable: HTTP only, no TLS encryption
- Hardened: HTTPS on port 8443, HTTP→HTTPS redirect on port 8080
- Test: `curl -v http://localhost:8080` and `curl -vk https://localhost:8443`
- Docs: [docs/vulnerability-matrix.md](#sm-03-missing-tls--http-only)

## SM-04 - Unnecessary HTTP Methods
**Component:** Nginx / Express

- Vulnerable: OPTIONS, TRACE, DELETE, PUT all accepted
- Hardened: Only necessary methods allowed (GET, POST, OPTIONS); TRACE, DELETE blocked
- Test: `curl -i -X OPTIONS http://localhost:8080/api/products`
- Test: `curl -i -X TRACE http://localhost:8080/api/products`
- Docs: [docs/vulnerability-matrix.md](#sm-04-unnecessary-http-methods)

## SM-05 - Verbose Error / Stack Trace Disclosure
**Component:** Express

- Vulnerable: Full stack traces, file paths, framework versions exposed
- Hardened: Generic error message with request ID only
- Test: `curl -i http://localhost:8080/api/lab/error`
- Docs: [docs/vulnerability-matrix.md](#sm-05-verbose-error--stack-trace-disclosure)

## SM-06 - Debug/Diagnostic Endpoint
**Component:** Express

- Vulnerable: `/api/debug/config` and `/api/debug/health` exposed
- Hardened: Debug endpoints disabled (return 404)
- Test: `curl -i http://localhost:8080/api/debug/config`
- Docs: [docs/vulnerability-matrix.md](#sm-06-debugdiagnostic-endpoint)

## SM-07 - Public Object Storage Permissions
**Component:** Express

- Vulnerable: Private storage files accessible without authentication
- Hardened: Authentication and authorization required for private files
- Test: `curl -i http://localhost:8080/api/storage/private/private-report.txt`
- Docs: [docs/vulnerability-matrix.md](#sm-07-public-object-storage-permissions)

## SM-08 - Outdated / Vulnerable Dependency
**Component:** Backend

- Vulnerable: `lodash@4.17.15` with CVE-2019-10744 (prototype pollution)
- Hardened: `lodash@4.17.21` (patched version)
- Test: `cd backend && npm audit`
- Docs: [docs/vulnerability-matrix.md](#sm-08-outdated--vulnerable-dependency)

## SM-09 - Weak Server Hardening
**Component:** Nginx

- Vulnerable: Server version disclosed, no hidden headers, no request timeouts
- Hardened: Server tokens hidden, request size limits, timeouts configured
- Test: Inspect response headers for `Server` value
- Docs: [docs/vulnerability-matrix.md](#sm-09-weak-server-hardening)

## SM-10 - Excessive Permissions
**Component:** API / Database

- Vulnerable: Authentication bypass in vulnerable mode, admin endpoints accessible
- Hardened: Proper authentication and authorization for all admin endpoints
- Test: `curl -i http://localhost:8080/api/admin/users`
- Docs: [docs/vulnerability-matrix.md](#sm-10-excessive-permissions)

---

## Permissions Matrix

| Resource | Customer | Admin | Service |
|----------|----------|-------|---------|
| Public products | READ | READ | READ |
| Private reports | DENY | READ | READ |
| User records | OWN | ALL | LIMITED |
| Admin dashboard | DENY | ALL | DENY |
| Debug endpoints | DENY | DENY | DENY |

---

## Quick Start

```bash
# Start vulnerable mode
make up

# Test all vulnerabilities
curl -i http://localhost:8080/api/debug/config
curl -i -H "Origin: http://evil.example.local" http://localhost:8080/api/products
curl -i -X TRACE http://localhost:8080/api/products
curl -i http://localhost:8080/api/lab/error
curl -i http://localhost:8080/api/storage/private/private-report.txt

# Reset
make reset
```
