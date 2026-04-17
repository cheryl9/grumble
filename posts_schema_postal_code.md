# Posts Table Schema & Postal Code Field Addition

**Question:** Will adding `postal_code` field cause alignment issues? Are foodmap posts in a separate table?

**Answer:** All posts use the SAME `posts` table. No alignment issues. Adding a nullable field is safe. ✅

---

## 📊 Current Database Schema

### **Posts Table Structure**

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  food_place_id INTEGER REFERENCES food_places(id),
  location_name VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT,
  description TEXT,
  visibility VARCHAR(20) DEFAULT 'public',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Food Places Table**

```sql
CREATE TABLE food_places (
  id SERIAL PRIMARY KEY,
  osm_id BIGINT UNIQUE,
  name VARCHAR(255),
  cuisine VARCHAR(255),
  category VARCHAR(100),
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  address TEXT,
  opening_hours TEXT,
  geom GEOMETRY(Point, 4326),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 The Answer

### **Are foodmap posts in a separate table?**

❌ **NO - They use the SAME `posts` table**

```
┌─────────────────────────────────────────┐
│         POSTS TABLE (All Posts)         │
├─────────────────────────────────────────┤
│                                         │
│  Regular Posts:                         │
│  ├─ user_id = 1                        │
│  ├─ food_place_id = NULL  ← (no food) │
│  ├─ location_name = "My favorite cafe" │
│  └─ rating = 4                         │
│                                         │
│  FoodMap Posts:                        │
│  ├─ user_id = 2                       │
│  ├─ food_place_id = 42 ← (from OSM)   │
│  ├─ location_name = "Marina Bay Sands"│
│  └─ rating = 5                        │
│                                         │
└─────────────────────────────────────────┘
```

**Relationship:**

- `food_place_id` is nullable (`REFERENCES food_places(id) ON DELETE SET NULL`)
- Posts WITH food_place_id = foodmap posts
- Posts WITH food_place_id = NULL = regular posts

---

## ✅ Adding Postal Code Field - 3 Approaches

### **APPROACH 1: Simple Add (Nullable) ⭐ RECOMMENDED**

**Pros:**

- ✅ Zero damage to existing posts
- ✅ Safe, non-breaking change
- ✅ Flexible (postal_code optional)
- ✅ Backward compatible

**Cons:**

- ⚠️ Existing posts have NULL postal_code

**Implementation:**

```sql
-- Add postal_code field (nullable)
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(6);

-- Optional: Add index for faster queries
CREATE INDEX IF NOT EXISTS posts_postal_code_idx ON posts(postal_code);

-- Comment for clarity
COMMENT ON COLUMN posts.postal_code IS
  'Singapore postal code (6 digits). Only populated for FoodMap posts.';
```

**Result:**

```
id | user_id | food_place_id | location_name | postal_code | ...
---+---------+---------------+---------------+-------------+----
 1 |    1    |      NULL     | "Cafe A"      |    NULL     | ...    ← Old post
 2 |    2    |      42       | "Marina Bay"  |  "018956"   | ...    ← New post
```

**This is NORMAL and FINE** - Nullable columns are designed for this.

---

### **APPROACH 2: Separate Table (If you want to keep them truly separate)**

**Pros:**

- ✅ Clear separation of concerns
- ✅ Can add location-specific fields later
- ✅ More structured design

**Cons:**

- ❌ More complex queries (JOIN required)
- ❌ More tables to maintain
- ❌ Overkill for your use case

**Not recommended** because posts are fundamentally the same type of data.

---

### **APPROACH 3: Drop & Recreate (If you want clean slate)**

**Pros:**

- ✅ Fresh start
- ✅ No NULL values for old data

**Cons:**

- ❌ Lose all existing data
- ❌ Only viable if you have no production data

**Only do this if:**

- You're still in development
- You have no important data to keep
- You want postal_code to be NOT NULL (required field)

**Implementation:**

```sql
-- Delete all existing posts
DELETE FROM posts;
DELETE FROM food_places;

-- Drop and recreate posts table
DROP TABLE IF EXISTS posts CASCADE;

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  food_place_id INTEGER REFERENCES food_places(id) ON DELETE SET NULL,
  location_name VARCHAR(255) NOT NULL,
  postal_code VARCHAR(6),  -- ← NEW FIELD
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT,
  description TEXT,
  visibility VARCHAR(20) DEFAULT 'public',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recreate indexes
CREATE INDEX posts_user_id_idx ON posts(user_id);
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX posts_postal_code_idx ON posts(postal_code);
```

---

## 🏆 RECOMMENDATION: Approach 1 (Add as nullable)

**Why:**

1. ✅ **Non-breaking** - Doesn't affect existing posts
2. ✅ **Flexible** - postal_code optional (not all posts need it)
3. ✅ **Safe** - Can be adopted gradually
4. ✅ **Future-proof** - Can make it required later if needed
5. ✅ **Simple** - Just one ALTER TABLE statement

**Implementation Plan:**

```sql
-- Migration file: grumble-backend/migrations/007_add_postal_code_to_posts.sql

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(6);

CREATE INDEX IF NOT EXISTS posts_postal_code_idx ON posts(postal_code);

COMMENT ON COLUMN posts.postal_code IS
  'Singapore postal code (6 digits). Used for FoodMap posts to store location.';
```

**Run it:**

```bash
psql grumble_db < migrations/007_add_postal_code_to_posts.sql
```

---

## 📝 Updated Schema After Adding Field

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  food_place_id INTEGER REFERENCES food_places(id) ON DELETE SET NULL,
  location_name VARCHAR(255) NOT NULL,
  postal_code VARCHAR(6),                    -- ← NEW FIELD
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT,
  description TEXT,
  visibility VARCHAR(20) DEFAULT 'public',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Data Flow with Postal Code

### **User Creates FoodMap Post**

```
1. User clicks "Add Food Spot"
   ↓
2. Enters postal code: "018956"
   ↓
3. System converts → lat/lon: 1.2882, 103.8516
   ↓
4. User fills rating + photo + description
   ↓
5. Frontend calls: POST /api/posts
   {
     user_id: 1,
     food_place_id: 42,
     location_name: "Marina Bay Sands",
     postal_code: "018956",     ← NEW FIELD
     rating: 5,
     image_url: "...",
     description: "..."
   }
   ↓
6. Backend inserts into posts table:
   INSERT INTO posts (user_id, food_place_id, location_name, postal_code, ...)
   VALUES (1, 42, "Marina Bay Sands", "018956", ...)
   ↓
7. Post created with postal code ✅
```

---

## 🔍 Querying Posts by Postal Code

### **Find all posts in a postal code area**

```sql
-- Get all posts in postal code 018956
SELECT p.*
FROM posts p
WHERE p.postal_code = '018956'
ORDER BY p.created_at DESC;
```

### **Find posts near a location**

```sql
-- Get all posts within ~500m of coordinates
SELECT p.*,
       ST_Distance(pc.geom, ST_Point(1.2882, 103.8516)::geography) as distance_m
FROM posts p
LEFT JOIN postcodes pc ON p.postal_code = pc.postal_code
WHERE ST_DWithin(pc.geom, ST_Point(1.2882, 103.8516)::geography, 500)
ORDER BY distance_m;
```

---

## 🛠️ Backend Updates After Adding Field

### **Update Controller to Accept Postal Code**

**File: `grumble-backend/controllers/postsController.js`**

```javascript
async function createPostHandler(req, res) {
  try {
    const {
      foodPlaceId,
      locationName,
      postalCode, // ← NEW FIELD
      rating,
      description,
      imageUrl,
      visibility,
    } = req.body;

    const userId = req.user.id;

    // Validate postal code (optional but should be 6 digits if provided)
    if (postalCode && !/^\d{6}$/.test(postalCode)) {
      return res.status(400).json({
        error: "Invalid postal code format",
      });
    }

    // Create post with postal code
    const post = await postsRepository.createPost({
      userId,
      foodPlaceId: foodPlaceId || null,
      locationName,
      postalCode: postalCode || null, // ← NEW
      rating,
      description,
      imageUrl,
      visibility,
    });

    res.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
}
```

### **Update Repository**

**File: `grumble-backend/repositories/postsRepository.js`**

```javascript
async function createPost(postData) {
  const {
    userId,
    foodPlaceId,
    locationName,
    postalCode, // ← NEW
    rating,
    description,
    imageUrl,
    visibility,
  } = postData;

  const result = await pool.query(
    `INSERT INTO posts (
      user_id, food_place_id, location_name, postal_code, 
      rating, description, image_url, visibility
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      userId,
      foodPlaceId || null,
      locationName,
      postalCode || null, // ← NEW
      rating,
      description,
      imageUrl,
      visibility,
    ],
  );

  return result.rows[0];
}
```

---

## 🎯 Frontend Updates

### **Update AddFoodSpotModal**

**File: `grumble-frontend/src/components/foodMapPage/AddFoodSpotModal.jsx`**

```javascript
// When creating post, include postal code
const handleSubmit = async () => {
  // ... existing validation ...

  // Step 3: Create the post
  const postRes = await api.post("/posts", {
    foodPlaceId: foodPlaceRes.data.id,
    locationName: locationName || selectedPlace?.name,
    postalCode: postcode, // ← PASS POSTAL CODE
    rating: selectedRating,
    description: description,
    imageUrl: imageUrl,
    visibility: visibility,
  });

  // ... rest of submission ...
};
```

---

## ✅ DECISION MATRIX

| Scenario                       | Approach       | Action                |
| ------------------------------ | -------------- | --------------------- |
| **Have existing test data**    | Approach 1     | Add as nullable field |
| **Production data with users** | Approach 1     | Add as nullable field |
| **Development/testing only**   | Approach 3     | Drop & recreate       |
| **Want full separation**       | Approach 2     | Create separate table |
| **Your situation**             | **Approach 1** | ✅ **RECOMMENDED**    |

---

## 📋 Implementation Checklist

- [ ] Create migration file: `007_add_postal_code_to_posts.sql`
- [ ] Add postal_code column (nullable)
- [ ] Create index on postal_code
- [ ] Update postsController.js to accept postal_code
- [ ] Update postsRepository.js to insert postal_code
- [ ] Update AddFoodSpotModal.jsx to send postal_code
- [ ] Test: Create new foodmap post with postal code
- [ ] Verify: Check database has postal code value
- [ ] Verify: Old posts have NULL postal_code (expected)

---

## 🎯 Summary

| Question                                        | Answer                               |
| ----------------------------------------------- | ------------------------------------ |
| **Are foodmap posts in separate table?**        | ❌ No - same `posts` table           |
| **Will adding postal_code field break things?** | ❌ No - nullable columns are safe    |
| **Can old posts exist without postal_code?**    | ✅ Yes - NULL is normal              |
| **Best approach?**                              | ✅ Approach 1: Add as nullable field |
| **Do you need to drop data?**                   | ❌ No - you can keep it              |
| **Is this a breaking change?**                  | ❌ No - fully backward compatible    |

**Result:** Just add the field as nullable. All existing posts continue to work. New posts get postal_code values. No alignment issues. ✅
