// ─── VALIDATORS ──────────────────────────────────────────────────────────────
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
  return {
    length: password.length >= 8,
    upper:  /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
}
