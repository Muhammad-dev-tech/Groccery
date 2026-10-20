import { describe, it, expect } from 'vitest';
import { calculateNormalizedPrice, areUnitsComparable } from '@/domain/units/normalizer';
import { toCents, toDollars, multiplyMoney, sumMoney } from '@/domain/money/arithmetic';

describe('Unit Normalizer Engine', () => {
  it('normalizes 500g package correctly to price per kg', () => {
    const result = calculateNormalizedPrice(2.50, 500, 'g');
    expect(result.baseUnit).toBe('kg');
    expect(result.normalizedPricePerBaseUnit).toBe(5.00);
    expect(result.formattedComparison).toBe('$5.00 / kg');
  });

  it('normalizes 2kg package correctly to price per kg', () => {
    const result = calculateNormalizedPrice(8.00, 2, 'kg');
    expect(result.baseUnit).toBe('kg');
    expect(result.normalizedPricePerBaseUnit).toBe(4.00);
    expect(result.formattedComparison).toBe('$4.00 / kg');
  });

  it('normalizes 750ml bottle correctly to price per litre', () => {
    const result = calculateNormalizedPrice(3.75, 750, 'ml');
    expect(result.baseUnit).toBe('l');
    expect(result.normalizedPricePerBaseUnit).toBe(5.00);
    expect(result.formattedComparison).toBe('$5.00 / l');
  });

  it('enforces dimension comparability checks', () => {
    expect(areUnitsComparable('kg', 'g')).toBe(true);
    expect(areUnitsComparable('l', 'ml')).toBe(true);
    expect(areUnitsComparable('piece', 'pack')).toBe(true);
    expect(areUnitsComparable('kg', 'l')).toBe(false);
    expect(areUnitsComparable('g', 'ml')).toBe(false);
    expect(areUnitsComparable('kg', 'piece')).toBe(false);
  });

  it('throws an error on non-positive package quantity', () => {
    expect(() => calculateNormalizedPrice(5.00, 0, 'kg')).toThrow(
      'Package quantity must be strictly greater than zero.'
    );
  });

  it('throws an error on negative price', () => {
    expect(() => calculateNormalizedPrice(-1.00, 1, 'kg')).toThrow(
      'Price cannot be negative.'
    );
  });
});

describe('Monetary Arithmetic Engine', () => {
  it('accurately converts dollars to cents and vice-versa', () => {
    expect(toCents(19.99)).toBe(1999);
    expect(toDollars(1999)).toBe(19.99);
  });

  it('avoids floating-point inaccuracies in multiplication', () => {
    // In JavaScript floating-point, 1.99 * 3 can be 5.970000000000001
    const total = multiplyMoney(1.99, 3);
    expect(total).toBe(5.97);
  });

  it('avoids floating-point drift when summing prices', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in standard IEEE 754 float
    const sum = sumMoney([0.10, 0.20]);
    expect(sum).toBe(0.30);
  });
});
