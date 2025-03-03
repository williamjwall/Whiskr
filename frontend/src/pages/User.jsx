// frontend/src/pages/User.jsx
import React, { useState, useEffect } from "react";
import { registerUser, loginUser, getBookmarksByUser } from "../api";

export default function User() {
  const [activeTab, setActiveTab] = useState("profile");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [bookmarks, setBookmarks] = useState([]);

  // Check if user is logged in
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (token && activeTab === "bookmarks") {
      fetchBookmarks();
    }
  }, [token, activeTab]);

  async function fetchBookmarks() {
    try {
      const data = await getBookmarksByUser(userId);
      setBookmarks(data);
    } catch (error) {
      setMessage("Error fetching bookmarks.");
      console.error("Error fetching bookmarks:", error);
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUser(email, password);
      setMessage(`Registered successfully! User ID: ${data.id}`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        setMessage("Logged in successfully!");
      } else {
        setMessage("Login failed: No token received.");
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setMessage("Logged out successfully!");
  };

  return (
    <div className="profile-page">
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
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
          {!token ? (
            <>
              <h2>User Registration & Login</h2>
              <form onSubmit={handleRegister} className="form-group">
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="button-group">
                  <button type="submit">Register</button>
                  <button type="button" onClick={handleLogin}>Login</button>
                </div>
              </form>
            </>
          ) : (
            <div className="profile-info">
              <h2>Welcome!</h2>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      )}

      {activeTab === "bookmarks" && (
        <div className="card">
          <h2>Your Bookmarked Recipes</h2>
          {token ? (
            <div className="recipe-list">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.recipe_id} className="recipe-item">
                  <h3>{bookmark.title}</h3>
                  <a href={`/recipe/${bookmark.recipe_id}`}>View Recipe</a>
                </div>
              ))}
            </div>
          ) : (
            <p>Please log in to view your bookmarks.</p>
          )}
        </div>
      )}

      {message && <div className="message">{message}</div>}
    </div>
  );
}
