// File: src/services/api.js

/**
 * Retrieve all workouts from localStorage
 * @returns {Array<Object>}
 */
export function getWorkouts() {
  const data = localStorage.getItem('workouts')
  return data ? JSON.parse(data) : []
}

/**
 * Retrieve the user's weekly volume goal (in kg·reps)
 * @returns {number}
 */
export function getWeeklyGoal() {
  const val = localStorage.getItem('weeklyVolumeGoal')
  const num = parseInt(val, 10)
  return isNaN(num) ? 0 : num
}

/**
 * Save a new weekly volume goal (in kg·reps)
 * @param {number} goal
 */
export function setWeeklyGoal(goal) {
  localStorage.setItem('weeklyVolumeGoal', String(goal))
}

// (You can keep your add/update/delete helpers here too for Workouts page)
