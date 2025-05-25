// File: src/components/NavBar.jsx

import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

export default function NavBar() {
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    isLoading
  } = useAuth0()

  // Logo goes to landing when logged out, dashboard when logged in
  const homePath = isAuthenticated ? '/dashboard' : '/'

  return (
    <nav className="navbar">
      {/* Logo / Home link */}
      <NavLink to={homePath} className="logo">
        RepsHub
      </NavLink>

      {/* Only show main nav when authenticated */}
      {isAuthenticated && (
        <ul className="nav-links">
          <li><NavLink to="/dashboard">Dashboard</NavLink></li>
          <li><NavLink to="/workouts">Workouts</NavLink></li>
          <li><NavLink to="/goals">Goals</NavLink></li>
          <li><NavLink to="/profile">Profile</NavLink></li>
        </ul>
      )}

      {/* Auth controls */}
      <div className="auth-controls">
        {isLoading ? (
          <span>Loading…</span>
        ) : isAuthenticated ? (
          <>
            <span className="user-name">{user.name || user.email}</span>
            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              className="primary"
            >
              Log out
            </button>
          </>
        ) : (
          <button onClick={() => loginWithRedirect()} className="primary">
            Log in
          </button>
        )}
      </div>
    </nav>
  )
}
