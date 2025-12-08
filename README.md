# Tender Backend (Node.js + Express + TypeScript)

Production-ready backend with:
- JWT authentication  
- OTP verification  
- Admin / Contractor / Engineer roles  
- Tender CRUD (aggregation + pagination)  
- Contractor CRUD (aggregation)  
- Premium membership handling  
- Clean controller-service architecture  
- Config-based environment  

---

## 📁 Project Structure

```
src/
  controllers/
  routes/
  models/
  middlewares/
  utils/
  config/
```

Controllers contain **pure logic**, routes handle **req/res** + errors.

---

## ⚙️ Environment Variables (`.env`)

```
PORT=5000
MONGO_URL=mongodb://localhost:27017/tender
JWT_SECRET=supersecret
OTP_DIGITS=6
OTP_TTL_MINUTES=5
PREMIUM_DAYS=365
```

---

## 🔐 Auth Endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/request-otp`
- `POST /auth/verify-contact`

---

## 📄 Tender Endpoints

Public:
- `GET /tender/list`
- `GET /tender/:id`

Protected:
- `POST /tender`
- `PATCH /tender/:id`
- `DELETE /tender/:id`
- `POST /tender/:id/cancel`

---

## 👤 Contractor Endpoints

- `GET /contractor/list`
- `GET /contractor/:id`
- `POST /contractor`
- `PATCH /contractor/:id`

---

## 💎 Premium Logic

When `isPremiumMember = true`:
- `subscribeAt = now`
- `premiumExpiresAt = now + PREMIUM_DAYS`

When `false`:
- `premiumExpiresAt = null`

---

## ▶️ Start

```
npm install
npm run dev
```

Server runs at:

```
http://localhost:5000
```

---

## ✔️ Status: Ready for production

