/**
 * Shared utility functions for Pokemon-related operations
 */

/**
 * Formats a Pokemon name by capitalizing the first letter and replacing dashes with spaces
 * @param name - The Pokemon name to format
 * @returns The formatted Pokemon name
 */
export const formatPokemonName = (name: string): string => {
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
};

/**
 * Validates and clamps a Pokemon level between 1 and 100
 * @param level - The level to validate
 * @returns The validated and clamped level
 */
export const validatePokemonLevel = (level: number | string): number => {
  const numLevel = typeof level === 'string' ? parseInt(level) || 50 : level;
  return Math.min(Math.max(numLevel, 1), 100);
};

/**
 * Constants for IV calculation thresholds
 */
export const IV_THRESHOLDS = {
  EXCELLENT: 30,
  GOOD: 25,
  AVERAGE: 20,
  BELOW_AVERAGE: 15,
  MAX_TOTAL_IVS: 186,
} as const;

/**
 * Color constants for IV ratings
 */
export const IV_COLORS = {
  EXCELLENT: '#4caf50',
  GOOD: '#8bc34a',
  AVERAGE: '#ffc107',
  BELOW_AVERAGE: '#ff9800',
  POOR: '#f44336',
} as const;

/**
 * Gets the color for an IV range based on the average value
 * @param range - The IV range to get the color for
 * @returns The color string for the IV range
 */
export const getIVColor = (range: { min: number; max: number }): string => {
  const avg = (range.min + range.max) / 2;
  if (avg >= IV_THRESHOLDS.EXCELLENT) return IV_COLORS.EXCELLENT;
  if (avg >= IV_THRESHOLDS.GOOD) return IV_COLORS.GOOD;
  if (avg >= IV_THRESHOLDS.AVERAGE) return IV_COLORS.AVERAGE;
  if (avg >= IV_THRESHOLDS.BELOW_AVERAGE) return IV_COLORS.BELOW_AVERAGE;
  return IV_COLORS.POOR;
};
