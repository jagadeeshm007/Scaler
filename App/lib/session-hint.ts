export function hasSessionHint(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith('session_hint='));
}

export function clearSessionHint(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'session_hint=; path=/; max-age=0; SameSite=Lax';
}
