export const BLOOD_COMPATIBILITY: Record<string, string[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'A1B+': ['AB+', 'A1B+'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

export function getCompatibleDonorTypes(recipientBloodType: string): string[] {
  const normalized = recipientBloodType.trim().toUpperCase();
  return BLOOD_COMPATIBILITY[normalized] ?? [normalized];
}

/**
 * Great-circle distance in kilometers between two GPS coordinates
 * using the Haversine formula (ported from Red Line app.py).
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export interface DonorRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  blood_type: string;
  latitude: number | null;
  longitude: number | null;
  distance_km?: number | null;
  source?: 'firestore' | 'directory';
  available?: boolean;
}

/**
 * Filters donors by blood compatibility and sorts nearest-first
 * when requester coordinates are available.
 */
export function matchAndSortDonors(
  donors: DonorRecord[],
  recipientBloodType: string,
  reqLat: number | null,
  reqLng: number | null
): DonorRecord[] {
  const compatibleTypes = getCompatibleDonorTypes(recipientBloodType);
  const matched = donors
    .filter((d) => compatibleTypes.includes(d.blood_type.trim().toUpperCase()))
    .map((d) => {
      let distance_km: number | null = null;
      if (
        reqLat !== null &&
        reqLng !== null &&
        d.latitude !== null &&
        d.longitude !== null
      ) {
        distance_km = haversineDistanceKm(reqLat, reqLng, d.latitude, d.longitude);
      }
      return { ...d, distance_km };
    });

  if (reqLat !== null && reqLng !== null) {
    matched.sort((a, b) => {
      if (a.distance_km !== null && b.distance_km !== null) {
        return a.distance_km - b.distance_km;
      }
      if (a.distance_km !== null) return -1;
      if (b.distance_km !== null) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  return matched;
}
