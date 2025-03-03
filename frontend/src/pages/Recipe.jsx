// frontend/src/pages/Recipe.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRecipeById, bookmarkRecipe, getBookmarksByUser } from "../api";
import { getUserAuth, isAuthenticated } from "../utils/auth";

export default function Recipe() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [message, setMessage] = useState("");
  
  const { token, userId } = getUserAuth();
  const authenticated = isAuthenticated();

  useEffect(() => {
    async function fetchRecipe() {
      try {
        setLoading(true);
        const data = await getRecipeById(id);
        setRecipe(data);
        
        if (authenticated) {
          try {
            const bookmarks = await getBookmarksByUser(userId);
            const isBookmarked = bookmarks.some(bookmark => 
              bookmark.recipe_id === id
            );
            setIsBookmarked(isBookmarked);
          } catch (err) {
            console.error("Error checking bookmark status:", err);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecipe();
  }, [id, authenticated, userId]);

  const handleBookmark = async () => {
    if (!authenticated) {
      setMessage("Please log in to bookmark recipes");
      return;
    }
    
    try {
      const newStatus = !isBookmarked;
      console.log('Attempting to bookmark recipe:', { recipeId: id, newStatus, userId });
      await bookmarkRecipe(id, newStatus);
      setIsBookmarked(newStatus);
      setMessage(newStatus ? "Recipe bookmarked!" : "Recipe removed from bookmarks");
    } catch (err) {
      console.error("Error updating bookmark:", err);
      setMessage("Error updating bookmark: " + err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading recipe...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!recipe) {
    return <div className="not-found">Recipe not found</div>;
  }

  return (
    <div className="recipe-page">
      <div className="recipe-header">
        {recipe.image_url && (
          <div className="recipe-hero-image">
            <img src={recipe.image_url} alt={recipe.title} />
          </div>
        )}
        <div className="recipe-title-section">
          <h1>{recipe.title}</h1>
          <div className="recipe-meta">
            <span className={`difficulty ${recipe.difficulty}`}>
              {recipe.difficulty}
            </span>
            <span className="time">{recipe.time_minutes} mins</span>
            <span className="category">{recipe.category}</span>
          </div>
          {authenticated && (
            <button 
              className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmark}
            >
              {isBookmarked ? 'Saved ★' : 'Save Recipe ☆'}
            </button>
          )}
        </div>
      </div>

      <div className="recipe-content">
        <div className="recipe-description">
          <h2>About this Recipe</h2>
          <p>{recipe.description}</p>
        </div>

        <div className="recipe-instructions">
          <h2>Instructions</h2>
          <div className="instructions-content">
            <p>{recipe.content}</p>
          </div>
        </div>
      </div>

      {message && <div className="message">{message}</div>}
    </div>
  );
}
