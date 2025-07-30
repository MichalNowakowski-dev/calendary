// Common action state type used across all action files
export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};
