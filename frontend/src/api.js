// frontend/src/api.js

// Use the environment variable; fallback to local if not defined.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// User endpoints
export async function registerUser(email, password) {
  const response = await fetch(`${API_URL}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(`Registration failed: ${response.statusText}`);
  }
  return response.json();
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }
  return response.json();
}

// Recipe endpoints
export async function getRecipes(search = "") {
  const url = search
    ? `${API_URL}/api/recipes?search=${encodeURIComponent(search)}`
    : `${API_URL}/api/recipes`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching recipes: ${response.statusText}`);
  }
  return response.json();
}

export async function getRecipeById(id) {
  const response = await fetch(`${API_URL}/api/recipes/${id}`);
  if (!response.ok) {
    throw new Error(`Error fetching recipe: ${response.statusText}`);
  }
  return response.json();
}

export async function createRecipe(recipeData) {
  const response = await fetch(`${API_URL}/api/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipeData),
  });
  if (!response.ok) {
    throw new Error(`Creating recipe failed: ${response.statusText}`);
  }
  return response.json();
}

// (Add additional functions as needed for update, delete, etc.)
