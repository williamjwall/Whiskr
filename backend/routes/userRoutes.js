const express = require("express");
const prisma = require("../prismaClient");
const router = express.Router();

// Create User
router.post("/", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.create({
            data: { email, password, bookmarks: [] }
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get All Users
router.get("/", async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

// Get User by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
});

module.exports = router;
