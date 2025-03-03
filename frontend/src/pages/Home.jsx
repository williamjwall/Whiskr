// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRecipes, createRecipe } from "../api";

export default function Home() {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    description: "",
    content: "",
    difficulty: "easy",
    time_minutes: "30",
    category: "dinner"
  });
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchFeaturedRecipes();
  }, []);

  async function fetchFeaturedRecipes() {
    try {
      const data = await getRecipes("", { featured: true });
      setFeaturedRecipes(data);
    } catch (error) {
      console.error("Error fetching featured recipes:", error);
    }
  }

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Recipe data before validation:', {
      title: newRecipe.title,
      descriptionType: typeof newRecipe.description,
      descriptionValue: newRecipe.description,
      content: newRecipe.content,
      difficulty: newRecipe.difficulty,
      time_minutes: newRecipe.time_minutes,
      category: newRecipe.category
    });

    if (!token) {
      setMessage("Please log in to create recipes.");
      return;
    }
    
    // Ensure description is never null or undefined
    const recipeToSubmit = {
      ...newRecipe,
      description: newRecipe.description || ''
    };
    
    // Double-check all required fields
    if (!recipeToSubmit.title || !recipeToSubmit.description || !recipeToSubmit.content) {
      console.error('Missing required fields:', recipeToSubmit);
      setMessage("Please fill in all required fields");
      return;
    }
    
    console.log('Final recipe data to submit:', {
      title: recipeToSubmit.title,
      description: {
        value: recipeToSubmit.description,
        type: typeof recipeToSubmit.description,
        length: recipeToSubmit.description.length
      },
      content: recipeToSubmit.content
    });
    
    try {
      const createdRecipe = await createRecipe(recipeToSubmit);
      console.log('Recipe created successfully:', createdRecipe);
      setMessage("Recipe created successfully!");
      setNewRecipe({
        title: "",
        description: "",
        content: "",
        difficulty: "easy",
        time_minutes: "30",
        category: "dinner"
      });
      setIsCreating(false);
      fetchFeaturedRecipes();
    } catch (error) {
      console.error('Error creating recipe:', error);
      setMessage(error.message);
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1>Welcome to Whiskr</h1>
        <p className="hero-text">Discover and share amazing recipes with our community</p>
        <div className="hero-buttons">
          <Link to="/explore" className="primary-button">Explore Recipes</Link>
          {token && (
            <button 
              className="secondary-button"
              onClick={() => setIsCreating(true)}
            >
              Create Recipe
            </button>
          )}
        </div>
      </section>

      {isCreating && (
        <section className="create-recipe-section">
          <div className="card">
            <h2>Create New Recipe</h2>
            <form onSubmit={handleRecipeSubmit} className="create-recipe-form">
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={newRecipe.title}
                  onChange={(e) => setNewRecipe({...newRecipe, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={newRecipe.description || ''}
                  onChange={(e) => {
                    const value = e.target.value || '';
                    console.log('Description changed:', { value, type: typeof value, length: value.length });
                    setNewRecipe({...newRecipe, description: value});
                  }}
                  required
                  rows="3"
                  placeholder="Brief description of your recipe"
                  onBlur={() => {
                    console.log('Description onBlur:', {
                      value: newRecipe.description,
                      type: typeof newRecipe.description,
                      length: (newRecipe.description || '').length
                    });
                    if (!newRecipe.description) {
                      setNewRecipe({...newRecipe, description: ''});
                    }
                  }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category:</label>
                  <select
                    value={newRecipe.category}
                    onChange={(e) => setNewRecipe({...newRecipe, category: e.target.value})}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="dessert">Dessert</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Difficulty:</label>
                  <select
                    value={newRecipe.difficulty}
                    onChange={(e) => setNewRecipe({...newRecipe, difficulty: e.target.value})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Time (minutes):</label>
                  <select
                    value={newRecipe.time_minutes}
                    onChange={(e) => setNewRecipe({...newRecipe, time_minutes: e.target.value})}
                  >
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                    <option value="60">60</option>
                    <option value="90">90</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Instructions:</label>
                <textarea
                  value={newRecipe.content}
                  onChange={(e) => setNewRecipe({...newRecipe, content: e.target.value})}
                  required
                  rows="6"
                  placeholder="Step-by-step instructions for your recipe"
                />
              </div>

              <div className="button-group">
                <button type="submit">Create Recipe</button>
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      <section className="featured-recipes">
        <div className="container">
          <h2>Featured Recipes</h2>
          
          {featuredRecipes.length === 0 ? (
            <p className="no-recipes">No featured recipes available yet.</p>
          ) : (
            <div className="featured-recipe-list">
              {featuredRecipes.map((recipe) => (
                <div key={recipe.id} className="featured-recipe-item">
                  <h3>{recipe.title}</h3>
                  <Link to={`/recipe/${recipe.id}`} className="view-recipe-link">
                    View Recipe →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {message && <div className="message">{message}</div>}
    </div>
  );
}
