// File: src/components/NavBar.jsx
import React from 'react'
import { NavLink } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="logo">
        RepsHub
      </NavLink>
      <ul className="nav-links">
        <li><NavLink to="/" end>Dashboard</NavLink></li>
        <li><NavLink to="/workouts">Workouts</NavLink></li>
        <li><NavLink to="/goals">Goals</NavLink></li>
        <li><NavLink to="/profile">Profile</NavLink></li>
      </ul>
    </nav>
  )
}
