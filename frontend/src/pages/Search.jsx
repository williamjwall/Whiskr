import React, { useState, useEffect } from 'react';
import { getRecipes } from '../api';

export default function Search() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    time: 'all'
  });

  useEffect(() => {
    fetchRecipes();
  }, [searchTerm, filters]);

  async function fetchRecipes() {
    try {
      const data = await getRecipes(searchTerm, filters);
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  }

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>Explore Recipes</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="filters-section">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="dessert">Dessert</option>
        </select>

        <select
          value={filters.difficulty}
          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          className="filter-select"
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={filters.time}
          onChange={(e) => setFilters({ ...filters, time: e.target.value })}
          className="filter-select"
        >
          <option value="all">Any Time</option>
          <option value="15">15 minutes or less</option>
          <option value="30">30 minutes or less</option>
          <option value="60">1 hour or less</option>
        </select>
      </div>

      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            {recipe.image && (
              <div className="recipe-image">
                <img src={recipe.image} alt={recipe.title} />
              </div>
            )}
            <div className="recipe-content">
              <h3>{recipe.title}</h3>
              <div className="recipe-meta">
                <span>{recipe.difficulty}</span>
                <span>{recipe.time} mins</span>
              </div>
              <p>{recipe.description}</p>
              <a href={`/recipe/${recipe.id}`} className="view-recipe-link">
                View Recipe →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 