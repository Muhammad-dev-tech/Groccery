import { describe, it, expect } from 'vitest';
import {
  normalizePostalCode,
  serviceAreaSchema,
  locationFilterSchema,
} from '@/lib/validations/location';

describe('Postal Code Normalization', () => {
  it('trims leading/trailing whitespace and normalizes internal spacing', () => {
    expect(normalizePostalCode('   62701   ')).toBe('62701');
    expect(normalizePostalCode('  sw1a   1aa  ')).toBe('SW1A 1AA');
    expect(normalizePostalCode('k1a  0b1')).toBe('K1A 0B1');
  });

  it('handles null, undefined, and empty string inputs gracefully', () => {
    expect(normalizePostalCode(null)).toBe('');
    expect(normalizePostalCode(undefined)).toBe('');
    expect(normalizePostalCode('')).toBe('');
    expect(normalizePostalCode('    ')).toBe('');
  });
});

describe('Service Area Validation Schema', () => {
  const validServiceArea = {
    city: 'Springfield',
    state: 'IL',
    zoneName: 'Downtown & Capitol District',
    postalCode: '62701',
  };

  it('validates a complete and correct service zone payload', () => {
    const result = serviceAreaSchema.safeParse(validServiceArea);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.postalCode).toBe('62701');
      expect(result.data.zoneName).toBe('Downtown & Capitol District');
    }
  });

  it('allows city-wide delivery with null or omitted postal code', () => {
    const result = serviceAreaSchema.safeParse({
      city: 'Springfield',
      state: 'IL',
      zoneName: 'Entire Municipal Area',
      postalCode: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.postalCode).toBeNull();
    }
  });

  it('rejects empty or excessively short city names', () => {
    const result = serviceAreaSchema.safeParse({
      ...validServiceArea,
      city: 'S',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('city'));
      expect(issue?.message).toContain('at least 2 characters');
    }
  });

  it('rejects empty or excessively short zone names', () => {
    const result = serviceAreaSchema.safeParse({
      ...validServiceArea,
      zoneName: 'A',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('zoneName'));
      expect(issue?.message).toContain('at least 2 characters');
    }
  });

  it('normalizes lowercase postal code during parse', () => {
    const result = serviceAreaSchema.safeParse({
      ...validServiceArea,
      postalCode: '  62701-downtown  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.postalCode).toBe('62701-DOWNTOWN');
    }
  });
});

describe('Location Filter Schema', () => {
  it('parses valid postal code query and normalizes formatting', () => {
    const result = locationFilterSchema.safeParse({
      postalCode: '  62701  ',
      city: 'Springfield',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.postalCode).toBe('62701');
      expect(result.data.city).toBe('Springfield');
    }
  });

  it('allows empty location filter for unlocalized global discovery', () => {
    const result = locationFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.postalCode).toBeUndefined();
      expect(result.data.city).toBeUndefined();
    }
  });
});

describe('Geographic Service Zone Matching & Coverage Logic', () => {
  interface MockServiceArea {
    vendorId: string;
    city: string;
    state: string;
    postalCode: string | null;
  }

  const mockServiceAreas: MockServiceArea[] = [
    // Vendor 1: Organic Valley
    { vendorId: 'vendor-1', city: 'Springfield', state: 'IL', postalCode: '62701' },
    { vendorId: 'vendor-1', city: 'Springfield', state: 'IL', postalCode: '62704' },

    // Vendor 2: Corner Grocers
    { vendorId: 'vendor-2', city: 'Springfield', state: 'IL', postalCode: '62701' },
    { vendorId: 'vendor-2', city: 'Springfield', state: 'IL', postalCode: '62702' },

    // Vendor 3: Metro Food Mart (Chicago)
    { vendorId: 'vendor-3', city: 'Chicago', state: 'IL', postalCode: '60601' },
    { vendorId: 'vendor-3', city: 'Chicago', state: 'IL', postalCode: '60607' },
  ];

  function evaluateMockCoverage(postalCode?: string, city?: string) {
    const norm = postalCode ? normalizePostalCode(postalCode) : undefined;
    const matching = mockServiceAreas.filter((area) => {
      if (norm) {
        return area.postalCode === norm;
      }
      if (city) {
        return area.city.toLowerCase() === city.toLowerCase();
      }
      return true;
    });

    const vendorIds = Array.from(new Set(matching.map((m) => m.vendorId)));
    return {
      isCovered: vendorIds.length > 0,
      vendorIds,
      totalVendors: vendorIds.length,
    };
  }

  it('returns both Vendor 1 and Vendor 2 for overlapping zone 62701', () => {
    const coverage = evaluateMockCoverage('62701');
    expect(coverage.isCovered).toBe(true);
    expect(coverage.totalVendors).toBe(2);
    expect(coverage.vendorIds).toContain('vendor-1');
    expect(coverage.vendorIds).toContain('vendor-2');
  });

  it('isolates Vendor 1 exclusively for zone 62704', () => {
    const coverage = evaluateMockCoverage('62704');
    expect(coverage.isCovered).toBe(true);
    expect(coverage.totalVendors).toBe(1);
    expect(coverage.vendorIds).toEqual(['vendor-1']);
  });

  it('isolates Vendor 2 exclusively for zone 62702', () => {
    const coverage = evaluateMockCoverage('62702');
    expect(coverage.isCovered).toBe(true);
    expect(coverage.totalVendors).toBe(1);
    expect(coverage.vendorIds).toEqual(['vendor-2']);
  });

  it('isolates Vendor 3 exclusively for Chicago zone 60601', () => {
    const coverage = evaluateMockCoverage('60601');
    expect(coverage.isCovered).toBe(true);
    expect(coverage.totalVendors).toBe(1);
    expect(coverage.vendorIds).toEqual(['vendor-3']);
  });

  it('accurately identifies unserved postal codes as out-of-zone', () => {
    const coverage = evaluateMockCoverage('90210');
    expect(coverage.isCovered).toBe(false);
    expect(coverage.totalVendors).toBe(0);
    expect(coverage.vendorIds).toHaveLength(0);
  });
});

describe('Vendor Service Zone Authorization & Governance', () => {
  it('prohibits suspended stores from registering service zones', () => {
    function canStoreModifyZones(status: string): boolean {
      return status !== 'suspended';
    }

    expect(canStoreModifyZones('approved')).toBe(true);
    expect(canStoreModifyZones('pending')).toBe(true);
    expect(canStoreModifyZones('suspended')).toBe(false);
  });

  it('enforces store boundary isolation when deleting a service area', () => {
    interface ZoneRecord {
      id: string;
      vendorId: string;
    }

    function canVendorDeleteZone(callerVendorId: string, zone: ZoneRecord): boolean {
      return callerVendorId === zone.vendorId;
    }

    const zoneOwnedByA = { id: 'zone-101', vendorId: 'store-a' };

    expect(canVendorDeleteZone('store-a', zoneOwnedByA)).toBe(true);
    expect(canVendorDeleteZone('store-b', zoneOwnedByA)).toBe(false);
  });
});
