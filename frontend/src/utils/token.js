const TOKEN_KEY = 'task_tracker_token';
const USER_KEY = 'task_tracker_user';

/** Read the stored JWT (or null). */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** Persist the JWT and serialized user after a successful login. */
export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}