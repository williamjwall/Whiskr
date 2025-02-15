const express = require("express");
const prisma = require("../prismaClient");
const router = express.Router();

// Create Recipe
router.post("/", async (req, res) => {
    try {
        const { title, content, userId } = req.body;
        const recipe = await prisma.recipe.create({
            data: { title, content, userId }
        });
        res.json(recipe);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get All Recipes
router.get("/", async (req, res) => {
    const recipes = await prisma.recipe.findMany();
    res.json(recipes);
});

// Get Recipe by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const recipe = await prisma.recipe.findUnique({ where: { id } });
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    res.json(recipe);
});

module.exports = router;
