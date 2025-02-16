import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL; // Use environment variable for flexibility

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the logged-in user's ID (Assuming authentication)
  const userId = localStorage.getItem("userId"); // Example: Replace with actual auth logic

  // Fetch recipes from the backend
  const fetchRecipes = async () => {
    try {
      const response = await axios.get("/api/recipes"); // Now using proxy
      console.log("API Response:", response.data);
      setRecipes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setRecipes([]); // Prevents crash
    }
  };
  
  

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Handle form submission to upload a new recipe
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("You must be logged in to submit a recipe.");
      return;
    }

    try {
      const recipeData = { userId, title, content };
      await axios.post(`${API_URL}/recipes`, recipeData, {
        headers: { "Content-Type": "application/json" },
      });

      setTitle("");
      setContent("");
      setError("");

      toast.success("Recipe uploaded successfully!");
      fetchRecipes(); // Refresh list
    } catch (err) {
      console.error("Error uploading recipe:", err);
      toast.error("Failed to upload recipe. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Recipes</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ display: "block", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={{ display: "block", marginBottom: "10px" }}
          />
        </div>
        <button type="submit">Upload Recipe</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <p>No recipes found.</p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id} style={{ marginBottom: "20px" }}>
              <h3>{recipe.title}</h3>
              <p>{recipe.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
