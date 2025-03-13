// frontend/src/pages/Recipe.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRecipeById, bookmarkRecipe, getBookmarksByUser} from "../api";
import { getRatings, createRating, updateRating, deleteRating } from "../api";
import { getUserAuth, isAuthenticated } from "../utils/auth";

export default function Recipe() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [message, setMessage] = useState("");
  const [userRating, setUserRating] = useState(-1);
  const [userRatingId, setUserRatingId] = useState("");
  const [rating, setRating] = useState(0);
  
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
            /*console.log(userId);
            console.log(data.id);
            console.log(bookmarks); */
            let i = 0;
            for (i; i < bookmarks.length; i++)  {
              if (bookmarks[i].id === data.id)  {
                console.log("good");
                setIsBookmarked(true);
                break;
              }
            }
            /*const isBookmarked = bookmarks.some(bookmark.id ===
              data.id
            );*/
          } catch (err) {
            console.error("Error checking bookmark status:", err);
          }
		}
		try {
		  const ratings = await getRatings(id);
		  let ratingSum = 0;
		  let i = 0;
		  for (i; i < ratings.length; i++) {
			ratingSum += ratings[i].value;
			if (authenticated) {
			  if (ratings[i].user_id === userId) {
                setUserRatingId(ratings[i].id);
                setUserRating(ratings[i].value);
              }
			}
		  }
		  if (ratings.length > 0) {
			setRating(ratingSum / ratings.length);
		  }
        } catch (err) {
          console.error("Error checking rating status:", err);
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
  
    const handleRating = async (event) => {
    if (!authenticated) {
      setMessage("Please log in to rate recipes");
      return;
    }
    
	const value = parseFloat(event.target.value);
    try {
	  //Rating does not exist
	  if (userRating == -1) {
		console.log(value);
		let s = await createRating({ value: value, user_id: userId, recipe_id: id });
		setUserRatingId(s.id);
		setUserRating(value);
	  }
	  //Rating change
	  else if (value != -1) {
		console.log(value);
		await updateRating(userRatingId, { value: value, user_id: userId, recipe_id: id });
        setUserRating(value);
	  }
	  //Delete rating
	  else {
		await deleteRating(userRatingId);
		setUserRatingId("");
		setUserRating(-1);
	  }
	  const ratings = await getRatings(id);
	  let ratingSum = 0;
	  let i = 0;
	  for (i; i < ratings.length; i++) {
		ratingSum += ratings[i].value;
	  }
      if (ratings.length > 0) {
		setRating(ratingSum / ratings.length);
	  }
      //setMessage(newStatus ? "Recipe rated!" : "Recipe r???");
    } catch (err) {
      console.error("Error rating:", err);
      setMessage("Error rating: " + err.message);
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
		  {authenticated && (
            <div className="rating-dropdown">
              <label htmlFor="userRating">Rate:</label>
              <select 
                id="userRating" 
                name="userRating" 
                value={userRating}
                onChange={handleRating}
              >
                <option value="-1">Not rated</option>
                <option value="1">1★</option>
                <option value="2">2★</option>
                <option value="3">3★</option>
                <option value="4">4★</option>
                <option value="5">5★</option>
              </select>
			  
		  </div>)}		  
        </div>
		<p className="ratings">Overall rating for this recipe: {rating} ★</p>
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
