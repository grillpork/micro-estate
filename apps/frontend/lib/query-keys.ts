// Query Key Factory Pattern
// Prevents typo errors and makes invalidation easy
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },
  properties: {
    all: ["properties"] as const,
    lists: () => [...queryKeys.properties.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.properties.lists(), { filters }] as const,
    details: () => [...queryKeys.properties.all, "detail"] as const,
    detail: (slug: string) =>
      [...queryKeys.properties.details(), slug] as const,
  },
  users: {
    all: ["users"] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
  },
  demands: {
    all: ["demands"] as const,
    lists: () => [...queryKeys.demands.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.demands.lists(), { filters }] as const,
    details: () => [...queryKeys.demands.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.demands.details(), id] as const,
    my: () => [...queryKeys.demands.all, "my"] as const,
    public: (filters: Record<string, any>) =>
      [...queryKeys.demands.all, "public", { filters }] as const,
  },
};
