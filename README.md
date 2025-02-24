# Whiskr

Whiskr is a full-stack web application featuring a Node/Express backend and a React (Vite) frontend. It supports user registration and login with JWT authentication, as well as operations on recipes, ratings, and bookmarks. The PostgreSQL database is hosted remotely (e.g., on Render) and is used by the backend via SSL.

## Table of Contents

- [Setup Instructions](#setup-instructions)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
  - [Database Initialization](#database-initialization)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Additional Notes](#additional-notes)

## Setup Instructions

### Backend Setup

1. **Navigate to the backend directory:**

   cd backend

2. **Install backend dependencies:**

   npm install

3. **Configure Environment Variables:**

   Create a `.env` file in the backend directory with the following contents (adjust credentials as needed):

   DATABASE_URL=postgresql://whiskrdb_user:YOUR_PASSWORD@dpg-xyz.oregon-postgres.render.com/whiskrdb
   PORT=5001
   JWT_SECRET=someStrongSecret

4. **Run the Backend Server:**

   npm start

   You should see a message like:
   Server running on port 5001

### Frontend Setup

1. **Navigate to the frontend directory:**

   cd frontend

2. **Install frontend dependencies:**

   npm install

3. **Configure Frontend Environment Variables:**

   Create a `.env` file in the frontend directory with:

   VITE_API_URL=http://localhost:5001

   *Note: Vite only exposes variables prefixed with VITE_ to the client.*

4. **Run the Frontend Dev Server:**

   npm run dev

   Vite will start the development server and provide you a URL (typically http://localhost:3000).

## Running the Application

1. **Start the Backend:**  
   In one terminal, navigate to the backend folder and run:
   npm start

2. **Start the Frontend:**  
   In another terminal, navigate to the frontend folder and run:
   npm run dev

3. **Access the Application:**  
   Open your browser and go to the URL provided by Vite (e.g., http://localhost:3000).

## Testing

- **Backend Testing:**

  Run your test scripts from the backend/tests folder. For example, to test the database connection:

  node tests/testConnection.js

- **API Endpoints:**

  Use Postman or curl to test endpoints. For example:

  curl http://localhost:5001/health
  curl http://localhost:5001/api/recipes

- **Front-End Testing:**

  Interact with the application in your browser to test user registration, login, and recipe management.

## Additional Notes

- **Authentication:**  
  The backend issues a JWT on user login. The token is sent to the client, which should store it (e.g., in localStorage) and include it in the Authorization header for protected endpoints.

- **Front-End Integration:**  
  The frontend API module (src/api.js) automatically reads the API URL from the environment variable. After logging in, the token is stored in localStorage and used for authenticated requests.

- **Database:**  
  The PostgreSQL database is hosted remotely. Ensure your DATABASE_URL in .env is correct. If changes are made to the schema, re-run the reset_schema.sql script as needed.

- **Deployment:**  
  For production, update environment variables appropriately (e.g., use your deployed backend’s URL in VITE_API_URL).
