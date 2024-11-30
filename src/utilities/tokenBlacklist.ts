const tokenBlacklist: Set<string> = new Set();

export const addToBlacklist = (token: string) => {
  tokenBlacklist.add(token);
};

export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};
