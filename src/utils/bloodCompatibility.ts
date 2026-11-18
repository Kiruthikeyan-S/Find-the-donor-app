import { BLOOD_TYPES, BloodType } from '../theme';

export const MEDICAL_MATCHING_DISCLAIMER =
  'Software blood group matching is preliminary only and is NOT medical clearance. All transfusions must undergo professional blood typing, compatibility testing, and crossmatching.';

export const BLOOD_COMPATIBILITY: Record<BloodType, readonly BloodType[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

export function isValidBloodType(value: string): value is BloodType {
  const normalized = value.trim().toUpperCase();
  return (BLOOD_TYPES as readonly string[]).includes(normalized);
}

export function getCompatibleDonorTypes(recipientBloodType: string): BloodType[] {
  const normalized = recipientBloodType.trim().toUpperCase();
  if (!isValidBloodType(normalized)) {
    return [];
  }
  return [...BLOOD_COMPATIBILITY[normalized]];
}

export function isValidCoordinate(
  lat: number | null | undefined,
  lng: number | null | undefined
): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Great-circle distance in kilometers between two GPS coordinates
 * using the Haversine formula. Returns null for invalid coordinates.
 */
export function haversineDistanceKm(
  lat1: number | null | undefined,
  lon1: number | null | undefined,
  lat2: number | null | undefined,
  lon2: number | null | undefined
): number | null {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    return null;
  }
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad((lat2 as number) - (lat1 as number));
  const dLon = toRad((lon2 as number) - (lon1 as number));
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1 as number)) *
      Math.cos(toRad(lat2 as number)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export interface DonorRecord {
  id: string;
  name: string;
  phone: string;
  blood_type: string;
  latitude: number | null;
  longitude: number | null;
  distance_km?: number | null;
  available?: boolean;
}

/**
 * Filters donors by availability, validity, deduplication, and blood compatibility,
 * then sorts nearest-first when valid requester coordinates are available.
 */
export function matchAndSortDonors(
  donors: DonorRecord[],
  recipientBloodType: string,
  reqLat: number | null,
  reqLng: number | null
): DonorRecord[] {
  const compatibleTypes = getCompatibleDonorTypes(recipientBloodType);
  if (compatibleTypes.length === 0) {
    return [];
  }

  const hasValidRequesterCoords = isValidCoordinate(reqLat, reqLng);
  const seenIds = new Set<string>();
  const matched: DonorRecord[] = [];

  for (const d of donors) {
    if (!d || typeof d.id !== 'string' || !d.id.trim()) continue;
    if (seenIds.has(d.id)) continue;
    if (d.available !== true) continue;
    if (typeof d.name !== 'string' || !d.name.trim()) continue;

    const normalizedType =
      typeof d.blood_type === 'string' ? d.blood_type.trim().toUpperCase() : '';
    if (!isValidBloodType(normalizedType)) continue;
    if (!compatibleTypes.includes(normalizedType)) continue;

    seenIds.add(d.id);

    const computedDistance = hasValidRequesterCoords
      ? haversineDistanceKm(reqLat, reqLng, d.latitude, d.longitude)
      : null;

    const distance_km =
      computedDistance !== null
        ? computedDistance
        : typeof d.distance_km === 'number' && Number.isFinite(d.distance_km)
        ? Math.round(d.distance_km * 100) / 100
        : null;

    matched.push({
      ...d,
      name: d.name.trim(),
      blood_type: normalizedType,
      distance_km,
    });
  }

  matched.sort((a, b) => {
    if (a.distance_km !== null && a.distance_km !== undefined && b.distance_km !== null && b.distance_km !== undefined) {
      return a.distance_km - b.distance_km;
    }
    if (a.distance_km !== null && a.distance_km !== undefined) return -1;
    if (b.distance_km !== null && b.distance_km !== undefined) return 1;
    return a.name.localeCompare(b.name);
  });

  return matched;
}
