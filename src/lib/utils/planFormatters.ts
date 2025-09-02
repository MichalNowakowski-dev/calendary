export function formatModuleName(moduleName: string): string {
  return moduleName.replace(/_/g, " ");
}

export function formatFeatureName(featureName: string): string {
  return featureName.replace(/_/g, " ");
}

export function formatLimitValue(value: number | null): string {
  return value === null ? "Unlimited" : value.toString();
}

export function formatFeatureValue(value: string): string {
  return String(value);
}
