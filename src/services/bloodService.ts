import { supabase } from '../config/supabase';
import {
  DonorRecord,
  isValidBloodType,
  isValidCoordinate,
  matchAndSortDonors,
} from '../utils/bloodCompatibility';

export interface DonationInput {
  userId: string;
  name: string;
  gender: string;
  email: string;
  phone: string;
  blood_type: string;
  age: number;
  weight: number;
  medical_conditions: string;
  latitude: number | null;
  longitude: number | null;
}

export interface DonationDoc extends DonationInput {
  id: string;
  available: boolean;
}

export interface BloodRequestInput {
  userId: string;
  name: string;
  gender: string;
  email: string;
  phone: string;
  blood_type: string;
  address: string;
  hasLocalAttachment?: boolean;
  latitude: number | null;
  longitude: number | null;
}

export interface BloodRequestDoc extends Omit<BloodRequestInput, 'hasLocalAttachment'> {
  id: string;
  id_proof_uri: string;
  status: 'open' | 'fulfilled' | 'cancelled';
}

export async function registerDonor(input: DonationInput): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Check your environment variables.');
  }
  const normalizedBlood = input.blood_type.trim().toUpperCase();
  if (!isValidBloodType(normalizedBlood)) {
    throw new Error('Invalid blood group. Please select one of the 8 standard ABO/Rh groups.');
  }
  if (
    (input.latitude !== null || input.longitude !== null) &&
    !isValidCoordinate(input.latitude, input.longitude)
  ) {
    throw new Error('Invalid GPS coordinates.');
  }

  const { data, error } = await supabase
    .from('blood_donations')
    .insert({
      user_id: input.userId,
      name: input.name.trim(),
      gender: input.gender,
      email: input.email.trim(),
      phone: input.phone.trim(),
      blood_type: normalizedBlood,
      age: input.age,
      weight: input.weight,
      medical_conditions: input.medical_conditions.trim() || 'None',
      latitude: input.latitude,
      longitude: input.longitude,
      available: true,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message || 'Could not save donor registration.');
  }
  return data.id;
}

export async function submitBloodRequest(input: BloodRequestInput): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Check your environment variables.');
  }
  const normalizedBlood = input.blood_type.trim().toUpperCase();
  if (!isValidBloodType(normalizedBlood)) {
    throw new Error('Invalid blood group. Please select one of the 8 standard ABO/Rh groups.');
  }

  // Never store raw local device file paths in shared database rows
  const attachmentMarker = input.hasLocalAttachment ? 'attached-locally' : '';

  const { data, error } = await supabase
    .from('blood_requests')
    .insert({
      user_id: input.userId,
      name: input.name.trim(),
      gender: input.gender,
      email: input.email.trim(),
      phone: input.phone.trim(),
      blood_type: normalizedBlood,
      address: input.address.trim(),
      id_proof_uri: attachmentMarker,
      latitude: input.latitude,
      longitude: input.longitude,
      status: 'open',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message || 'Could not submit blood request.');
  }
  return data.id;
}

/**
 * Privacy-preserving donor matching via Supabase RPC.
 * Returns only compatible, available donors with server-computed distance (no email, medical info, or exact GPS).
 */
export async function matchCompatibleDonors(
  recipientBloodType: string,
  reqLat: number | null,
  reqLng: number | null
): Promise<DonorRecord[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Check your environment variables.');
  }

  const normalizedBlood = recipientBloodType.trim().toUpperCase();
  if (!isValidBloodType(normalizedBlood)) {
    throw new Error('Invalid blood group selected.');
  }

  const validCoords = isValidCoordinate(reqLat, reqLng);

  const { data, error } = await supabase.rpc('match_compatible_donors', {
    recipient_blood_type: normalizedBlood,
    req_lat: validCoords ? reqLat : null,
    req_lng: validCoords ? reqLng : null,
  });

  if (error) {
    throw new Error(error.message || 'Failed to load matching donors.');
  }

  const records: DonorRecord[] = (data ?? []).map((row: any) => ({
    id: String(row.id),
    name: String(row.name ?? 'Donor'),
    phone: String(row.phone ?? ''),
    blood_type: String(row.blood_type ?? '').toUpperCase(),
    latitude: null,
    longitude: null,
    distance_km: typeof row.distance_km === 'number' ? row.distance_km : null,
    available: true,
  }));

  return matchAndSortDonors(records, normalizedBlood, null, null);
}

/**
 * Loads coarse (~1.1 km rounded) donor markers for the map without exposing exact home GPS, email, or medical data.
 */
export async function fetchDonorMapMarkers(): Promise<DonorRecord[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Check your environment variables.');
  }

  const { data, error } = await supabase.rpc('get_donor_map_markers');
  if (error) {
    throw new Error(error.message || 'Failed to load donor map markers.');
  }

  const seen = new Set<string>();
  const markers: DonorRecord[] = [];
  for (const row of data ?? []) {
    const id = String(row.id ?? '');
    if (!id || seen.has(id)) continue;
    seen.add(id);
    markers.push({
      id,
      name: String(row.name ?? 'Donor'),
      phone: String(row.phone ?? ''),
      blood_type: String(row.blood_type ?? '').toUpperCase(),
      latitude: typeof row.approx_latitude === 'number' ? row.approx_latitude : null,
      longitude: typeof row.approx_longitude === 'number' ? row.approx_longitude : null,
      available: true,
    });
  }
  return markers;
}

export async function fetchUserActivity(userId: string): Promise<{
  donations: DonationDoc[];
  requests: BloodRequestDoc[];
}> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const [donRes, reqRes] = await Promise.all([
    supabase
      .from('blood_donations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('blood_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  if (donRes.error) {
    throw new Error(donRes.error.message || 'Could not load your donor registrations.');
  }
  if (reqRes.error) {
    throw new Error(reqRes.error.message || 'Could not load your blood requests.');
  }

  const donations: DonationDoc[] = (donRes.data ?? []).map((d) => ({
    id: d.id,
    userId: d.user_id,
    name: d.name ?? '',
    gender: d.gender ?? 'Other',
    email: d.email ?? '',
    phone: d.phone ?? '',
    blood_type: d.blood_type ?? '',
    age: d.age ?? 18,
    weight: d.weight ?? 50,
    medical_conditions: d.medical_conditions ?? '',
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    available: d.available !== false,
  }));

  const requests: BloodRequestDoc[] = (reqRes.data ?? []).map((d) => ({
    id: d.id,
    userId: d.user_id,
    name: d.name ?? '',
    gender: d.gender ?? 'Other',
    email: d.email ?? '',
    phone: d.phone ?? '',
    blood_type: d.blood_type ?? '',
    address: d.address ?? '',
    id_proof_uri: d.id_proof_uri ?? '',
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    status: d.status ?? 'open',
  }));

  return { donations, requests };
}

export async function fetchAllDonationsAdmin(): Promise<DonationDoc[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }
  const { data, error } = await supabase
    .from('blood_donations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Admin access required to load donations.');
  }

  return (data ?? []).map((d) => ({
    id: d.id,
    userId: d.user_id ?? '',
    name: d.name ?? '',
    gender: d.gender ?? 'Other',
    email: d.email ?? '',
    phone: d.phone ?? '',
    blood_type: d.blood_type ?? '',
    age: d.age ?? 18,
    weight: d.weight ?? 50,
    medical_conditions: d.medical_conditions ?? '',
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    available: d.available !== false,
  }));
}

export async function fetchAllRequestsAdmin(): Promise<BloodRequestDoc[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }
  const { data, error } = await supabase
    .from('blood_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Admin access required to load blood requests.');
  }

  return (data ?? []).map((d) => ({
    id: d.id,
    userId: d.user_id ?? '',
    name: d.name ?? '',
    gender: d.gender ?? 'Other',
    email: d.email ?? '',
    phone: d.phone ?? '',
    blood_type: d.blood_type ?? '',
    address: d.address ?? '',
    id_proof_uri: d.id_proof_uri ?? '',
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    status: d.status ?? 'open',
  }));
}

export async function updateRequestStatus(
  requestId: string,
  status: 'open' | 'fulfilled' | 'cancelled'
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }
  const { error } = await supabase
    .from('blood_requests')
    .update({ status })
    .eq('id', requestId);
  if (error) {
    throw new Error(error.message || 'Could not update request status.');
  }
}
