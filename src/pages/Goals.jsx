// File: src/pages/Goals.jsx

import React, { useState, useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import {
  getWorkouts,
  getWeeklyGoal,
  setWeeklyGoal,
} from '../services/api'

export default function Goals() {
  // ─── State ────────────────────────────────────────────────────────────────
  const [workouts, setWorkouts] = useState([])
  const [weeklyGoal, setWeeklyGoalState] = useState(0)

  // Ref for Chart.js
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // ─── Load initial data ────────────────────────────────────────────────────
  useEffect(() => {
    setWorkouts(getWorkouts())
    setWeeklyGoalState(getWeeklyGoal())
  }, [])

  // ─── Compute last 4 weeks of volume ───────────────────────────────────────
  const { labels, volumes } = (() => {
    const today = new Date()
    const dataLabels = []
    const dataVolumes = []

    // We consider weeks starting on Sunday
    for (let i = 3; i >= 0; i--) {
      // Find the Sunday of the week i weeks ago
      const weekStart = new Date(today)
      const dayOfWeek = weekStart.getDay() // 0 = Sunday
      weekStart.setDate(weekStart.getDate() - dayOfWeek - 7 * i)
      weekStart.setHours(0, 0, 0, 0)

      // And the Saturday (end) of that week
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      // Filter workouts in this range and sum volume
      const volume = workouts
        .filter(w => {
          const d = new Date(w.createdAt)
          return d >= weekStart && d <= weekEnd
        })
        .reduce(
          (sum, w) => sum + parseInt(w.reps, 10) * (parseFloat(w.weight) || 0),
          0
        )

      // Label like "Apr 7"
      dataLabels.push(weekStart.toLocaleDateString(undefined, {
        month: 'short', day: 'numeric'
      }))
      dataVolumes.push(volume)
    }

    return { labels: dataLabels, volumes: dataVolumes }
  })()

  // ─── Render chart whenever data or goal changes ────────────────────────────
  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext('2d')

    // Destroy old instance
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Weekly Volume',
            data: volumes,
            fill: true,
            tension: 0.3,
            backgroundColor: 'rgba(47, 128, 237, 0.2)',
            borderColor: 'var(--color-primary)',
          },
          {
            // Goal line: repeat the weeklyGoal for each point
            label: 'Goal',
            data: volumes.map(() => weeklyGoal),
            type: 'line',
            borderDash: [5, 5],
            borderColor: 'var(--color-warning)',
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'kg·reps' },
          },
        },
      },
    })

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [labels, volumes, weeklyGoal])

  // ─── Handle goal input change ─────────────────────────────────────────────
  const handleGoalChange = e => {
    const g = parseInt(e.target.value, 10) || 0
    setWeeklyGoal(g)           // save to localStorage
    setWeeklyGoalState(g)      // update state
  }

  return (
    <div className="goals-page">
      {/* Page Title */}
      <h1>Weekly Goals</h1>

      {/* Goal Setter */}
      <section>
        <h2>Set Your Weekly Volume Goal</h2>
        <div className="form-grid">
          <input
            type="number"
            placeholder="e.g. 10000"
            value={weeklyGoal}
            onChange={handleGoalChange}
          />
        </div>
      </section>

      {/* Volume Chart */}
      <section>
        <h2>Volume Over Last 4 Weeks</h2>
        <canvas ref={chartRef} height="200" />
      </section>
    </div>
  )
}
