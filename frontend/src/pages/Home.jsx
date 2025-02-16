import React, { useEffect, useState } from "react";
import { getRecipes, createRecipe } from "../api";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [message, setMessage] = useState("");

  // Simulated logged-in user; in a real app, obtain this from your auth flow.
  const [currentUser, setCurrentUser] = useState({ id: "37eda056-80ce-4662-8b96-053e6bb9f1a4" });

  // Fetch recipes when the component mounts or when the search term changes
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

  // Handle the upload of a new recipe
  const handleRecipeUpload = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setMessage("Please log in to upload recipes.");
      return;
    }
    try {
      const recipeData = {
        title: newTitle,
        content: newContent,
        user_id: currentUser.id,
      };
      const data = await createRecipe(recipeData);
      setMessage(`Recipe uploaded: ${data.title}`);
      // Optionally refresh the recipes list after upload:
      const updatedRecipes = await getRecipes(search);
      setRecipes(updatedRecipes);
      // Clear the form fields
      setNewTitle("");
      setNewContent("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h2>Recipes</h2>
      {/* Search Box */}
      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {/* List Recipes */}
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <a href={`/recipe/${recipe.id}`}>{recipe.title}</a>
          </li>
        ))}
      </ul>

      <h2>Upload a New Recipe</h2>
      {currentUser ? (
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
