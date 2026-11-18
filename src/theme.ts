export const COLORS = {
  primary: '#dc2626',
  primaryDark: '#b91c1c',
  primaryLight: '#fee2e2',
  secondary: '#0284c7',
  secondaryLight: '#e0f2fe',
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#d97706',
  warningLight: '#fef3c7',
  bg: '#f8fafc',
  white: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  danger: '#dc2626',
} as const;

export const BLOOD_TYPES = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'A1B+',
] as const;

export type BloodType = (typeof BLOOD_TYPES)[number];

export const GENDERS = ['Male', 'Female', 'Other'] as const;
