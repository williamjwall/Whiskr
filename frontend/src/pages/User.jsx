// frontend/src/pages/User.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { registerUser, loginUser, getBookmarksByUser, getRecipesByUser } from "../api";
import { storeUserAuth, getUserAuth, clearUserAuth, isAuthenticated } from "../utils/auth";

export default function User() {
  const [activeTab, setActiveTab] = useState("profile");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);

  // Check if user is logged in
  const { token, userId, email: userEmail } = getUserAuth();
  const authenticated = isAuthenticated();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authenticated) {
      console.log("Missing authentication data:", { token: !!token, userId: !!userId });
      setMessage("Please log in to view your profile");
      clearUserAuth();
    }
  }, [authenticated]);

  useEffect(() => {
    if (authenticated) {
      if (activeTab === "bookmarks") {
        fetchBookmarks();
      } else if (activeTab === "recipes") {
        fetchUserRecipes();
      }
    }
  }, [authenticated, activeTab]);

  async function fetchBookmarks() {
    try {
      if (!userId) {
        console.error("Cannot fetch bookmarks: userId is undefined");
        setMessage("Please log in to view your bookmarks");
        return;
      }
      
      console.log('Fetching bookmarks for user:', userId);
      const data = await getBookmarksByUser(userId);
      console.log('Bookmarks fetched:', data);
      setBookmarks(data);
    } catch (error) {
      setMessage("Error fetching bookmarks: " + error.message);
      console.error("Error fetching bookmarks:", error);
    }
  }

  async function fetchUserRecipes() {
    try {
      if (!userId) {
        console.error("Cannot fetch recipes: userId is undefined");
        setMessage("Please log in to view your recipes");
        return;
      }
      
      console.log('Fetching recipes for user:', userId);
      const data = await getRecipesByUser(userId);
      console.log('User recipes fetched:', data);
      setUserRecipes(data);
    } catch (error) {
      setMessage("Error fetching your recipes: " + error.message);
      console.error("Error fetching user recipes:", error);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    
    try {
      console.log('Login form submitted with:', { email });
      
      if (!email || !password) {
        setMessage("Email and password are required");
        return;
      }
      
      const data = await loginUser(email, password);
      console.log('Login response data:', data);
      
      // Store auth data using our utility
      const stored = storeUserAuth(data.token, data.userId, data.email);
      if (!stored) {
        setMessage("Error storing authentication data. Please try again.");
        return;
      }
      
      setMessage("Login successful!");
      setEmail("");
      setPassword("");
      
      // Force page refresh to update UI with logged-in state
      window.location.reload();
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.message || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting registration with:', { email, password });
      const data = await registerUser(email, password);
      console.log('Registration successful:', data);
      
      // Extract userId based on response format
      let userId = null;
      if (data.id) {
        userId = data.id;
      } else if (data.userId) {
        userId = data.userId;
      } else if (data.user && data.user.id) {
        userId = data.user.id;
      }
      
      if (!userId) {
        throw new Error("Invalid response format: missing user ID");
      }
      
      // Store auth data
      const stored = storeUserAuth(data.token, userId, data.email || (data.user && data.user.email));
      if (!stored) {
        setMessage("Error storing authentication data. Please try again.");
        return;
      }
      
      setMessage("Registration successful!");
      setEmail("");
      setPassword("");
      window.location.reload();
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error.message || "Registration failed");
    }
  };

  const handleLogout = () => {
    clearUserAuth();
    setMessage("See you next time!");
    window.location.reload();
  };

  if (!authenticated) {
    return (
      <div className="user-page">
        <div className="card auth-card">
          <h2>User Authentication</h2>
          <div className="auth-tabs">
            <button 
              className={activeTab === "login" ? "active" : ""} 
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button 
              className={activeTab === "register" ? "active" : ""} 
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="auth-form">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
            </form>
          )}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label htmlFor="register-email">Email:</label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="register-password">Password:</label>
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </div>
              <button type="submit" className="auth-button">
                Register
              </button>
            </form>
          )}
          {message && <div className="message">{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p className="user-email">{userEmail}</p>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button 
          className={`tab-button ${activeTab === "recipes" ? "active" : ""}`}
          onClick={() => setActiveTab("recipes")}
        >
          My Recipes
        </button>
        <button 
          className={`tab-button ${activeTab === "bookmarks" ? "active" : ""}`}
          onClick={() => setActiveTab("bookmarks")}
        >
          Bookmarks
        </button>
      </div>

      {activeTab === "profile" && (
        <div className="card">
          <h2>Welcome, {userEmail}!</h2>
          <p>Manage your recipes, bookmarks, and account settings here.</p>
          {message && <div className="message">{message}</div>}
          <button onClick={handleLogout} className="logout-button">Sign Out</button>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }} 
            className="logout-button" 
            style={{marginLeft: '10px', background: '#333'}}
          >
            Force Refresh Session
          </button>
        </div>
      )}

      {activeTab === "recipes" && (
        <div className="card">
          <div className="recipes-header">
            <h2>My Recipes</h2>
            <Link to="/" className="create-recipe-button">Create New Recipe</Link>
          </div>
          <div className="recipe-grid">
            {userRecipes.length > 0 ? (
              userRecipes.map((recipe) => (
                <div key={recipe.id} className="recipe-card">
                  {recipe.image_url && (
                    <div className="recipe-image">
                      <img src={recipe.image_url} alt={recipe.title} />
                    </div>
                  )}
                  <div className="recipe-content">
                    <h3>{recipe.title}</h3>
                    <div className="recipe-meta">
                      <span className={`difficulty ${recipe.difficulty}`}>
                        {recipe.difficulty}
                      </span>
                      <span className="time">{recipe.time_minutes} mins</span>
                    </div>
                    <p>{recipe.description}</p>
                    <Link to={`/recipe/${recipe.id}`} className="view-recipe-link">
                      View Recipe →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-items">You haven't created any recipes yet. Start sharing your culinary creations!</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "bookmarks" && (
        <div className="card">
          <div className="recipes-header">
            <h2>My Bookmarks</h2>
          </div>
          <div className="recipe-grid">
            {bookmarks.length > 0 ? (
              bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="recipe-card">
                  {bookmark.image_url && (
                    <div className="recipe-image">
                      <img src={bookmark.image_url} alt={bookmark.title} />
                    </div>
                  )}
                  <div className="recipe-content">
                    <h3>{bookmark.title}</h3>
                    <div className="recipe-meta">
                      <span className={`difficulty ${bookmark.difficulty}`}>
                        {bookmark.difficulty}
                      </span>
                      <span className="time">{bookmark.time_minutes} mins</span>
                    </div>
                    <p>{bookmark.description}</p>
                    <Link to={`/recipe/${bookmark.id}`} className="view-recipe-link">
                      View Recipe →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-items">No saved recipes yet. Explore our recipes and save your favorites!</p>
            )}
          </div>
        </div>
      )}

      {message && <div className="message">{message}</div>}
    </div>
  );
}
