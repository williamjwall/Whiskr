// frontend/src/pages/User.jsx
import React, { useState } from "react";
import { registerUser, loginUser } from "../api";

export default function User() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

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
      setMessage(`Logged in! Token: ${data.token}`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h2>User Registration & Login</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      <button onClick={handleLogin}>Login</button>
      {message && <p>{message}</p>}
    </div>
  );
}
