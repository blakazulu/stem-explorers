const SESSION_TOKEN_KEY = "stem-explorers-session-token";

// Get or create session token
export function getSessionToken(): string {
  if (typeof window === "undefined") return "";

  let token = sessionStorage.getItem(SESSION_TOKEN_KEY);

  if (!token) {
    token = crypto.randomUUID();
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  }

  return token;
}

// Check if booking can be cancelled (within 5 minutes and same session)
export function canCancelBooking(
  bookingSessionToken: string,
  bookingCreatedAt: Date
): boolean {
  const currentToken = getSessionToken();

  // Must be same session
  if (bookingSessionToken !== currentToken) return false;

  // Must be within 5 minutes
  const fiveMinutesMs = 5 * 60 * 1000;
  const timeSinceCreation = Date.now() - bookingCreatedAt.getTime();

  return timeSinceCreation <= fiveMinutesMs;
}
