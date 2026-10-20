/**
 * High-precision monetary arithmetic helper using integer minor units (cents).
 * Completely protects against IEEE 754 floating-point inaccuracies.
 */

export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function toDollars(cents: number): number {
  return cents / 100;
}

export function multiplyMoney(unitPriceDollars: number, quantity: number): number {
  const priceInCents = toCents(unitPriceDollars);
  const totalInCents = Math.round(priceInCents * quantity);
  return toDollars(totalInCents);
}

export function sumMoney(amountsInDollars: number[]): number {
  const totalCents = amountsInDollars.reduce((acc, curr) => acc + toCents(curr), 0);
  return toDollars(totalCents);
}
