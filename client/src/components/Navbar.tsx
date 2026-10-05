import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

// The logo is the link home, so there is no separate "Home" item.
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";
  const isDonor = isAuthenticated && !isAdmin;

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon">
            <Heart size={20} fill="currentColor" />
          </span>
          <span>Sahayog</span>
        </Link>

        <div className="navbar-right">
          <nav className={`navbar-links ${menuOpen ? "open" : ""}`}>
            {/* Anyone can check blood stock, no account needed */}
            {!isAdmin && (
              <Link to="/blood-bank-status" onClick={closeMenu}>
                Blood Bank
              </Link>
            )}

            {isDonor && (
              <>
                <Link to="/camps" onClick={closeMenu}>
                  Camps
                </Link>
                <Link to="/dashboard" onClick={closeMenu}>
                  Dashboard
                </Link>
              </>
            )}

            {isAdmin && (
              <Link to="/admin" onClick={closeMenu}>
                Admin
              </Link>
            )}

            {isAuthenticated ? (
              <button type="button" className="register-button" onClick={handleLogout}>
                Log out
              </button>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="register-button" onClick={closeMenu}>
                  Become a Donor
                </Link>
              </>
            )}
          </nav>

          {isDonor && <NotificationBell />}
        </div>

        <button
          type="button"
          className="menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;