// frontend/src/api.js

// Use the environment variable; fallback to local if not defined.
// Since your back end runs on port 5001 locally, we use that as our fallback.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

/** User Endpoints **/

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

/** Recipe Endpoints **/

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

export async function updateRecipe(id, recipeData) {
  const response = await fetch(`${API_URL}/api/recipes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipeData),
  });
  if (!response.ok) {
    throw new Error(`Updating recipe failed: ${response.statusText}`);
  }
  return response.json();
}

export async function deleteRecipe(id) {
  const response = await fetch(`${API_URL}/api/recipes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Deleting recipe failed: ${response.statusText}`);
  }
  return response.json();
}

/** Rating Endpoints **/

export async function createRating(ratingData) {
  const response = await fetch(`${API_URL}/api/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ratingData),
  });
  if (!response.ok) {
    throw new Error(`Creating rating failed: ${response.statusText}`);
  }
  return response.json();
}

export async function updateRating(id, ratingData) {
  const response = await fetch(`${API_URL}/api/ratings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ratingData),
  });
  if (!response.ok) {
    throw new Error(`Updating rating failed: ${response.statusText}`);
  }
  return response.json();
}

export async function deleteRating(id) {
  const response = await fetch(`${API_URL}/api/ratings/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Deleting rating failed: ${response.statusText}`);
  }
  return response.json();
}

export async function getRatings(recipeId) {
  const response = await fetch(`${API_URL}/api/ratings?recipe_id=${encodeURIComponent(recipeId)}`);
  if (!response.ok) {
    throw new Error(`Error fetching ratings: ${response.statusText}`);
  }
  return response.json();
}

/** Bookmark Endpoints **/

export async function addBookmark(bookmarkData) {
  const response = await fetch(`${API_URL}/api/bookmarks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookmarkData),
  });
  if (!response.ok) {
    throw new Error(`Adding bookmark failed: ${response.statusText}`);
  }
  return response.json();
}

export async function removeBookmark(bookmarkData) {
  // This DELETE endpoint expects JSON data in the request body.
  const response = await fetch(`${API_URL}/api/bookmarks`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookmarkData),
  });
  if (!response.ok) {
    throw new Error(`Removing bookmark failed: ${response.statusText}`);
  }
  return response.json();
}

export async function getBookmarksByUser(userId) {
  const response = await fetch(`${API_URL}/api/bookmarks/user/${encodeURIComponent(userId)}`);
  if (!response.ok) {
    throw new Error(`Error fetching bookmarks: ${response.statusText}`);
  }
  return response.json();
}
