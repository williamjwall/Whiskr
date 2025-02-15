require("dotenv").config();
const express = require("express");
const cors = require("cors");
const prisma = require("./prismaClient");

const app = express();
app.use(cors());
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
    res.send("Whiskr API is running! 🚀");
});

// Import routes
const userRoutes = require("./routes/userRoutes");
const recipeRoutes = require("./routes/recipeRoutes");

app.use("/users", userRoutes);
app.use("/recipes", recipeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

