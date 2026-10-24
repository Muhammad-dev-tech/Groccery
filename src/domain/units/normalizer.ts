import type { UnitOfMeasure } from '@/types/database.types';

export type Dimension = 'mass' | 'volume' | 'count';

export interface UnitDefinition {
  dimension: Dimension;
  baseUnit: string;
  multiplierToBase: number; // Multiplier to reach the base unit (e.g., g -> kg is 0.001)
}

export const UNIT_DEFINITIONS: Record<UnitOfMeasure, UnitDefinition> = {
  kg: { dimension: 'mass', baseUnit: 'kg', multiplierToBase: 1.0 },
  g: { dimension: 'mass', baseUnit: 'kg', multiplierToBase: 0.001 },
  l: { dimension: 'volume', baseUnit: 'l', multiplierToBase: 1.0 },
  ml: { dimension: 'volume', baseUnit: 'l', multiplierToBase: 0.001 },
  piece: { dimension: 'count', baseUnit: 'piece', multiplierToBase: 1.0 },
  pack: { dimension: 'count', baseUnit: 'pack', multiplierToBase: 1.0 },
  bundle: { dimension: 'count', baseUnit: 'bundle', multiplierToBase: 1.0 },
};

export interface NormalizedPriceResult {
  baseUnit: string;
  normalizedPricePerBaseUnit: number;
  totalQuantityInBaseUnit: number;
  formattedComparison: string;
}

/**
 * Calculates normalized price per base unit (e.g. price per 1 kg or price per 1 L)
 * Throws an explicit error if input quantity or price is non-positive.
 */
export function calculateNormalizedPrice(
  price: number,
  packageQuantity: number,
  unit: UnitOfMeasure
): NormalizedPriceResult {
  if (price < 0) {
    throw new Error('Price cannot be negative.');
  }
  if (packageQuantity <= 0) {
    throw new Error('Package quantity must be strictly greater than zero.');
  }

  const def = UNIT_DEFINITIONS[unit];
  if (!def) {
    throw new Error(`Unsupported unit of measurement: ${unit}`);
  }

  const totalQuantityInBaseUnit = packageQuantity * def.multiplierToBase;
  if (totalQuantityInBaseUnit <= 0) {
    throw new Error('Total quantity calculation resulted in zero or negative value.');
  }

  const normalizedPricePerBaseUnit = price / totalQuantityInBaseUnit;

  return {
    baseUnit: def.baseUnit,
    normalizedPricePerBaseUnit: Math.round(normalizedPricePerBaseUnit * 100) / 100,
    totalQuantityInBaseUnit,
    formattedComparison: `₦${(Math.round(normalizedPricePerBaseUnit * 100) / 100).toFixed(2)} / ${def.baseUnit}`,
  };
}

/**
 * Verifies if two units belong to the same dimension and can be safely compared.
 */
export function areUnitsComparable(unitA: UnitOfMeasure, unitB: UnitOfMeasure): boolean {
  const defA = UNIT_DEFINITIONS[unitA];
  const defB = UNIT_DEFINITIONS[unitB];

  if (!defA || !defB) return false;
  return defA.dimension === defB.dimension;
}
