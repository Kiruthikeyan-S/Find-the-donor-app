import { isValidBloodType, isValidCoordinate } from './bloodCompatibility';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export interface DonationValidationInput {
  name: string;
  email: string;
  phone: string;
  blood_type: string;
  ageStr: string;
  weightStr: string;
  latitude: number | null;
  longitude: number | null;
}

export function validateDonationInput(
  input: DonationValidationInput
): { valid: true; age: number; weight: number } | { valid: false; error: string } {
  if (!input.name.trim()) {
    return { valid: false, error: 'Please enter your full name.' };
  }
  if (!isValidEmail(input.email)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  if (!isValidPhone(input.phone)) {
    return { valid: false, error: 'Please enter a valid phone number (7–15 digits).' };
  }
  if (!isValidBloodType(input.blood_type)) {
    return { valid: false, error: 'Please select a valid ABO/Rh blood group.' };
  }

  const age = Number(input.ageStr.trim());
  if (!Number.isInteger(age) || age < 18 || age > 65) {
    return {
      valid: false,
      error: 'Preliminary age check: donors must be between 18 and 65 years old.',
    };
  }

  const weight = Number(input.weightStr.trim());
  if (!Number.isFinite(weight) || weight < 45 || weight > 300) {
    return {
      valid: false,
      error: 'Preliminary weight check: donors must weigh between 45 kg and 300 kg.',
    };
  }

  if (
    (input.latitude !== null || input.longitude !== null) &&
    !isValidCoordinate(input.latitude, input.longitude)
  ) {
    return { valid: false, error: 'Invalid GPS coordinates.' };
  }

  return { valid: true, age, weight: Math.round(weight) };
}

export interface BloodRequestValidationInput {
  name: string;
  email: string;
  phone: string;
  blood_type: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export function validateBloodRequestInput(
  input: BloodRequestValidationInput
): { valid: true } | { valid: false; error: string } {
  if (!input.name.trim()) {
    return { valid: false, error: 'Please enter the patient or requester name.' };
  }
  if (!isValidPhone(input.phone)) {
    return { valid: false, error: 'Please enter a valid contact phone number (7–15 digits).' };
  }
  if (input.email.trim() && !isValidEmail(input.email)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  if (!isValidBloodType(input.blood_type)) {
    return { valid: false, error: 'Please select a valid ABO/Rh blood group.' };
  }
  if (!input.address.trim() || input.address.trim().length < 5) {
    return { valid: false, error: 'Please enter a valid hospital or delivery address.' };
  }
  if (
    (input.latitude !== null || input.longitude !== null) &&
    !isValidCoordinate(input.latitude, input.longitude)
  ) {
    return { valid: false, error: 'Invalid GPS coordinates.' };
  }

  return { valid: true };
}
