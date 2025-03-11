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

      const stored = storeUserAuth(data.token, data.userId, data.email);
      if (!stored) {
        setMessage("Error storing authentication data. Please try again.");
        return;
      }

      setMessage("Login successful!");
      setEmail("");
      setPassword("");

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

      let userId = data.id || data.userId || (data.user && data.user.id);
      if (!userId) {
        throw new Error("Invalid response format: missing user ID");
      }

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

  return (
    <div className="user-page">
      <div className="card auth-card">
        <h2>User Authentication</h2>
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`} 
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${activeTab === "register" ? "active" : ""}`} 
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>
        {activeTab === "login" && (
          <form onSubmit={handleLogin} className="auth-form">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Password:</label>
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
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Register</button>
          </form>
        )}
        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
}
