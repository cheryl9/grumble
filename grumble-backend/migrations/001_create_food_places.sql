CREATE EXTENSION IF NOT EXISTS postgis;

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

CREATE TABLE food_details (
  id SERIAL PRIMARY KEY,
  food_place_id INTEGER UNIQUE REFERENCES food_places(id) ON DELETE CASCADE,
  rating DECIMAL(2,1),
  photo_url TEXT,
  price_level INTEGER,
  phone VARCHAR(50),
  website TEXT,
  enriched_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX food_places_geom_idx ON food_places USING GIST (geom);
CREATE INDEX food_places_name_idx ON food_places (name);