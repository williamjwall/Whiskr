// frontend/src/pages/Bookmarks.jsx
import React, { useEffect, useState } from "react";
import { getBookmarksByUser } from "../api";

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [message, setMessage] = useState("");

  // Retrieve the user ID from the token or user context
  const userId = localStorage.getItem("userId"); // Adjust based on your auth setup

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const data = await getBookmarksByUser(userId);
        setBookmarks(data);
      } catch (error) {
        setMessage("Error fetching bookmarks.");
        console.error("Error fetching bookmarks:", error);
      }
    }
    fetchBookmarks();
  }, [userId]);

  return (
    <div>
      <h2>Your Bookmarked Recipes</h2>
      {message && <p>{message}</p>}
      <ul>
        {bookmarks.map((bookmark) => (
          <li key={bookmark.recipe_id}>
            <a href={`/recipe/${bookmark.recipe_id}`}>{bookmark.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}