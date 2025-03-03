import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Recipe from "./pages/Recipe";
import User from "./pages/User";
import Search from "./pages/Search";

export default function App() {
  const currentYear = new Date().getFullYear();

  return (
    <Router>
      <div className="page-container">
        {/* Navigation */}
        <header>
          <nav className="navbar">
            <div className="container">
              <Link to="/" className="logo">Whiskr</Link>
              <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/explore">Explore</Link>
                <Link to="/user/1">Profile</Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Search />} />
              <Route path="/recipe/:id" element={<Recipe />} />
              <Route path="/user/:id" element={<User />} />
            </Routes>
          </div>
        </main>

        {/* Simplified Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <Link to="/about">About Whiskr</Link>
              <p className="copyright">
                © {currentYear} Whiskr
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
