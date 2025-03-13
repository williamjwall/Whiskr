// frontend/src/pages/Explore.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRecipes } from "../api";

export default function Explore() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    difficulty: "all",
    time: "all"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    try {
      setLoading(true);
      const data = await getRecipes(searchTerm, filters);
      setRecipes(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to load recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchRecipes();
  };

  return (
    <div className="explore-page">
      <div className="container">
        <h1>Explore Recipes</h1>
        
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
          </form>
        </div>
        
        <div className="filters-section">
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="category">Category</label>
              <select 
                id="category" 
                name="category" 
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="all">All Categories</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="dessert">Dessert</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select 
                id="difficulty" 
                name="difficulty" 
                value={filters.difficulty}
                onChange={handleFilterChange}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="time">Time</label>
              <select 
                id="time" 
                name="time" 
                value={filters.time}
                onChange={handleFilterChange}
              >
                <option value="all">Any Time</option>
                <option value="15">15 minutes or less</option>
                <option value="30">30 minutes or less</option>
                <option value="60">1 hour or less</option>
              </select>
            </div>
            
            <button onClick={applyFilters} className="apply-filters-button">
              Apply Filters
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Loading recipes...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="explore-recipe-list">
            {recipes.length > 0 ? (
              recipes.map((recipe) => (
                <div key={recipe.id} className="explore-recipe-item">
                  <h3>{recipe.title}</h3>
                  <Link to={`/recipe/${recipe.id}`} className="view-recipe-link">
                    View Recipe →
                  </Link>
                </div>
              ))
            ) : (
              <p className="no-recipes">No recipes found. Try adjusting your search or filters.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 