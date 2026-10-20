import { describe, it, expect } from 'vitest';
import {
  calculateNormalizedPrice,
  areUnitsComparable,
} from '@/domain/units/normalizer';
import type { ComparisonCandidate } from '@/domain/pricing/comparison';

describe('Cross-Vendor Price Comparison Logic', () => {
  it('correctly compares identical items sold in different pack sizes', () => {
    // Target: 500g for $2.50 -> $5.00 / kg
    const targetNormalized = calculateNormalizedPrice(2.50, 500, 'g');
    expect(targetNormalized.normalizedPricePerBaseUnit).toBeCloseTo(5.00, 2);
    expect(targetNormalized.baseUnit).toBe('kg');

    // Candidate A: 1kg for $4.00 -> $4.00 / kg
    const candidateANormalized = calculateNormalizedPrice(4.00, 1, 'kg');
    expect(candidateANormalized.normalizedPricePerBaseUnit).toBeCloseTo(4.00, 2);

    // Candidate B: 2kg for $7.50 -> $3.75 / kg
    const candidateBNormalized = calculateNormalizedPrice(7.50, 2, 'kg');
    expect(candidateBNormalized.normalizedPricePerBaseUnit).toBeCloseTo(3.75, 2);

    // Percentage savings compared to Target ($5.00/kg)
    // Candidate A saves (5.00 - 4.00) / 5.00 = 20%
    const savingsA =
      ((targetNormalized.normalizedPricePerBaseUnit - candidateANormalized.normalizedPricePerBaseUnit) /
        targetNormalized.normalizedPricePerBaseUnit) *
      100;
    expect(Math.round(savingsA * 10) / 10).toBe(20.0);

    // Candidate B saves (5.00 - 3.75) / 5.00 = 25%
    const savingsB =
      ((targetNormalized.normalizedPricePerBaseUnit - candidateBNormalized.normalizedPricePerBaseUnit) /
        targetNormalized.normalizedPricePerBaseUnit) *
      100;
    expect(Math.round(savingsB * 10) / 10).toBe(25.0);
  });

  it('accurately identifies best value vendor across candidates', () => {
    const candidates: Array<{
      name: string;
      vendor: string;
      price: number;
      quantity: number;
      unit: 'kg' | 'g';
    }> = [
      { name: 'Basmati Rice', vendor: 'Store One', price: 6.99, quantity: 1, unit: 'kg' }, // $6.99/kg
      { name: 'Royal Basmati Rice', vendor: 'Store Two', price: 14.50, quantity: 2.5, unit: 'kg' }, // $5.80/kg (Best!)
      { name: 'Aromatic Basmati', vendor: 'Store Three', price: 3.50, quantity: 500, unit: 'g' }, // $7.00/kg
    ];

    let lowestPrice = Infinity;
    let bestVendor = '';

    for (const c of candidates) {
      const norm = calculateNormalizedPrice(c.price, c.quantity, c.unit);
      if (norm.normalizedPricePerBaseUnit < lowestPrice) {
        lowestPrice = norm.normalizedPricePerBaseUnit;
        bestVendor = c.vendor;
      }
    }

    expect(bestVendor).toBe('Store Two');
    expect(lowestPrice).toBeCloseTo(5.80, 2);
  });

  it('rejects cross-dimension comparison between mass and volume', () => {
    expect(areUnitsComparable('kg', 'l')).toBe(false);
    expect(areUnitsComparable('g', 'ml')).toBe(false);
    expect(areUnitsComparable('kg', 'ml')).toBe(false);
    expect(areUnitsComparable('kg', 'piece')).toBe(false);
  });

  it('approves comparable units within the same dimension', () => {
    // Mass
    expect(areUnitsComparable('kg', 'g')).toBe(true);
    expect(areUnitsComparable('g', 'kg')).toBe(true);

    // Volume
    expect(areUnitsComparable('l', 'ml')).toBe(true);
    expect(areUnitsComparable('ml', 'l')).toBe(true);

    // Discrete
    expect(areUnitsComparable('piece', 'pack')).toBe(true);
    expect(areUnitsComparable('pack', 'bundle')).toBe(true);
  });

  it('flags dimension-incompatible candidate with reason and disables best-value flag', () => {
    const targetUnit = 'kg';
    const candidateUnit = 'l';

    const comparable = areUnitsComparable(targetUnit, candidateUnit);
    expect(comparable).toBe(false);

    const candidate: ComparisonCandidate = {
      id: 'mock-1',
      vendorId: 'v-1',
      vendorName: 'Organic Valley Co',
      vendorCity: 'Seattle',
      vendorState: 'WA',
      name: 'Soy Milk Beverage',
      price: 3.99,
      currency: 'USD',
      packageQuantity: 1,
      unitOfMeasurement: candidateUnit,
      stockQuantity: 15,
      isAvailable: true,
      imageUrl: null,
      isComparable: comparable,
      incompatibilityReason: `Incompatible units (${targetUnit} vs ${candidateUnit}): mass and volume cannot be compared directly.`,
      isBestValue: false,
    };

    expect(candidate.isComparable).toBe(false);
    expect(candidate.incompatibilityReason).toContain('Incompatible units');
    expect(candidate.isBestValue).toBe(false);
  });
});
