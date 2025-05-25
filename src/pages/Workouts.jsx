// File: src/pages/Workouts.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Chart from 'chart.js/auto'
import {
  getWorkouts,
  saveWorkouts,
} from '../services/api'

export default function Workouts() {
  // Form state
  const [exercise, setExercise] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [type, setType] = useState('')

  // Workouts list
  const [workouts, setWorkouts] = useState([])

  // Filters & sorts
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Bulk-select state
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  // Chart refs
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // Load on mount
  useEffect(() => {
    setWorkouts(getWorkouts())
  }, [])

  // Persist helper
  const persist = arr => {
    saveWorkouts(arr)
    setWorkouts(getWorkouts())
    setSelectedIds([])
  }

  // Derived: filtered & sorted
  const filtered = useMemo(() => {
    let arr = [...workouts]
    if (search) {
      arr = arr.filter(w =>
        w.exercise.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (typeFilter) {
      arr = arr.filter(w => w.type === typeFilter)
    }
    if (dateFrom) {
      const from = new Date(dateFrom)
      arr = arr.filter(w => new Date(w.createdAt) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59)
      arr = arr.filter(w => new Date(w.createdAt) <= to)
    }
    if (sortBy === 'oldest') {
      arr.sort((a, b) => a.id - b.id)
    } else if (sortBy === 'reps') {
      arr.sort((a, b) => b.reps - a.reps)
    } else if (sortBy === 'name') {
      arr.sort((a, b) =>
        a.exercise.localeCompare(b.exercise)
      )
    } else {
      arr.sort((a, b) => b.id - a.id)
    }
    return arr
  }, [workouts, search, typeFilter, sortBy, dateFrom, dateTo])

  // Chart effect
  useEffect(() => {
    if (!chartRef.current) return
    const ctx = chartRef.current.getContext('2d')
    const agg = {}
    filtered.forEach(w => {
      const d = new Date(w.createdAt).toLocaleDateString()
      agg[d] = (agg[d] || 0) + w.reps
    })
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(agg),
        datasets: [
          {
            label: 'Reps per Day',
            data: Object.values(agg),
            backgroundColor: 'var(--color-primary)',
          },
        ],
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } },
      },
    })
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [filtered])

  // Handlers
  const handleAdd = e => {
    e.preventDefault()
    if (!exercise.trim() || !reps || !type) return
    const newW = {
      id: Date.now(),
      exercise: exercise.trim(),
      reps: parseInt(reps, 10),
      weight: parseFloat(weight) || 0,
      type,
      createdAt: new Date().toISOString(),
      favorite: false,
    }
    persist([newW, ...workouts])
    setExercise(''); setReps(''); setWeight(''); setType('')
  }
  const toggleSelectMode = () => {
    setSelectMode(!selectMode)
    setSelectedIds([])
  }
  const toggleSelect = id => {
    setSelectedIds(ids =>
      ids.includes(id)
        ? ids.filter(x => x !== id)
        : [...ids, id]
    )
  }
  const handleDeleteSelected = () => {
    if (!window.confirm('Delete selected?')) return
    persist(workouts.filter(w => !selectedIds.includes(w.id)))
  }
  const handleFavoriteSelected = () => {
    const updated = workouts.map(w =>
      selectedIds.includes(w.id)
        ? { ...w, favorite: true }
        : w
    )
    persist(updated)
  }
  const handleClearAll = () => {
    if (!window.confirm('Clear all workouts?')) return
    persist([])
  }
  const handleDelete = id => {
    if (!window.confirm('Delete this workout?')) return
    persist(workouts.filter(w => w.id !== id))
  }
  const handleFavorite = id => {
    const updated = workouts.map(w =>
      w.id === id ? { ...w, favorite: !w.favorite } : w
    )
    persist(updated)
  }
  const handleEdit = id => {
    const w = workouts.find(w => w.id === id)
    const ex = prompt('Exercise:', w.exercise)
    if (ex == null) return
    const rp = prompt('Reps:', w.reps)
    if (rp == null) return
    const wt = prompt('Weight (kg):', w.weight)
    if (wt == null) return
    const tp = prompt(
      'Type (strength/cardio/stretch):',
      w.type
    )
    if (tp == null) return
    const updated = workouts.map(w =>
      w.id === id
        ? {
            ...w,
            exercise: ex.trim(),
            reps: parseInt(rp, 10),
            weight: parseFloat(wt) || 0,
            type: tp,
          }
        : w
    )
    persist(updated)
  }

  return (
    <div className="workouts-page container">
      {/* Bulk Controls */}
      <div className="bulk-controls">
        <button onClick={toggleSelectMode} className="primary">
          {selectMode ? 'Exit Select' : 'Select Items'}
        </button>
        <button
          onClick={handleDeleteSelected}
          disabled={!selectedIds.length}
          className="danger"
        >
          Delete Selected
        </button>
        <button
          onClick={handleFavoriteSelected}
          disabled={!selectedIds.length}
          className="primary"
        >
          Favorite Selected
        </button>
        <button
          onClick={handleClearAll}
          className="danger"
        >
          Clear All Workouts
        </button>
      </div>

      {/* Add Workout Form */}
      <section>
        <h2>Add Workout</h2>
        <form
          onSubmit={handleAdd}
          className="form-grid"
        >
          <input
            type="text"
            placeholder="Exercise"
            value={exercise}
            onChange={e => setExercise(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={e => setReps(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={e => setWeight(e.target.value)}
          />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            required
          >
            <option value="">Type…</option>
            <option value="strength">💪 Strength</option>
            <option value="cardio">🏃 Cardio</option>
            <option value="stretch">🧘 Stretch</option>
          </select>
          <button type="submit" className="primary">
            Add
          </button>
        </form>
      </section>

      {/* Filters & Sort */}
      <section>
        <h2>Filter & Sort</h2>
        <div className="form-grid">
          <input
            type="text"
            placeholder="Search exercise…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">All types</option>
            <option value="strength">
              Strength
            </option>
            <option value="cardio">Cardio</option>
            <option value="stretch">
              Stretch
            </option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="reps">Most reps</option>
            <option value="name">A → Z</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={e =>
              setDateFrom(e.target.value)
            }
          />
          <input
            type="date"
            value={dateTo}
            onChange={e =>
              setDateTo(e.target.value)
            }
          />
        </div>
      </section>

      {/* Chart */}
      <section>
        <h2>Reps Chart</h2>
        <canvas ref={chartRef} height="150" />
      </section>

      {/* History */}
      <section>
        <h2>History</h2>
        <ul className="workout-list">
          {filtered.map(w => (
            <li
              key={w.id}
              className="workout-item"
            >
              {selectMode && (
                <input
                  type="checkbox"
                  checked={selectedIds.includes(w.id)}
                  onChange={() => toggleSelect(w.id)}
                />
              )}
              <span>
                {w.favorite ? '⭐' : '☆'}{' '}
                {w.exercise} — {w.reps} reps
                {w.weight
                  ? ` @${w.weight}kg`
                  : ''}
              </span>
              {!selectMode && (
                <div className="item-controls">
                  <button
                    onClick={() =>
                      handleFavorite(w.id)
                    }
                  >
                    {w.favorite
                      ? 'Unstar'
                      : 'Star'}
                  </button>
                  <button
                    onClick={() => handleEdit(w.id)}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(w.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
