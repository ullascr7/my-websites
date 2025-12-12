# Unified Marketplace Implementation Plan

## 1. Top-Level Summary
This document outlines the architecture for the Unified Marketplace with personalized onboarding. The core value proposition is using explicit user signals (Gender, Mindset) to re-rank product feeds and inform supplier orders.

**Developer Checklist:**
- [x] Frontend Scaffolding (React + Tailwind)
- [x] Mock API & Local Storage (Proof of Concept)
- [ ] Postgres DB Setup & Migrations
- [ ] Backend API Implementation (Node/Express)
- [ ] Admin Dashboard Integration
- [ ] Analytics Events Implementation

---

## 3. Data Model & Migrations (Postgres)

### User Table Alterations
```sql
-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add preference columns
ALTER TABLE users 
ADD COLUMN gender VARCHAR(20) CHECK (gender IN ('Men', 'Women', 'Unspecified')) DEFAULT 'Unspecified',
ADD COLUMN price_mindset VARCHAR(20) CHECK (price_mindset IN ('Branded', 'Medium', 'Cheapest', 'Unspecified')) DEFAULT 'Unspecified',
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
```

### Orders Table
Store the *snapshot* of the user's mindset at the time of purchase.
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  user_gender_snapshot VARCHAR(20),
  user_price_mindset_snapshot VARCHAR(20), -- Critical for Admin Review
  total_amount DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. API Specification

### Endpoints

**POST /api/me/preferences**
Updates user profile.
```json
// Request
{
  "gender": "Men",
  "mindset": "Branded"
}
// Response 200 OK
{
  "success": true,
  "user": { ... }
}
```

**GET /api/products**
Fetch personalized feed.
Query Params: `?gender=Men&mindset=Branded`
Logic: Backend filters by gender, then sorts by mindset weight.

**POST /api/orders**
Creates order and records snapshot.
```json
// Request
{
  "items": [{ "productId": "p1", "qty": 1 }]
}
// Backend Logic
// INSERT INTO orders (..., user_price_mindset_snapshot) 
// VALUES (..., req.user.price_mindset);
```

---

## 5. Recommendation Logic (Pseudocode)

```javascript
function rankProducts(products, userMindset) {
  return products.sort((a, b) => {
    const scoreA = getScore(a, userMindset);
    const scoreB = getScore(b, userMindset);
    return scoreB - scoreA; // Descending
  });
}

function getScore(product, mindset) {
  // Base score
  let score = product.popularity_score; 

  // Mindset Multiplier
  if (mindset === 'Branded' && product.tier === 'Premium') score += 100;
  if (mindset === 'Cheapest' && product.tier === 'Budget') score += 100;
  
  // Penalty
  if (mindset === 'Branded' && product.tier === 'Budget') score -= 50;

  return score;
}
```

**Caching (Redis):**
Cache keys: `feed:gender:{g}:mindset:{m}`.
TTL: 5 minutes.
Invalidate on: Product price change, Inventory 0.

---

## 9. Edge Cases & UX Rules

1. **Guest Users:** Store preferences in `localStorage` key `guest_prefs`. Upon signup/login, read this key and POST to `/api/me/preferences` to pre-fill the profile.
2. **Skip Behavior:** If user dismisses modal, set `mindset='Medium'` (safest default) but keep `onboarding_completed=false` to prompt again gently after 3 sessions.
3. **Privacy:** Do not sell "mindset" data. Use internally for inventory planning.

---

## 10. Rollout Checklist

1. **Database:** Run migration scripts.
2. **Backend:** Deploy API with new columns.
3. **Feature Flag:** Enable `ONBOARDING_V1` for 10% of traffic.
4. **Monitor:** Check `onboarding_drop_off_rate`. If > 20%, simplify copy.
5. **Full Rollout:** Enable for 100%.
