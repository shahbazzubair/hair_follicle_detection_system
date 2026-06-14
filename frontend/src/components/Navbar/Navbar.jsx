import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        
        <Link to="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
          HFD<span>AI</span>
        </Link>

        {/* Hamburger Icon */}
        <div className={styles.menuIcon} onClick={toggleMenu}>
          <div className={`${styles.bar} ${isMenuOpen ? styles.bar1 : ''}`}></div>
          <div className={`${styles.bar} ${isMenuOpen ? styles.bar2 : ''}`}></div>
          <div className={`${styles.bar} ${isMenuOpen ? styles.bar3 : ''}`}></div>
        </div>

        {/* FIXED: Added the wrapper to properly apply the mobile slide-out class */}
        <div className={`${styles.rightSection} ${isMenuOpen ? styles.showMenu : ''}`}>
          <div className={styles.authButtons}>
            <Link
              to="/login"
              onClick={toggleMenu}
              className={location.pathname === "/login" ? styles.activeBtn : styles.inactiveBtn}
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={toggleMenu}
              className={location.pathname === "/signup" ? styles.activeBtn : styles.inactiveBtn}
            >
              Sign Up
            </Link>
          </div>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;