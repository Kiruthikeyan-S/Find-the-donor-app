import { DonorRecord } from '../utils/bloodCompatibility';

export interface MedicalFacility {
  id: string;
  name: string;
  type: 'bank' | 'hospital';
  address: string;
  phone: string;
  stockInfo: string;
  latitude: number;
  longitude: number;
}

export const DEFAULT_CENTER = {
  latitude: 13.0827,
  longitude: 80.2707,
};

export const MEDICAL_FACILITIES: MedicalFacility[] = [
  {
    id: 'fac-1',
    name: 'Red Line Central Blood Bank',
    type: 'bank',
    address: '123 Lifeline Avenue, City Center',
    phone: '+91 98765 43210',
    stockInfo: 'A+, B+, O+, AB+',
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    id: 'fac-2',
    name: 'City General Hospital & Transfusion Unit',
    type: 'hospital',
    address: '45 Emergency Medical Road',
    phone: '+91 98765 11223',
    stockInfo: 'O-, A-, B+',
    latitude: 13.09,
    longitude: 80.28,
  },
  {
    id: 'fac-3',
    name: 'Red Cross Blood Donation Camp',
    type: 'bank',
    address: 'Community Hall, Main Square',
    phone: '+91 98765 99887',
    stockInfo: 'Accepting All Donors (9 AM - 5 PM)',
    latitude: 13.075,
    longitude: 80.26,
  },
  {
    id: 'fac-4',
    name: 'Apollo Emergency Blood Depot',
    type: 'hospital',
    address: '12 Greams Lane',
    phone: '+91 98765 77665',
    stockInfo: '24/7 Emergency Supply',
    latitude: 13.06,
    longitude: 80.25,
  },
];

// Initial verified donor directory seeded from red-line-website/donor/donor_tracking.csv
export const DIRECTORY_DONORS: DonorRecord[] = [
  { id: 'dir-1', name: 'John Doe', email: 'john.doe@example.com', phone: '9949317185', blood_type: 'A+', latitude: 13.085512, longitude: 80.266156, source: 'directory', available: true },
  { id: 'dir-2', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '9199814456', blood_type: 'O+', latitude: 13.08576, longitude: 80.261751, source: 'directory', available: true },
  { id: 'dir-3', name: 'Rahul Kumar', email: 'rahul.kumar@example.com', phone: '9862897907', blood_type: 'AB+', latitude: 13.084934, longitude: 80.277001, source: 'directory', available: true },
  { id: 'dir-4', name: 'Priya Reddy', email: 'priya.reddy@example.com', phone: '9205989530', blood_type: 'A-', latitude: 13.081643, longitude: 80.275443, source: 'directory', available: true },
  { id: 'dir-5', name: 'Kumar Ramesh', email: 'kumar.ramesh@example.com', phone: '9517263474', blood_type: 'O-', latitude: 13.07359, longitude: 80.262477, source: 'directory', available: true },
  { id: 'dir-6', name: 'Anitha Patel', email: 'anitha.patel@example.com', phone: '9848291860', blood_type: 'A-', latitude: 13.079308, longitude: 80.276044, source: 'directory', available: true },
  { id: 'dir-7', name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '9542915948', blood_type: 'A+', latitude: 13.084874, longitude: 80.260765, source: 'directory', available: true },
  { id: 'dir-8', name: 'Deepa Nair', email: 'deepa.nair@example.com', phone: '9723516294', blood_type: 'AB-', latitude: 13.086428, longitude: 80.260724, source: 'directory', available: true },
  { id: 'dir-9', name: 'Sanjay Menon', email: 'sanjay.menon@example.com', phone: '9337117368', blood_type: 'O-', latitude: 13.077391, longitude: 80.270308, source: 'directory', available: true },
  { id: 'dir-10', name: 'Suresh Pillai', email: 'suresh.pillai@example.com', phone: '9249344584', blood_type: 'B+', latitude: 13.07523, longitude: 80.27716, source: 'directory', available: true },
  { id: 'dir-11', name: 'Kavya Rao', email: 'kavya.rao@example.com', phone: '9610005914', blood_type: 'B-', latitude: 13.084165, longitude: 80.278868, source: 'directory', available: true },
  { id: 'dir-12', name: 'Divya Varma', email: 'divya.varma@example.com', phone: '9248745468', blood_type: 'B-', latitude: 13.090539, longitude: 80.262461, source: 'directory', available: true },
];
