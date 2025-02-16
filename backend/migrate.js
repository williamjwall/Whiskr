const pool = require("./db");

const createTables = async () => {
    const query = `
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
        content TEXT NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
    );

    CREATE TABLE ratings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        value INT CHECK (value BETWEEN 1 AND 5),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT now()
    );

    CREATE TABLE bookmarks (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, recipe_id)
    );
    `;

    try {
        await pool.query(query);
        console.log("Tables created successfully.");
        process.exit();
    } catch (err) {
        console.error("Error creating tables:", err);
        process.exit(1);
    }
};

createTables();
