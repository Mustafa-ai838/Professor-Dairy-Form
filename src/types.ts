export interface Animal {
  id: number;
  tagNo: string;
  breed: string;
  age: string;
  weight: number;
  category: 'Doodh wali' | 'Dry' | 'Gabhan' | 'Bachra' | 'Bail';
  status: 'Faal' | 'Farokht' | 'Maut';
  capacity: number;
  lastVaccine: string;
  healthStatus?: 'Healthy' | 'Vaccinated' | 'Treatment Needed' | 'Critical';
  lastVaccineDate?: string;
  nextVaccineDue?: string;
  temperature?: number;
  healthNotes?: string;
}

export interface VaccineRecord {
  id: number;
  animalTag: string;
  animalName: string;
  breed: string;
  vaccineName: string;
  disease: string;
  diseaseUrdu: string;
  lastGivenDate: string;
  nextDueDate: string;
  frequencyMonths: number;
  dosage: string;
  route: string;
  status: 'Due Soon' | 'Overdue' | 'Upcoming' | 'Completed';
  batchNo: string;
  vetName: string;
  notes: string;
}

export interface HealthIssue {
  id: number;
  animalTag: string;
  date: string;
  diagnosis: string;
  diagnosisUrdu: string;
  severity: 'Mild' | 'Moderate' | 'Critical';
  temperature: number;
  treatment: string;
  medication: string;
  cost: number;
  status: 'Under Treatment' | 'Recovered' | 'Quarantine';
  notes: string;
}

export interface BreedingRecord {
  id: number;
  animalId: string;
  animalName: string;
  breed: string;
  heatDate: string;
  aiDate: string;
  pregnancyCheckDate: string;
  expectedDeliveryDate: string;
  status: 'Open' | 'In Heat' | 'Inseminated' | 'Pregnant' | 'Calved';
  semenDetails: string;
  notes: string;
}

export interface MilkLog {
  id: number;
  date: string;
  morning: number;
  evening: number;
  total: number;
  fat: number;
  snf: number;
  sold: number;
  rate: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  dailyLiters: number;
  rate: number;
  balance: number;
}

export interface PaymentTransaction {
  id: number;
  customerId: number;
  customerName: string;
  date: string;
  type: 'Supply' | 'Payment';
  amountReceived?: number;
  billedAmount?: number;
  liters?: number;
  rate?: number;
  remainingBalance: number;
  method?: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: number;
  date: string;
  category: string;
  amount: number;
  notes: string;
}

export interface FeedRecord {
  id: number;
  date: string;
  feedType: string;
  qtyKg: number;
  cost: number;
  notes: string;
}

export interface SaleRecord {
  id: number;
  date: string;
  animalTag: string;
  buyer: string;
  price: number;
  notes: string;
}

