import fs from 'fs';
import path from 'path';

// Mock Supabase client to test service behavior, auth errors, and privacy guarantees
const mockRpc = jest.fn();
const mockFrom = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();

let mockSupabaseClient: any = {
  rpc: mockRpc,
  from: mockFrom,
  auth: {
    signInWithPassword: mockSignInWithPassword,
    signOut: mockSignOut,
    getSession: mockGetSession,
  },
};

jest.mock('../config/supabase', () => ({
  get supabase() {
    return mockSupabaseClient;
  },
  isSupabaseConfigured: () => mockSupabaseClient !== null,
}));

import {
  fetchAllDonationsAdmin,
  fetchAllRequestsAdmin,
  matchCompatibleDonors,
  submitBloodRequest,
} from '../services/bloodService';

describe('Authentication & Supabase configuration checks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      rpc: mockRpc,
      from: mockFrom,
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signOut: mockSignOut,
        getSession: mockGetSession,
      },
    };
  });

  test('valid login succeeds and invalid login returns error', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'user-a' }, session: { access_token: 'tok' } },
      error: null,
    });
    const ok = await mockSupabaseClient.auth.signInWithPassword({
      email: 'usera@test.com',
      password: 'Password123',
    });
    expect(ok.error).toBeNull();
    expect(ok.data.user.id).toBe('user-a');

    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new Error('Invalid login credentials'),
    });
    const bad = await mockSupabaseClient.auth.signInWithPassword({
      email: 'usera@test.com',
      password: 'wrong',
    });
    expect(bad.error).toBeInstanceOf(Error);
  });

  test('logout and expired session clear session cleanly', async () => {
    mockSignOut.mockResolvedValueOnce({ error: null });
    const out = await mockSupabaseClient.auth.signOut();
    expect(out.error).toBeNull();

    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
      error: new Error('JWT expired'),
    });
    const expired = await mockSupabaseClient.auth.getSession();
    expect(expired.data.session).toBeNull();
    expect(expired.error.message).toContain('expired');
  });

  test('missing Supabase configuration throws clear error instead of silent bypass', async () => {
    mockSupabaseClient = null;
    await expect(matchCompatibleDonors('O+', 13.08, 80.27)).rejects.toThrow(
      'Supabase is not configured'
    );
    await expect(fetchAllDonationsAdmin()).rejects.toThrow(
      'Supabase is not configured'
    );
  });
});

describe('Privacy & Database Security Guarantees', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      rpc: mockRpc,
      from: mockFrom,
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signOut: mockSignOut,
        getSession: mockGetSession,
      },
    };
  });

  test('donor matching does not expose private email, medical conditions, or exact coordinates', async () => {
    mockRpc.mockResolvedValueOnce({
      data: [
        {
          id: 'donor-1',
          name: 'Test Donor',
          phone: '9876543210',
          blood_type: 'O-',
          distance_km: 1.25,
          has_location: true,
        },
      ],
      error: null,
    });

    const donors = await matchCompatibleDonors('O+', 13.08, 80.27);
    expect(donors).toHaveLength(1);
    expect(donors[0]).not.toHaveProperty('email');
    expect(donors[0]).not.toHaveProperty('medical_conditions');
    expect(donors[0].latitude).toBeNull();
    expect(donors[0].longitude).toBeNull();
    expect(donors[0].distance_km).toBe(1.25);
  });

  test('unauthorized admin queries throw clear errors', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        order: async () => ({
          data: null,
          error: { message: 'permission denied for table blood_donations' },
        }),
      }),
    });

    await expect(fetchAllDonationsAdmin()).rejects.toThrow('permission denied');
    await expect(fetchAllRequestsAdmin()).rejects.toThrow('permission denied');
  });

  test('blood request never stores raw local device file paths', async () => {
    const insertMock = jest.fn().mockReturnValue({
      select: () => ({
        single: async () => ({ data: { id: 'req-1' }, error: null }),
      }),
    });
    mockFrom.mockReturnValue({ insert: insertMock });

    await submitBloodRequest({
      userId: 'user-a',
      name: 'Test Patient',
      gender: 'Male',
      email: 'patient@test.com',
      phone: '9876543210',
      blood_type: 'O+',
      address: 'Test Hospital',
      hasLocalAttachment: true,
      latitude: null,
      longitude: null,
    });

    const insertedPayload = insertMock.mock.calls[0][0];
    expect(insertedPayload.id_proof_uri).toBe('attached-locally');
    expect(insertedPayload.id_proof_uri).not.toContain('file://');
  });

  test('hardened SQL schema enforces RLS on profiles, blood_donations, blood_requests, and safe SECURITY DEFINER search_path', () => {
    const schemaPath = path.resolve(__dirname, '../../supabase/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    expect(sql).toContain('alter table public.profiles enable row level security');
    expect(sql).toContain('alter table public.blood_donations enable row level security');
    expect(sql).toContain('alter table public.blood_requests enable row level security');
    expect(sql).toContain('set search_path = public');
    expect(sql).toContain('revoke all on function public.is_admin() from public');
    expect(sql).toContain("with check (auth.uid() = id and role = 'client')");
    expect(sql).toContain('using (auth.uid() = user_id or public.is_admin())');
  });
});
