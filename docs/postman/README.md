# ShopSphere API and Postman Guide

ShopSphere is an intentionally vulnerable, localhost-only security lab. The Postman assets in this directory provide a repeatable way to exercise the API in both `vulnerable` and `hardened` modes.

## Files

- `ShopSphere-API.postman_collection.json`: Postman v2.1 collection containing health, authentication, catalog, cart, orders, admin, storage, and lab/security requests.
- `ShopSphere-API.postman_environment.json`: Local variables, synthetic credentials, IDs, and token placeholders.

## Import and run

1. Start the lab from the repository root:

   ```bash
   make up
   ```

   This starts vulnerable mode at `http://localhost:8080`.

2. In Postman, import both JSON files from this directory.
3. Select the `ShopSphere Local Lab` environment.
4. Run `Authentication > Login - Customer` and `Authentication > Login - Admin` once. Their test scripts save JWTs into `customerToken` and `adminToken`.
5. Run the remaining folders individually, or run the collection in this order:
   `Health`, `Authentication`, `Products`, `Cart`, `Orders`, `Admin`, `Storage`, `Security Lab`.

The collection uses `{{baseUrl}}`, so the environment can be changed to another local port without editing requests. Do not point it at an internet-facing deployment.

## Endpoint reference

| Method | Path | Auth in hardened mode | Purpose |
| --- | --- | --- | --- |
| GET | `/` | No | API/database status |
| GET | `/api/health` | No | Service health |
| POST | `/api/auth/login` | No | Issue a 24-hour JWT |
| GET | `/api/auth/me` | Customer/admin JWT | Current profile |
| GET | `/api/products` | No | Paginated product list |
| GET | `/api/products/:id` | No | Product details |
| GET | `/api/cart` | Customer/admin JWT | Current cart |
| POST | `/api/cart` | Customer/admin JWT | Add product and decrement stock |
| GET | `/api/orders` | Customer/admin JWT | Current user's orders |
| POST | `/api/orders` | Customer/admin JWT | Create order from cart |
| GET | `/api/orders/:id` | Customer/admin JWT | Current user's order details |
| GET | `/api/admin/users` | Admin JWT | List users |
| GET | `/api/admin/orders` | Admin JWT | List all orders |
| GET | `/api/admin/reports` | Admin JWT | Aggregate report |
| GET | `/api/admin/storage` | Admin JWT | Storage permission overview |
| GET | `/api/storage/public/:file` | Vulnerable: no; hardened: any JWT | Read simulated public storage |
| GET | `/api/storage/private/:file` | Vulnerable: no; hardened: admin JWT | Demonstrate private storage access |
| GET | `/api/debug/config` | Vulnerable only | Exposed configuration diagnostic |
| GET | `/api/debug/health` | Vulnerable only | Detailed diagnostic |
| GET | `/api/lab/error` | No | Controlled stack-trace disclosure test |
| GET | `/api/lab/slow` | Vulnerable only | Two-second slow endpoint |

## Request bodies

### Login

```json
{
  "email": "customer@example.local",
  "password": "LAB-Customer-Password-123"
}
```

### Add to cart

```json
{
  "productId": 1,
  "quantity": 1
}
```

## Expected lab differences

- Vulnerable mode is intentionally permissive. Missing bearer tokens may receive a synthetic customer context, private storage is exposed, CORS allows `*`, and debug routes are available.
- Hardened mode requires JWT authentication where documented, restricts admin routes to the `admin` role, protects private storage, restricts CORS, and disables debug routes.
- `GET /api/lab/error` returns HTTP 500 in both modes. Vulnerable mode exposes stack and request details; hardened mode returns a generic error and request ID.

## Resetting test data

Cart and order requests mutate the seeded database. Reset the lab before repeating a clean workflow:

```bash
make reset
```

The reset recreates the containers and database volume using the lab's seed process. Credentials and files are synthetic and must never be reused outside this lab.
