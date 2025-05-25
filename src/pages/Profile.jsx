// File: src/pages/Profile.jsx

import React, { useState, useEffect } from 'react'
import {
  getProfile,
  setProfile,
  getWorkouts,
  saveWorkouts,
  addFeedback,
} from '../services/api'

export default function Profile() {
  // Profile state
  const [displayName, setDisplayName] = useState('')
  const [theme, setTheme] = useState('light')

  // Feedback form state
  const [feedbackMsg, setFeedbackMsg] = useState('')

  // Load profile & theme on mount
  useEffect(() => {
    const prof = getProfile()
    setDisplayName(prof.displayName || '')
    const t = localStorage.getItem('theme') || 'light'
    setTheme(t)
    document.body.classList.toggle('dark-mode', t === 'dark')
  }, [])

  // Save profile name
  function handleProfileSave(e) {
    e.preventDefault()
    setProfile({ displayName })
    alert('Profile saved!')
  }

  // Change theme preference
  function handleThemeChange(e) {
    const newTheme = e.target.value
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.classList.toggle('dark-mode', newTheme === 'dark')
  }

  // Export workouts as CSV
  function handleExportCSV() {
    const workouts = getWorkouts()
    if (!workouts.length) {
      alert('No workouts to export.')
      return
    }
    const headers = ['Exercise', 'Reps', 'Weight', 'Type', 'Date']
    const rows = workouts.map(w => [
      w.exercise,
      w.reps,
      w.weight,
      w.type,
      new Date(w.createdAt).toLocaleString(),
    ])
    const csv =
      [headers, ...rows]
        .map(r => r.map(f => `"${f}"`).join(','))
        .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'workouts.csv'
    link.click()
  }

  // Import workouts from CSV
  function handleImportCSV(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target.result
      const lines = text.split('\n').filter(l => l.trim())
      // Skip header
      const data = lines.slice(1)
      const existing = getWorkouts().slice()
      data.forEach((line, idx) => {
        const cols = line.split(',').map(c => c.replace(/^"|"$/g, ''))
        const [exercise, reps, weight, type, dateStr] = cols
        const date = new Date(dateStr)
        if (!exercise || !reps || !type || isNaN(date)) return
        existing.unshift({
          id: Date.now() + idx,
          exercise,
          reps: parseInt(reps, 10),
          weight: parseFloat(weight) || 0,
          type,
          createdAt: date.toISOString(),
          favorite: false,
        })
      })
      saveWorkouts(existing)
      alert('Imported workouts!')
    }
    reader.readAsText(file)
    e.target.value = '' // reset input
  }

  // Submit feedback
  function handleFeedbackSubmit(e) {
    e.preventDefault()
    if (!feedbackMsg.trim()) return
    addFeedback(feedbackMsg.trim())
    setFeedbackMsg('')
    alert('Thank you for your feedback!')
  }

  return (
    <div className="profile-page container">
      <h1>Profile & Settings</h1>

      {/* Profile Form */}
      <section>
        <h2>Profile</h2>
        <form onSubmit={handleProfileSave} className="form-grid">
          <label>
            Display Name:
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </label>
          <label>
            Theme:
            <select value={theme} onChange={handleThemeChange}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <button type="submit" className="primary">
            Save Profile
          </button>
        </form>
      </section>

      {/* CSV Export/Import */}
      <section>
        <h2>Data</h2>
        <div className="form-grid">
          <button
            type="button"
            onClick={handleExportCSV}
            className="primary"
          >
            Export Workouts CSV
          </button>

          <label>
            Import Workouts CSV:
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
            />
          </label>
        </div>
      </section>

      {/* Feedback Form */}
      <section>
        <h2>Feedback</h2>
        <form
          onSubmit={handleFeedbackSubmit}
          className="form-grid"
        >
          <textarea
            value={feedbackMsg}
            onChange={e => setFeedbackMsg(e.target.value)}
            placeholder="Your feedback..."
            rows="4"
          />
          <button type="submit" className="primary">
            Submit Feedback
          </button>
        </form>
      </section>
    </div>
  )
}
