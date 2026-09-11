-- ====================================================================
-- PostgreSQL + PostGIS Extension Setup Script for Farm2Market AI
-- Enables geospatial distance calculation, mandi clustering, and spatial queries
-- ====================================================================

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 2. Verify PostGIS Version
SELECT PostGIS_Version();

-- 3. Create Spatial Table for APMC Mandis & Agricultural Centers
CREATE TABLE IF NOT EXISTS location_spatial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) DEFAULT 'Maharashtra',
    district VARCHAR(100) NOT NULL,
    taluka VARCHAR(100),
    category VARCHAR(50) DEFAULT 'APMC_MANDI',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom geometry(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Spatial GIST Index for Sub-Millisecond Radius Queries
CREATE INDEX IF NOT EXISTS idx_location_spatial_geom ON location_spatial USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_location_district ON location_spatial (district);

-- 5. Helper Function: Find Mandis within X km radius of a farm coordinate
CREATE OR REPLACE FUNCTION find_mandis_within_radius(
    farm_lat DOUBLE PRECISION,
    farm_lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 50.0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    district VARCHAR(100),
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ls.id,
        ls.name,
        ls.district,
        ROUND((ST_Distance(
            ls.geom::geography, 
            ST_SetSRID(ST_MakePoint(farm_lng, farm_lat), 4326)::geography
        ) / 1000.0)::numeric, 2)::DOUBLE PRECISION AS distance_km
    FROM location_spatial ls
    WHERE ST_DWithin(
        ls.geom::geography,
        ST_SetSRID(ST_MakePoint(farm_lng, farm_lat), 4326)::geography,
        radius_km * 1000.0
    )
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;
