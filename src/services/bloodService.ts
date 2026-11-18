import { supabase } from '../config/supabase';
import { DIRECTORY_DONORS } from '../data/facilities';
import { DonorRecord } from '../utils/bloodCompatibility';

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
  id_proof_uri: string;
  latitude: number | null;
  longitude: number | null;
}

export interface BloodRequestDoc extends BloodRequestInput {
  id: string;
  status: 'open' | 'fulfilled' | 'cancelled';
}

export async function registerDonor(input: DonationInput): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add your .env credentials.');
  }
  const { data, error } = await supabase
    .from('blood_donations')
    .insert({
      user_id: input.userId,
      name: input.name,
      gender: input.gender,
      email: input.email,
      phone: input.phone,
      blood_type: input.blood_type.trim().toUpperCase(),
      age: input.age,
      weight: input.weight,
      medical_conditions: input.medical_conditions,
      latitude: input.latitude,
      longitude: input.longitude,
      available: true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function submitBloodRequest(input: BloodRequestInput): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add your .env credentials.');
  }
  const { data, error } = await supabase
    .from('blood_requests')
    .insert({
      user_id: input.userId,
      name: input.name,
      gender: input.gender,
      email: input.email,
      phone: input.phone,
      blood_type: input.blood_type.trim().toUpperCase(),
      address: input.address,
      id_proof_uri: input.id_proof_uri,
      latitude: input.latitude,
      longitude: input.longitude,
      status: 'open',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function fetchAllDonors(): Promise<DonorRecord[]> {
  const supabaseDonors: DonorRecord[] = [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('blood_donations')
        .select('id, name, phone, email, blood_type, latitude, longitude, available');

      if (!error && data) {
        for (const d of data) {
          supabaseDonors.push({
            id: d.id,
            name: d.name ?? 'Anonymous Donor',
            phone: d.phone ?? '',
            email: d.email ?? '',
            blood_type: String(d.blood_type ?? '').toUpperCase(),
            latitude: typeof d.latitude === 'number' ? d.latitude : null,
            longitude: typeof d.longitude === 'number' ? d.longitude : null,
            source: 'firestore',
            available: d.available !== false,
          });
        }
      }
    } catch (err) {
      console.warn('Could not load Supabase donors:', err);
    }
  }
  return [...supabaseDonors, ...DIRECTORY_DONORS];
}

export async function fetchUserActivity(userId: string): Promise<{
  donations: DonationDoc[];
  requests: BloodRequestDoc[];
}> {
  if (!supabase) return { donations: [], requests: [] };

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
  if (!supabase) return [];
  const { data } = await supabase
    .from('blood_donations')
    .select('*')
    .order('created_at', { ascending: false });

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
  if (!supabase) return [];
  const { data } = await supabase
    .from('blood_requests')
    .select('*')
    .order('created_at', { ascending: false });

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
  if (!supabase) return;
  await supabase.from('blood_requests').update({ status }).eq('id', requestId);
}
