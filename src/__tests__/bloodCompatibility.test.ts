import { BLOOD_TYPES, BloodType } from '../theme';
import {
  DonorRecord,
  getCompatibleDonorTypes,
  haversineDistanceKm,
  isValidBloodType,
  matchAndSortDonors,
} from '../utils/bloodCompatibility';

const EXPECTED_COMPATIBILITY: Record<BloodType, BloodType[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

describe('Blood group compatibility (all 8x8 ABO/Rh combinations)', () => {
  test.each(BLOOD_TYPES)(
    'recipient %s matches exact RBC compatibility rules',
    (recipient) => {
      const compatible = getCompatibleDonorTypes(recipient);
      for (const donor of BLOOD_TYPES) {
        const shouldMatch = EXPECTED_COMPATIBILITY[recipient].includes(donor);
        expect(compatible.includes(donor)).toBe(shouldMatch);
      }
    }
  );

  test('rejects unsupported blood groups such as A1B+ and empty strings', () => {
    expect(isValidBloodType('A1B+')).toBe(false);
    expect(isValidBloodType('')).toBe(false);
    expect(isValidBloodType('XYZ')).toBe(false);
    expect(getCompatibleDonorTypes('A1B+')).toEqual([]);
    expect(getCompatibleDonorTypes('invalid')).toEqual([]);
  });
});

describe('Haversine distance calculation', () => {
  test('returns 0 for identical coordinates', () => {
    expect(haversineDistanceKm(13.0827, 80.2707, 13.0827, 80.2707)).toBe(0);
  });

  test('calculates nearby coordinates accurately (~1.1 km per 0.01 deg lat)', () => {
    const dist = haversineDistanceKm(13.08, 80.27, 13.09, 80.27);
    expect(dist).not.toBeNull();
    expect(dist!).toBeGreaterThan(1.0);
    expect(dist!).toBeLessThan(1.2);
  });

  test('calculates distant coordinates accurately (Chennai to Bengaluru ~290 km)', () => {
    const dist = haversineDistanceKm(13.0827, 80.2707, 12.9716, 77.5946);
    expect(dist).not.toBeNull();
    expect(dist!).toBeGreaterThan(280);
    expect(dist!).toBeLessThan(300);
  });

  test('returns null for missing or invalid coordinates', () => {
    expect(haversineDistanceKm(null, 80.27, 13.08, 80.27)).toBeNull();
    expect(haversineDistanceKm(13.08, null, 13.08, 80.27)).toBeNull();
    expect(haversineDistanceKm(95, 80.27, 13.08, 80.27)).toBeNull();
    expect(haversineDistanceKm(13.08, -190, 13.08, 80.27)).toBeNull();
    expect(haversineDistanceKm(NaN, 80.27, 13.08, 80.27)).toBeNull();
    expect(haversineDistanceKm(Infinity, 80.27, 13.08, 80.27)).toBeNull();
  });
});

describe('Donor matching & sorting', () => {
  const sampleDonors: DonorRecord[] = [
    { id: 'd1', name: 'Test Donor Far', phone: '9000000001', blood_type: 'O-', latitude: 13.2, longitude: 80.3, available: true },
    { id: 'd2', name: 'Test Donor Near', phone: '9000000002', blood_type: 'A-', latitude: 13.085, longitude: 80.272, available: true },
    { id: 'd3', name: 'Test Donor Incompatible', phone: '9000000003', blood_type: 'B+', latitude: 13.083, longitude: 80.271, available: true },
    { id: 'd4', name: 'Test Donor Unavailable', phone: '9000000004', blood_type: 'O-', latitude: 13.083, longitude: 80.271, available: false },
    { id: 'd5', name: 'Test Donor No GPS', phone: '9000000005', blood_type: 'A-', latitude: null, longitude: null, available: true },
    { id: 'd2', name: 'Test Donor Near Duplicate', phone: '9000000002', blood_type: 'A-', latitude: 13.085, longitude: 80.272, available: true },
    { id: 'd6', name: '', phone: '9000000006', blood_type: 'O-', latitude: 13.08, longitude: 80.27, available: true },
  ];

  test('returns only compatible, available, valid, deduplicated donors sorted nearest-first', () => {
    const result = matchAndSortDonors(sampleDonors, 'A-', 13.0827, 80.2707);
    expect(result.map((d) => d.id)).toEqual(['d2', 'd1', 'd5']);
    expect(result[0].distance_km).toBeLessThan(result[1].distance_km!);
    expect(result[2].distance_km).toBeNull();
  });

  test('handles missing requester GPS without crashing', () => {
    const result = matchAndSortDonors(sampleDonors, 'A-', null, null);
    expect(result.map((d) => d.id)).toEqual(['d1', 'd2', 'd5']);
    expect(result.every((d) => d.distance_km === null)).toBe(true);
  });

  test('handles empty donor list safely', () => {
    expect(matchAndSortDonors([], 'O+', 13.08, 80.27)).toEqual([]);
  });
});
