# Ocean Jewel — Backend Configuration & Setup Guide

This guide details the secure environment setup, database initialization, and administration procedures for the Ocean Jewel luxury jewellery API.

---

## 1. Environment Configuration

1. Copy the sample environment template:
   ```bash
   cp .env.example .env
   ```

2. Configure the required environment variables in `backend/.env`:
   - `PORT`: Port for the API server (default: `5000`).
   - `MONGODB_URI`: MongoDB connection connection string (e.g., `mongodb://127.0.0.1:27017/oceanjewel`).
   - `JWT_SECRET`: A high-entropy secret key used to sign and verify JSON Web Tokens.
   - `ADMIN_NAME`: Display name for the primary administrator (e.g., `Ocean Jewel Admin`).
   - `ADMIN_EMAIL`: Secure email address for the administrator account.
   - `ADMIN_PASSWORD`: Strong password for the administrator account.
   - `RAZORPAY_KEY_ID`: Razorpay public API key ID.
   - `RAZORPAY_KEY_SECRET`: Razorpay private API secret key.
   - `SHIPROCKET_EMAIL`: Shiprocket integration account email.
   - `SHIPROCKET_PASSWORD`: Shiprocket integration account password.
   - `FRONTEND_URL`: URL of the frontend client (default: `http://localhost:5173`).

> [!CAUTION]
> Never commit `.env` or production passwords to version control. The `.gitignore` file is configured to exclude all `.env*` files with the exception of `.env.example`.

---

## 2. Seed Admin & Luxury Product Catalog

To initialize the MongoDB database with the administrator account, demo users, luxury categories, and initial products, run:

```bash
npm run seed
```

### Seeding Behavior:
- Validates that `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured in `.env`.
- Automatically hashes the administrator password using `bcrypt` (10 rounds).
- Checks if the admin account already exists. If it exists, creation is skipped safely without overwriting or logging credentials.

---

## 3. Running the Server

- **Development Mode** (with file watch):
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

The server validates that all required environment variables (`JWT_SECRET`, `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) are present at startup. If any required secret is missing, startup fails immediately with a clear diagnostic message.

---

## 4. Admin Authentication Flow

1. Navigate to `/account` in the frontend client.
2. Enter the configured `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
3. Upon successful bcrypt verification:
   - Backend issues a signed JWT token containing the user ID and verifies the `admin` role from the database.
   - Frontend routes the authenticated administrator to `/admin`.
4. All `/api/admin/*` routes are protected by `protect` and `adminOnly` middlewares.
