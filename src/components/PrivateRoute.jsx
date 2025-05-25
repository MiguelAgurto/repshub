// File: src/components/PrivateRoute.jsx

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

/**
 * Wraps protected pages to require login.
 * - Shows a loading indicator while Auth0 initializes.
 * - Redirects to “/” if not authenticated.
 */
export default function PrivateRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth0()

  if (isLoading) {
    return <div>Loading…</div>
  }

  return isAuthenticated
    ? children
    : <Navigate to="/" replace />
}
