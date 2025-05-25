// File: src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react'
import { getWorkouts, getWeeklyGoal, setWeeklyGoal } from '../services/api'

export default function Dashboard() {
  // --- State for workouts & goal ---
  const [workouts, setWorkouts] = useState([])
  const [weeklyGoal, setWeeklyGoalState] = useState(0)

  // --- Computed stats ---
  const [todayStats, setTodayStats] = useState({
    totalReps: 0,
    typeCount: 0,
    sessionTime: '-',
  })
  const [weeklyStats, setWeeklyStats] = useState({
    totalReps: 0,
    totalWeight: 0,
    sessionCount: 0,
    dailySessions: 0,
    mostFrequent: '-',
  })

  // --- Load data on mount ---
  useEffect(() => {
    setWorkouts(getWorkouts())
    setWeeklyGoalState(getWeeklyGoal())
  }, [])

  // --- Recompute stats when workouts or goal change ---
  useEffect(() => {
    const now = new Date()
    const todayStr = now.toLocaleDateString()

    // Today's workouts
    const today = workouts.filter(
      w => new Date(w.createdAt).toLocaleDateString() === todayStr
    )
    const totalRepsToday = today.reduce(
      (sum, w) => sum + parseInt(w.reps, 10),
      0
    )
    const typeCount = new Set(today.map(w => w.type)).size

    let sessionTime = '-'
    if (today.length) {
      const times = today.map(w => new Date(w.createdAt).getTime())
      const start = new Date(Math.min(...times)).toLocaleTimeString()
      const end = new Date(Math.max(...times)).toLocaleTimeString()
      sessionTime = `${start} - ${end}`
    }

    // Weekly (last 7 days)
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    const last7 = workouts.filter(w => new Date(w.createdAt) > weekAgo)

    const totalRepsWeek = last7.reduce(
      (sum, w) => sum + parseInt(w.reps, 10),
      0
    )
    const totalWeightWeek = last7.reduce(
      (sum, w) => sum + (parseFloat(w.weight) || 0),
      0
    )
    const sessionCount = last7.length
    const dailySessions = new Set(
      last7.map(w => new Date(w.createdAt).toLocaleDateString())
    ).size
    const freqMap = {}
    last7.forEach(w => {
      freqMap[w.exercise] = (freqMap[w.exercise] || 0) + 1
    })
    const mostFrequent =
      Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

    // Volume goal progress
    const currentVolume = last7.reduce(
      (sum, w) =>
        sum + parseInt(w.reps, 10) * (parseFloat(w.weight) || 0),
      0
    )

    setTodayStats({
      totalReps: totalRepsToday,
      typeCount,
      sessionTime,
    })
    setWeeklyStats({
      totalReps: totalRepsWeek,
      totalWeight: totalWeightWeek,
      sessionCount,
      dailySessions,
      mostFrequent,
    })
    setVolumeProgress({ current: currentVolume, goal: weeklyGoal })
  }, [workouts, weeklyGoal])

  // --- Volume progress state ---
  const [volumeProgress, setVolumeProgress] = useState({
    current: 0,
    goal: 0,
  })

  // --- Handler to update goal ---
  function handleGoalChange(e) {
    const g = parseInt(e.target.value, 10) || 0
    setWeeklyGoal(g)
    setWeeklyGoalState(g)
  }

  // --- Compute % for progress bar ---
  const percent =
    volumeProgress.goal > 0
      ? Math.min(
          100,
          Math.round((volumeProgress.current / volumeProgress.goal) * 100)
        )
      : 0

  return (
    <div className="dashboard-grid">
      {/* Today's Session */}
      <div className="stats-card">
        <h3>Today's Session</h3>
        <p>Total Reps: {todayStats.totalReps}</p>
        <p>Exercise Types: {todayStats.typeCount}</p>
        <p>Session Time: {todayStats.sessionTime}</p>
      </div>

      {/* Weekly Summary */}
      <div className="stats-card">
        <h3>Weekly Summary</h3>
        <p>Total Reps: {weeklyStats.totalReps}</p>
        <p>Total Weight: {weeklyStats.totalWeight.toFixed(1)} kg</p>
        <p>Sessions: {weeklyStats.sessionCount}</p>
        <p>Daily Sessions: {weeklyStats.dailySessions}</p>
        <p>Most Frequent: {weeklyStats.mostFrequent}</p>
      </div>

      {/* Weekly Volume Goal */}
      <div className="stats-card">
        <h3>Weekly Volume Goal</h3>
        <label>
          Set goal (kg·reps):
          <input
            type="number"
            value={weeklyGoal}
            onChange={handleGoalChange}
            placeholder="e.g. 10000"
          />
        </label>
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p>
          {volumeProgress.current} / {volumeProgress.goal} kg·reps (
          {percent}%)
        </p>
      </div>
    </div>
  )
}
