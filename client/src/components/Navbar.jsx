import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="uz-header">
      <div className="uz-header-top">
        <Link to="/" className="uz-logo">MATCHDAY ATLAS</Link>
        <form className="uz-search" onSubmit={(e) => e.preventDefault()}>
          <input type="search" placeholder="Search" aria-label="Search" />
        </form>
      </div>
      <nav className="uz-nav">
        <NavLink to="/" end>HOME</NavLink>
        <NavLink to="/groups">GROUP STAGE</NavLink>
        <NavLink to="/knockout">KNOCKOUT</NavLink>
        {user && <NavLink to="/leaderboard">LEADERBOARD</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">ADMIN</NavLink>}
        <span className="uz-nav-spacer" />
        {user ? (
          <>
            <span className="uz-pts">⭐ {user.totalPoints || 0} pts</span>
            <button type="button" className="uz-linkbtn" onClick={handleLogout}>LOGOUT</button>
          </>
        ) : (
          <>
            <NavLink to="/login">LOGIN</NavLink>
            <NavLink to="/register">REGISTER</NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
