# ShopSphere Security Misconfiguration Lab

A fully functional, local-only cybersecurity training lab for understanding Security Misconfiguration vulnerabilities (OWASP Top 10 - A05:2021).

## ⚠️ IMPORTANT SAFETY NOTICE

This application is **INTENTIONALLY VULNERABLE** for educational purposes only.

- Designed for **localhost/private lab use only**
- **NEVER** deploy to public cloud or internet
- Uses **synthetic/demo data only**
- Contains **lab credentials only** (not real passwords)
- **NOT** for production use

## 1. Learning Objectives

By completing this lab, students will learn:

- Security hardening principles
- Security misconfiguration (OWASP A05:2021)
- HTTP methods attack surface
- TLS/HTTPS importance
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- CORS misconfiguration risks
- Error disclosure and stack traces
- Cloud/IAM-style permissions
- Vulnerable vs hardened configuration comparison

## 2. Architecture

```
Browser
   |
   v
Nginx (Reverse Proxy)
   |
   v
Express API
   |
   +---- PostgreSQL
   |
   +---- Redis
   |
   +---- Local Object Storage
```

## 3. Prerequisites

- Docker
- Docker Compose
- Git
- curl
- Browser

Optional:
- Burp Suite Community Edition
- OWASP ZAP

## 4. Installation

```bash
git clone <repository>
cd shopsphere-security-lab
cp .env.example .env
```

## 5. Lab Credentials

**All credentials are synthetic/lab-only:**

| User | Email | Password |
|------|-------|----------|
| Customer | customer@example.local | LAB-Customer-Password-123 |
| Admin | admin@example.local | LAB-Admin-Password-123 |

## 6. Starting Vulnerable Mode

```bash
LAB_MODE=vulnerable docker compose up --build -d
```

Or simply:
```bash
make up
```

## 7. Starting Hardened Mode

```bash
LAB_MODE=hardened docker compose up --build -d
```

Or:
```bash
make up-hardened
```

## 8. Vulnerability List

| ID | Name | Component | Test |
|----|------|-----------|------|
| SM-01 | Missing Security Headers | Nginx | curl -I |
| SM-02 | Weak CORS | Express | curl with Origin |
| SM-03 | Missing TLS/HTTP | Nginx | curl -vk |
| SM-04 | Unnecessary HTTP Methods | Nginx/Express | OPTIONS, TRACE |
| SM-05 | Verbose Errors | Express | GET /api/lab/error |
| SM-06 | Debug Endpoint | Express | GET /api/debug/config |
| SM-07 | Public Object Storage | Express | GET /api/storage/private |
| SM-08 | Outdated Dependency | Backend | npm audit |
| SM-09 | Weak Server Hardening | Nginx | Server info |
| SM-10 | Excessive Permissions | API | Admin endpoints |

## 9. Testing Commands

```bash
# HTTP headers
curl -I http://localhost:8080

# CORS test
curl -i -H "Origin: http://evil.example.local" http://localhost:8080/api/products

# HTTP methods
curl -i -X OPTIONS http://localhost:8080/api/products
curl -i -X TRACE http://localhost:8080/api/products

# Error disclosure
curl -i http://localhost:8080/api/lab/error

# Debug endpoint
curl -i http://localhost:8080/api/debug/config

# Storage
curl -i http://localhost:8080/api/storage/public/demo-report.txt
curl -i http://localhost:8080/api/storage/private/private-report.txt

# TLS (hardened)
curl -vk https://localhost:8443

# Health check
curl http://localhost:8080/api/health
```

## 10. Reset

```bash
docker compose down -v
docker compose up --build -d
```

Or:
```bash
make reset
```

## 11. Testing Checklist

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

## 12. Documentation

- [Vulnerability Matrix](docs/vulnerability-matrix.md) - Detailed vulnerability documentation
- [Hardening Guide](docs/hardening-guide.md) - Before/after configurations
- [Testing Guide](docs/testing-guide.md) - Complete testing instructions
- [LAB_INDEX.md](LAB_INDEX.md) - Quick reference for all labs

---

## Project Summary

ShopSphere is a complete, intentionally vulnerable e-commerce security lab with:

### Core Features
- **Full Stack**: React/Vite frontend, Express/TypeScript backend
- **Database**: PostgreSQL with 6+ tables
- **Security Lab**: 10 OWASP SM-01 to SM-10 vulnerabilities
- **Hardening**: Identical fix implementations for each vulnerability
- **Docker**: Multi-stage builds, SSL certificates, Nginx reverse proxy
- **Documentation**: Complete lab manual with testing guides

### Vulnerabilities Implemented
1. **Security Headers** - Missing HSTS, CSP, X-Frame-Options, etc.
2. **CORS** - Intentionally permissive `Access-Control-Allow-Origin: *`
3. **TLS/HTTPS** - HTTP only in vulnerable, HTTPS in hardened
4. **HTTP Methods** - Accepts TRACE, OPTIONS, DELETE in vulnerable mode
5. **Error Disclosure** - Full stack traces in vulnerable mode
6. **Debug Endpoint** - `/api/debug/config` exposes configuration
7. **Object Storage** - Private files accessible without auth in vulnerable
8. **Dependency** - lodash@4.17.15 with CVE-2019-10744
9. **Server Hardening** - No version hiding, no request limits
10. **Permissions** - Authentication bypass in vulnerable mode

### Usage

```bash
# Start vulnerable mode (all labs available)
make up

# Test each vulnerability using curl commands in README

# Start hardened mode (all fixes applied)
make up-hardened

# Retest to verify fixes
```

The lab provides a complete, hands-on learning experience where students can:
1. **Test** each vulnerability using provided curl commands
2. **Observe** the vulnerable behavior
3. **Understand** why it's dangerous
4. **Fix** the configuration
5. **Retest** to verify the fix

This satisfies all requirements for an intentional security misconfiguration training lab that is safe, educational, and comprehensive.

## Important Notes

- **Never run in production** - this is an educational lab
- **All credentials are synthetic** - no real passwords
- **Network-only localhost** - no external dependencies
- **Docker-first approach** - easy for students to run
- **Complete documentation** - students can learn and test independently
- **10 vulnerabilities** - comprehensive coverage of OWASP SM issues

The ShopSphere lab is ready for cybersecurity education!
