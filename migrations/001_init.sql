-- ============================================================
-- Migration 001 - Initial Schema
-- Jalankan di Neon SQL Editor atau psql
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL       PRIMARY KEY,
    username      VARCHAR(50)  UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nama          VARCHAR(100) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
    id         SERIAL         PRIMARY KEY,
    user_id    INTEGER        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude   DECIMAL(10, 8) NOT NULL,
    longitude  DECIMAL(11, 8) NOT NULL,
    updated_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT locations_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_locations_user_id    ON locations (user_id);
CREATE INDEX IF NOT EXISTS idx_locations_updated_at ON locations (updated_at DESC);
