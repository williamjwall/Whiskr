// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { getRecipes, createRecipe } from "../api";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [message, setMessage] = useState("");

  // Check if a token exists; if so, the user is logged in.
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const data = await getRecipes(search);
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    }
    fetchRecipes();
  }, [search]);

  const handleRecipeUpload = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("Please log in to upload recipes.");
      return;
    }
    try {
      // Do not include user_id; backend uses the token to determine the user.
      const recipeData = {
        title: newTitle,
        content: newContent,
      };
      const data = await createRecipe(recipeData);
      setMessage(`Recipe uploaded: ${data.title}`);
      // Optionally, refresh the recipes list after upload.
      const updatedRecipes = await getRecipes(search);
      setRecipes(updatedRecipes);
      // Clear the form fields.
      setNewTitle("");
      setNewContent("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h2>Recipes</h2>
      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <a href={`/recipe/${recipe.id}`}>{recipe.title}</a>
          </li>
        ))}
      </ul>

      <h2>Upload a New Recipe</h2>
      {token ? (
        <form onSubmit={handleRecipeUpload}>
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Content:</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
            />
          </div>
          <button type="submit">Upload Recipe</button>
        </form>
      ) : (
        <p>Please log in to upload a recipe.</p>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
