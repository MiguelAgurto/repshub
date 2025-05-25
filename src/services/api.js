// File: src/services/api.js

/**
 * Retrieve all workouts from localStorage.
 * @returns {Array<Object>}
 */
export function getWorkouts() {
  const json = localStorage.getItem('workouts')
  return json ? JSON.parse(json) : []
}

/**
 * Persist the full workouts array back to localStorage.
 * @param {Array<Object>} workouts
 */
export function saveWorkouts(workouts) {
  localStorage.setItem('workouts', JSON.stringify(workouts))
}

/**
 * Retrieve the user's weekly volume goal (in kg·reps).
 * @returns {number}
 */
export function getWeeklyGoal() {
  const val = localStorage.getItem('weeklyVolumeGoal')
  const num = parseInt(val, 10)
  return isNaN(num) ? 0 : num
}

/**
 * Save the user's weekly volume goal (in kg·reps).
 * @param {number} goal
 */
export function setWeeklyGoal(goal) {
  localStorage.setItem('weeklyVolumeGoal', String(goal))
}

/**
 * Retrieve profile (displayName) from localStorage.
 * @returns {{displayName: string}}
 */
export function getProfile() {
  const json = localStorage.getItem('profile')
  return json ? JSON.parse(json) : { displayName: '' }
}

/**
 * Save profile (displayName) to localStorage.
 * @param {{displayName: string}} profile
 */
export function setProfile(profile) {
  localStorage.setItem('profile', JSON.stringify(profile))
}

/**
 * Retrieve feedback array from localStorage.
 * @returns {Array<{id:number,message:string,createdAt:string}>}
 */
export function getFeedback() {
  const json = localStorage.getItem('feedback')
  return json ? JSON.parse(json) : []
}

/**
 * Add a feedback message to localStorage.
 * @param {string} message
 */
export function addFeedback(message) {
  const list = getFeedback()
  list.push({ id: Date.now(), message, createdAt: new Date().toISOString() })
  localStorage.setItem('feedback', JSON.stringify(list))
}
