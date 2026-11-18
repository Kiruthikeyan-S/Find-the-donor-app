import {
  validateBloodRequestInput,
  validateDonationInput,
} from '../utils/validation';

describe('Input validation', () => {
  test('accepts valid donor registration input', () => {
    const res = validateDonationInput({
      name: 'Test Donor',
      email: 'donor@example.com',
      phone: '9876543210',
      blood_type: 'O+',
      ageStr: '25',
      weightStr: '65',
      latitude: 13.08,
      longitude: 80.27,
    });
    expect(res).toEqual({ valid: true, age: 25, weight: 65 });
  });

  test('rejects invalid email, phone, age, weight, blood group, and coordinates', () => {
    expect(
      validateDonationInput({
        name: 'Test',
        email: 'bad-email',
        phone: '9876543210',
        blood_type: 'O+',
        ageStr: '25',
        weightStr: '65',
        latitude: null,
        longitude: null,
      }).valid
    ).toBe(false);

    expect(
      validateDonationInput({
        name: 'Test',
        email: 'a@b.com',
        phone: '123',
        blood_type: 'O+',
        ageStr: '25',
        weightStr: '65',
        latitude: null,
        longitude: null,
      }).valid
    ).toBe(false);

    expect(
      validateDonationInput({
        name: 'Test',
        email: 'a@b.com',
        phone: '9876543210',
        blood_type: 'A1B+',
        ageStr: '25',
        weightStr: '65',
        latitude: null,
        longitude: null,
      }).valid
    ).toBe(false);

    expect(
      validateDonationInput({
        name: 'Test',
        email: 'a@b.com',
        phone: '9876543210',
        blood_type: 'O+',
        ageStr: '16',
        weightStr: '65',
        latitude: null,
        longitude: null,
      }).valid
    ).toBe(false);

    expect(
      validateDonationInput({
        name: 'Test',
        email: 'a@b.com',
        phone: '9876543210',
        blood_type: 'O+',
        ageStr: '25',
        weightStr: '39',
        latitude: null,
        longitude: null,
      }).valid
    ).toBe(false);
  });

  test('validates blood request input properly', () => {
    expect(
      validateBloodRequestInput({
        name: 'Test Patient',
        email: 'patient@example.com',
        phone: '9876543210',
        blood_type: 'AB-',
        address: 'City Hospital Ward 2',
        latitude: null,
        longitude: null,
      })
    ).toEqual({ valid: true });

    expect(
      validateBloodRequestInput({
        name: '',
        email: '',
        phone: '9876543210',
        blood_type: 'AB-',
        address: 'City Hospital',
        latitude: null,
        longitude: null,
      }).valid
    ).toBe(false);
  });
});
