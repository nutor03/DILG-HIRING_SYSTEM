import { DEFAULT_JOBS } from "../constants";

// ─── STORAGE KEYS ────────────────────────────────────────────────────────────
export const USERS_KEY   = "dilg_users";
export const SESSION_KEY = "dilg_session";
export const APPS_KEY    = "dilg_applications";
export const JOBS_KEY    = "dilg_jobs";

// ─── JOBS ────────────────────────────────────────────────────────────────────
export function getJobs() {
  try {
    const j = JSON.parse(localStorage.getItem(JOBS_KEY));
    return j && j.length ? j : DEFAULT_JOBS;
  } catch {
    return DEFAULT_JOBS;
  }
}
export function saveJobs(jobs) {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

// ─── USERS ───────────────────────────────────────────────────────────────────
export function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}
export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ─── SESSION ─────────────────────────────────────────────────────────────────
export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}
export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
export function getAllApplications() {
  try { return JSON.parse(localStorage.getItem(APPS_KEY)) || {}; } catch { return {}; }
}
export function getApplications(email) {
  try {
    const all = JSON.parse(localStorage.getItem(APPS_KEY)) || {};
    return all[email] || [];
  } catch { return []; }
}
export function saveApplication(email, app) {
  try {
    const all = getAllApplications();
    all[email] = [...(all[email] || []), app];
    localStorage.setItem(APPS_KEY, JSON.stringify(all));
  } catch {}
}
export function updateAllApplications(all) {
  localStorage.setItem(APPS_KEY, JSON.stringify(all));
}
