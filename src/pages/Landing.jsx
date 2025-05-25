// File: src/pages/Landing.jsx

import React, { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const { isAuthenticated, loginWithRedirect } = useAuth0()
  const navigate = useNavigate()

  // If already logged in, send them to the dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="landing container text-center" style={{ padding: '4rem 1rem' }}>
      <h1>Welcome to RepsHub</h1>
      <p className="mt-md">
        Your central station for every rep. Track workouts, set goals,
        and connect with your fitness circle—all in one hub.
      </p>
      <button
        onClick={() => loginWithRedirect()}
        className="primary mt-md"
      >
        Get Started
      </button>
    </div>
  )
}
