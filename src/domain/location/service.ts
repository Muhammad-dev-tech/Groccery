import { createClient } from '@/lib/supabase/server';
import { normalizePostalCode } from '@/lib/validations/location';

export interface ServiceZoneSummary {
  city: string;
  state: string;
  postalCode: string | null;
  zoneName: string;
  vendorCount: number;
}

export interface LocationCoverageResult {
  isCovered: boolean;
  vendorIds: string[];
  totalApprovedVendorsInZone: number;
  activePostalCode?: string;
  activeCity?: string;
  servingVendors: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    zoneName: string;
    postalCode: string | null;
  }>;
}

import { isSupabaseConfigured } from '@/lib/env';

const DEMO_SERVICE_ZONES: ServiceZoneSummary[] = [
  { city: 'Kano', state: 'Kano', postalCode: '700241', zoneName: 'Kano Municipal (Kurmi Market & Kofar Mata)', vendorCount: 2 },
  { city: 'Kano', state: 'Kano', postalCode: '700213', zoneName: 'Nassarawa GRA & Bompai Industrial Area', vendorCount: 2 },
  { city: 'Kano', state: 'Kano', postalCode: '700221', zoneName: 'Fagge & Sabon Gari Commercial District', vendorCount: 2 },
  { city: 'Kano', state: 'Kano', postalCode: '700233', zoneName: 'Gwale & Dorayi Commercial Hub', vendorCount: 1 },
  { city: 'Kano', state: 'Kano', postalCode: '700223', zoneName: 'Tarauni & Gyadi-Gyadi / Farm Centre', vendorCount: 1 },
];

/**
 * Returns distinct active service zones currently served by approved vendors.
 * Used to populate the location switcher modal and marketplace zone pills.
 */
export async function getDistinctServiceZones(): Promise<ServiceZoneSummary[]> {
  if (!isSupabaseConfigured()) {
    return DEMO_SERVICE_ZONES;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendor_service_areas')
    .select(`
      city,
      state,
      postal_code,
      zone_name,
      vendor:vendor_stores!vendor_service_areas_vendor_id_fkey!inner(id, status)
    `)
    .eq('vendor.status', 'approved');

  if (error || !data) {
    if (isSupabaseConfigured()) {
      console.error('[getDistinctServiceZones] Query failed', error);
    }
    return DEMO_SERVICE_ZONES;
  }

  // Aggregate by city + postal_code + zone_name
  const zoneMap = new Map<string, ServiceZoneSummary>();

  for (const row of data) {
    const key = `${row.city}-${row.state}-${row.postal_code || 'ALL'}-${row.zone_name}`;
    const existing = zoneMap.get(key);
    if (existing) {
      existing.vendorCount += 1;
    } else {
      zoneMap.set(key, {
        city: row.city,
        state: row.state,
        postalCode: row.postal_code,
        zoneName: row.zone_name,
        vendorCount: 1,
      });
    }
  }

  return Array.from(zoneMap.values()).sort((a, b) => {
    if (a.city !== b.city) return a.city.localeCompare(b.city);
    return (a.postalCode || '').localeCompare(b.postalCode || '');
  });
}

/**
 * Evaluates whether a target postal code or city is served by approved vendors,
 * and retrieves the matching vendor IDs.
 */
export async function evaluateLocationCoverage(params: {
  postalCode?: string;
  city?: string;
}): Promise<LocationCoverageResult> {
  const normalizedPostal = params.postalCode ? normalizePostalCode(params.postalCode) : undefined;
  const targetCity = params.city?.trim();

  // If no location filter is provided, all approved vendors are in scope
  if (!normalizedPostal && !targetCity) {
    return {
      isCovered: true,
      vendorIds: [],
      totalApprovedVendorsInZone: 0,
      servingVendors: [],
    };
  }

  if (!isSupabaseConfigured()) {
    const demoMatches = [
      { id: 'v0000000-0000-4000-8000-000000000001', name: 'Arewa Organic Superstore', city: 'Kano', state: 'Kano', zoneName: 'Nassarawa GRA & Bompai', postalCode: '700213', codes: ['700213', '700241'] },
      { id: 'v0000000-0000-4000-8000-000000000002', name: 'Kwari & Sabon Gari Provisions', city: 'Kano', state: 'Kano', zoneName: 'Fagge & Sabon Gari', postalCode: '700221', codes: ['700221', '700213'] },
      { id: 'v0000000-0000-4000-8000-000000000003', name: 'Dawanau Grain & Food Mart', city: 'Kano', state: 'Kano', zoneName: 'Kano Municipal', postalCode: '700241', codes: ['700241', '700233', '700223'] },
    ].filter((v) => {
      if (normalizedPostal) return v.codes.includes(normalizedPostal);
      if (targetCity) return v.city.toLowerCase().includes(targetCity.toLowerCase());
      return true;
    });

    const isCovered = demoMatches.length > 0;
    return {
      isCovered,
      vendorIds: demoMatches.map((m) => m.id),
      totalApprovedVendorsInZone: demoMatches.length,
      activePostalCode: normalizedPostal,
      activeCity: targetCity,
      servingVendors: demoMatches,
    };
  }

  const supabase = await createClient();

  // Query service areas with approved vendor details
  let query = supabase
    .from('vendor_service_areas')
    .select(`
      postal_code,
      city,
      state,
      zone_name,
      vendor:vendor_stores!vendor_service_areas_vendor_id_fkey!inner(
        id,
        name,
        city,
        state,
        status
      )
    `)
    .eq('vendor.status', 'approved');

  if (normalizedPostal) {
    query = query.eq('postal_code', normalizedPostal);
  } else if (targetCity) {
    query = query.ilike('city', `%${targetCity}%`);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return {
      isCovered: false,
      vendorIds: [],
      totalApprovedVendorsInZone: 0,
      activePostalCode: normalizedPostal,
      activeCity: targetCity,
      servingVendors: [],
    };
  }

  const vendorMap = new Map<string, {
    id: string;
    name: string;
    city: string;
    state: string;
    zoneName: string;
    postalCode: string | null;
  }>();

  for (const row of data as any[]) {
    if (row.vendor && !vendorMap.has(row.vendor.id)) {
      vendorMap.set(row.vendor.id, {
        id: row.vendor.id,
        name: row.vendor.name,
        city: row.vendor.city,
        state: row.vendor.state,
        zoneName: row.zone_name,
        postalCode: row.postal_code,
      });
    }
  }

  const servingVendors = Array.from(vendorMap.values());
  const vendorIds = servingVendors.map((v) => v.id);

  return {
    isCovered: vendorIds.length > 0,
    vendorIds,
    totalApprovedVendorsInZone: vendorIds.length,
    activePostalCode: normalizedPostal,
    activeCity: targetCity,
    servingVendors,
  };
}

/**
 * Fetches all configured service zones for a vendor store.
 */
export async function getVendorServiceAreas(vendorStoreId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendor_service_areas')
    .select('*')
    .eq('vendor_id', vendorStoreId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getVendorServiceAreas] Query failed', error);
    return [];
  }

  return data || [];
}
