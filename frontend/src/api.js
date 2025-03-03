// frontend/src/api.js

import { getUserAuth } from "./utils/auth";

// Use the environment variable; fallback to local if not defined.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Helper function to retrieve the JWT from localStorage.
function getAuthToken() {
  return localStorage.getItem("token");
}

/** User Endpoints **/
export async function registerUser(email, password) {
  console.log('Sending registration request:', { email, password: '***' });
  
  const response = await fetch(`${API_URL}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Registration response error:', data);
    throw new Error(data.error || "Registration failed");
  }

  console.log('Registration response:', data);
  return data;
}

export async function loginUser(email, password) {
  console.log('Attempting login with:', { email, password: '***' });
  
  try {
    const response = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Login response error:', data);
      throw new Error(data.error || `Login failed: ${response.statusText}`);
    }

    // Extract user ID from the response or JWT
    let userId = data.userId;
    
    // If userId is missing but we have a token, try to extract from JWT
    if (!userId && data.token) {
      console.log('Extracting userId from token payload');
      try {
        // JWT format: header.payload.signature
        const payload = data.token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        userId = decodedPayload.id;
        console.log('Extracted userId from token:', userId);
      } catch (err) {
        console.error('Failed to extract userId from token:', err);
      }
    }
    
    // Create a normalized response object
    const normalizedData = {
      token: data.token,
      userId: userId || data.id || (data.user && data.user.id),
      email: data.email || (data.user && data.user.email)
    };
    
    if (!normalizedData.token || !normalizedData.userId) {
      console.error('Login response missing required fields:', data);
      throw new Error('Invalid server response: missing token or userId');
    }
    
    console.log('Login successful:', { 
      ...normalizedData,
      token: '***',
      userId: normalizedData.userId,
      hasUserId: !!normalizedData.userId
    });
    return normalizedData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/** Recipe Endpoints **/
export async function getRecipes(searchTerm = "", filters = {}) {
  const params = new URLSearchParams();
  
  if (searchTerm) {
    params.append("search", searchTerm);
  }
  
  if (filters.category && filters.category !== "all") {
    params.append("category", filters.category);
  }
  
  if (filters.difficulty && filters.difficulty !== "all") {
    params.append("difficulty", filters.difficulty);
  }
  
  if (filters.time && filters.time !== "all") {
    params.append("time", filters.time);
  }

  if (filters.featured) {
    params.append("featured", "true");
  }

  const response = await fetch(`${API_URL}/api/recipes?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }
  return response.json();
}

export async function getRecipeById(id) {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  const response = await fetch(`${API_URL}/api/recipes/${id}`, { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch recipe");
  }
  return response.json();
}

// Protected endpoints need the JWT in the Authorization header.
export async function createRecipe(recipeData) {
  const { token } = getUserAuth();
  if (!token) {
    throw new Error("Authentication required");
  }

  // Debug token information
  console.log("Token being used:", {
    length: token.length,
    firstChars: token.substring(0, 10) + '...',
    lastChars: '...' + token.substring(token.length - 10)
  });

  // Debug the incoming data
  console.log("Raw recipe data:", {
    ...recipeData,
    description: {
      type: typeof recipeData.description,
      value: recipeData.description,
      length: recipeData.description?.length
    }
  });

  // Ensure description is never null or undefined
  if (recipeData.description === null || recipeData.description === undefined) {
    console.warn("Description was null or undefined, setting to empty string");
    recipeData.description = '';
  }

  // Validate required fields
  const requiredFields = ["title", "description", "content", "difficulty", "time_minutes", "category"];
  const missingFields = requiredFields.filter((field) => {
    const value = recipeData[field];
    const isEmpty = value === undefined || value === null || value.trim() === "";
    if (isEmpty) {
      console.log(`Field ${field} is empty:`, { value, type: typeof value });
    }
    return isEmpty;
  });

  if (missingFields.length > 0) {
    console.error("Missing required fields:", {
      missingFields,
      recipeData
    });
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  const data = {
    ...recipeData,
    description: (recipeData.description || "").trim(),
    time_minutes: parseInt(recipeData.time_minutes, 10)
  };

  // Final validation before sending
  if (!data.description) {
    console.error("Description is still empty after processing");
    data.description = "No description provided"; // Fallback value
  }

  console.log("Sending recipe data to server:", data);

  try {
    const response = await fetch(`${API_URL}/api/recipes`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Check for auth errors specifically
    if (response.status === 401 || response.status === 403) {
      console.error("Authentication error:", response.status);
      // Force re-login if token is invalid
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      throw new Error("Your session has expired. Please log in again.");
    }

    // Log the server response
    const responseData = await response.json();
    console.log("Server response:", {
      ok: response.ok,
      status: response.status,
      data: responseData
    });

    if (!response.ok) {
      throw new Error(responseData.error || "Failed to create recipe");
    }

    return responseData;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
}

export async function updateRecipe(id, recipeData) {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/api/recipes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(recipeData),
  });
  if (!response.ok) {
    throw new Error(`Updating recipe failed: ${response.statusText}`);
  }
  return response.json();
}

export async function deleteRecipe(id) {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/api/recipes/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": token ? `Bearer ${token}` : "",
    },
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
  if (!userId) {
    console.error("getBookmarksByUser called with undefined userId");
    throw new Error("User ID is required");
  }
  
  console.log('Fetching bookmarks for user ID:', userId);
  
  const { token } = getUserAuth();
  if (!token) {
    throw new Error("Authentication required");
  }
  
  const response = await fetch(`${API_URL}/api/bookmarks/user/${encodeURIComponent(userId)}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  console.log('Bookmarks response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bookmarks error response:', errorText);
    throw new Error(`Error fetching bookmarks: ${response.statusText}`);
  }
  return response.json();
}

export async function bookmarkRecipe(recipeId, isBookmarking = true) {
  const { token, userId } = getUserAuth();
  if (!token) {
    throw new Error("Authentication required");
  }
  
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  console.log('Bookmarking recipe:', { recipeId, isBookmarking, userId });

  try {
    const response = await fetch(`${API_URL}/api/bookmarks`, {
      method: isBookmarking ? "POST" : "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId, recipe_id: recipeId })
    });

    console.log('Bookmark response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bookmark error response:', errorText);
      
      // Try to extract a more meaningful error message
      let errorMessage = "Failed to update bookmark";
      try {
        if (errorText.includes('{')) {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        }
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error('Bookmark operation failed:', error);
    throw error;
  }
}

export async function getRecipesByUser(userId) {
  const { token } = getUserAuth();
  if (!token) {
    throw new Error("Authentication required");
  }
  
  if (!userId) {
    console.error("getRecipesByUser called with undefined userId");
    throw new Error("User ID is required");
  }

  const response = await fetch(`${API_URL}/api/recipes/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user recipes");
  }
  return response.json();
}
