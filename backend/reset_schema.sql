-- reset_schema.sql

-- 1. DROP existing tables (to avoid "relation already exists" errors).
--    The CASCADE option ensures dependent objects (like foreign keys) are also dropped.
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. (Optional) If you want to drop the function, do it here:
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 3. Recreate pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 4. CREATE the tables
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    time_minutes INTEGER CHECK (time_minutes > 0),
    category TEXT CHECK (category IN ('breakfast', 'lunch', 'dinner', 'dessert')),
    is_featured BOOLEAN DEFAULT false,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    value INT CHECK (value BETWEEN 1 AND 5),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(user_id, recipe_id)
);

CREATE TABLE bookmarks (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (user_id, recipe_id)
);

-- 5. CREATE indexes for better performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_featured ON recipes(is_featured);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_recipe_id ON bookmarks(recipe_id);

CREATE INDEX idx_ratings_recipe_id ON ratings(recipe_id);

-- 6. Create or replace function to auto-update 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for 'updated_at' on users and recipes
CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add this to your reset_schema.sql file or run directly in psql
ALTER TABLE recipes 
ALTER COLUMN description SET DEFAULT 'No description provided';
