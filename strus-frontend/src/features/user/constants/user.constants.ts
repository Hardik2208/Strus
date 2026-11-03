export const USER_QUERY_KEYS = {
  profile: ['user', 'profile'] as const,
  search: (query: string) => ['user', 'search', query] as const,
  usernameAvailability: (username: string) => ['user', 'username', username] as const,
};

export const AVATAR_CONSTRAINTS = {
  MAX_SIZE_MB: 2,
  MAX_SIZE_BYTES: 2 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};
