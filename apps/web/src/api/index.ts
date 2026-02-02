// Core exports
export * from './client';
export * from './cache-keys';

// Queries (pure functions - use in loaders, server components, or with hooks)
export * as queries from './queries';

// Hooks (React-specific - use in components only)
export * as hooks from './hooks';

// Mutations (includes both pure functions and hooks)
export * as mutations from './mutations';

// Convenience re-exports for common usage patterns
export { apiClient, ApiError } from './client';
export { queryKeys } from './cache-keys';