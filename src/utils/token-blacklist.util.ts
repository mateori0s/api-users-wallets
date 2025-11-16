/**
 * Token Blacklist Utility
 * 
 * Manages a blacklist of invalidated JWT tokens.
 * Tokens are added to the blacklist when users sign out.
 * 
 * Note: This is an in-memory implementation. For production,
 * consider using Redis or a database for distributed systems.
 */

// Set to store invalidated tokens
const blacklistedTokens = new Set<string>();

/**
 * Add a token to the blacklist
 * @param token - The JWT token to blacklist
 */
export const addToBlacklist = (token: string): void => {
  blacklistedTokens.add(token);
};

/**
 * Check if a token is blacklisted
 * @param token - The JWT token to check
 * @returns true if the token is blacklisted, false otherwise
 */
export const isTokenBlacklisted = (token: string): boolean => {
  return blacklistedTokens.has(token);
};

/**
 * Remove a token from the blacklist (useful for cleanup or testing)
 * @param token - The JWT token to remove from blacklist
 */
export const removeFromBlacklist = (token: string): void => {
  blacklistedTokens.delete(token);
};

/**
 * Clear all blacklisted tokens (useful for testing)
 */
export const clearBlacklist = (): void => {
  blacklistedTokens.clear();
};

/**
 * Get the number of blacklisted tokens (useful for monitoring)
 * @returns The number of blacklisted tokens
 */
export const getBlacklistSize = (): number => {
  return blacklistedTokens.size;
};

