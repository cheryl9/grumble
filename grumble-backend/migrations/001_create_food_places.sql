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

CREATE INDEX food_places_geom_idx ON food_places USING GIST (geom);
CREATE INDEX food_places_name_idx ON food_places (name);