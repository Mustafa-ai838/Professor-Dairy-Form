/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Milk,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  HeartPulse,
  Scale,
  Users,
  Wheat,
  PlusCircle,
  X,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Info,
  Download,
  FileSpreadsheet,
  Clock,
  Bell,
  Sparkles,
  AlertCircle,
  Baby,
  Dna,
  ChevronLeft,
  CalendarDays,
  Check,
  Stethoscope,
  Syringe,
  ShoppingCart,
  Database,
  ArrowUpDown,
  Upload
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import {
  Animal,
  VaccineRecord,
  HealthIssue,
  BreedingRecord,
  MilkLog,
  Customer,
  PaymentTransaction,
  ExpenseRecord,
  FeedRecord,
  SaleRecord
} from './types';
import { initialAnimals, initialVaccineRecords, initialHealthIssues } from './data/initialData';
import { HealthTab } from './components/HealthTab';
import { StickyQuickActionMenu } from './components/StickyQuickActionMenu';
import { QuickActionModals } from './components/QuickActionModals';
import { dairyDb, DB_KEYS } from './services/db';

interface FinancialMonthData {
  month: string;
  monthUrdu: string;
  income: number;
  expenses: number;
  profit: number;
  feedExpense: number;
}

const financialTrendsData: FinancialMonthData[] = [
  { month: 'May', monthUrdu: 'May', income: 640000, expenses: 360000, profit: 280000, feedExpense: 240000 },
  { month: 'Jun', monthUrdu: 'June', income: 680000, expenses: 375000, profit: 305000, feedExpense: 252000 },
  { month: 'Jul', monthUrdu: 'July', income: 710000, expenses: 390000, profit: 320000, feedExpense: 260000 },
  { month: 'Aug', monthUrdu: 'August', income: 695000, expenses: 380000, profit: 315000, feedExpense: 255000 },
  { month: 'Sep', monthUrdu: 'September', income: 735000, expenses: 385000, profit: 350000, feedExpense: 258000 },
  { month: 'Oct', monthUrdu: 'October', income: 758500, expenses: 392000, profit: 366500, feedExpense: 265000 },
];

const CustomFinancialTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as FinancialMonthData;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-gray-200 text-right text-xs space-y-1.5 min-w-[210px]">
        <div className="font-bold text-gray-800 border-b pb-1 flex justify-between items-center">
          <span className="font-['Noto_Nastaliq_Urdu']">{data.monthUrdu} (2026)</span>
          <span className="text-[10px] text-gray-400 font-mono">{data.month}</span>
        </div>
        <div className="flex justify-between items-center text-emerald-800">
          <span className="font-semibold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1B5E20]"></span>
            <span>Monthly Income:</span>
          </span>
          <span className="font-bold">Rs. {data.income.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-rose-700">
          <span className="font-semibold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>Monthly Expenses:</span>
          </span>
          <span className="font-bold">Rs. {data.expenses.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-[#e65100] pt-1 border-t border-gray-100 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8F00]"></span>
            <span>Net Profit:</span>
          </span>
          <span>Rs. {data.profit.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};


// 280 دن کی اوسط مدت حمل اور کاؤنٹ ڈاؤن کیلکولیٹر (280-Day Gestation & Countdown Helper)
function calculateGestation(aiDateStr: string, status: string, breed: string = '') {
  if (!aiDateStr) {
    return {
      expectedDeliveryDate: '-',
      daysElapsed: 0,
      daysRemaining: 0,
      progressPercent: 0,
      trimester: '-',
      isDueSoon: false,
      isOverdue: false,
      dryOffDate: '-'
    };
  }

  // بھینس 310 دن، گائے 280 دن
  const gestationPeriod = (breed.includes('بھینس') || breed.includes('Buffalo') || breed.includes('راوی')) ? 310 : 280;
  
  const aiDate = new Date(aiDateStr);
  const expectedDate = new Date(aiDate.getTime() + gestationPeriod * 24 * 60 * 60 * 1000);
  const today = new Date('2026-10-21'); // لائیو فارم ڈیٹ
  
  const diffTime = today.getTime() - aiDate.getTime();
  const daysElapsed = Math.max(0, Math.floor(diffTime / (24 * 60 * 60 * 1000)));
  const daysRemaining = Math.max(0, Math.floor((expectedDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));
  const progressPercent = Math.min(100, Math.max(0, Math.round((daysElapsed / gestationPeriod) * 100)));

  // ڈرائی آف تاریخ (ولادت سے 60 دن قبل دودھ دوہنا بند کرنا)
  const dryOffDateObj = new Date(expectedDate.getTime() - 60 * 24 * 60 * 60 * 1000);

  let trimester = '1st Trimester - Early Development';
  if (daysElapsed > (gestationPeriod * 0.66)) {
    trimester = '3rd Trimester - Preparing for Calving';
  } else if (daysElapsed > (gestationPeriod * 0.33)) {
    trimester = '2nd Trimester - Rapid Growth';
  }

  return {
    expectedDeliveryDate: expectedDate.toISOString().split('T')[0],
    daysElapsed,
    daysRemaining,
    progressPercent,
    trimester,
    isDueSoon: daysRemaining <= 35 && (status === 'Pregnant' || status === 'Inseminated'),
    isOverdue: daysRemaining === 0 && daysElapsed >= gestationPeriod && status === 'Pregnant',
    dryOffDate: dryOffDateObj.toISOString().split('T')[0]
  };
}

export default function App() {
  // اسٹیٹس برائے ٹیب اور موڈ
  const [activeTab, setActiveTab] = useState<'dashboard' | 'herd' | 'milk' | 'finance' | 'feed' | 'breeding' | 'health' | 'weight' | 'customers'>('dashboard');
  
  // ہارڈ ڈسک خالی جگہ اسٹیٹ (Requirement: Auto Free Space Check)
  const [freeSpaceMB, setFreeSpaceMB] = useState<number>(755000); // 755 GB
  const [isLowSpace, setIsLowSpace] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);

  // موڈل اوپننگ اسٹیٹس
  const [showAddMilkModal, setShowAddMilkModal] = useState<boolean>(false);
  const [showAddAnimalModal, setShowAddAnimalModal] = useState<boolean>(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState<boolean>(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentCustomerId, setPaymentCustomerId] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Quick Action Modal & DB Confirmation States
  const [showQuickModalType, setShowQuickModalType] = useState<'milk' | 'expense' | 'feed' | 'health' | 'breeding' | 'sale' | 'calved' | 'vitals' | 'vaccine' | null>(null);
  const [selectedPregnantAnimalTag, setSelectedPregnantAnimalTag] = useState<string>('PK-106');
  const [dbSavedConfirmation, setDbSavedConfirmation] = useState<string | null>(null);

  const triggerDbSaveNotice = (msg: string) => {
    setDbSavedConfirmation(msg);
    setTimeout(() => setDbSavedConfirmation(null), 3500);
  };

  // Sortable dropdown state for Pregnancy Countdown ('due_date' | 'days_elapsed')
  const [pregnancySortBy, setPregnancySortBy] = useState<'due_date' | 'days_elapsed'>('due_date');
  const [showDbManagerModal, setShowDbManagerModal] = useState<boolean>(false);

  // بریڈنگ اور حمل کاؤنٹ ڈاؤن اسٹیٹس (Breeding & Gestation State)
  const [breedingViewMode, setBreedingViewMode] = useState<'list' | 'calendar'>('list');
  const [breedingFilterStatus, setBreedingFilterStatus] = useState<string>('All');
  const [breedingSearchTerm, setBreedingSearchTerm] = useState<string>('');
  const [showAddBreedingModal, setShowAddBreedingModal] = useState<boolean>(false);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState<number>(1); // Default to Nov 2026 where upcoming calvings occur
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // نیا بریڈنگ فارم اسٹیٹ
  const [newBreedingAnimalId, setNewBreedingAnimalId] = useState<string>('PK-104');
  const [newBreedingHeatDate, setNewBreedingHeatDate] = useState<string>('2026-10-20');
  const [newBreedingAiDate, setNewBreedingAiDate] = useState<string>('2026-10-21');
  const [newBreedingPdDate, setNewBreedingPdDate] = useState<string>('2026-12-20');
  const [newBreedingStatus, setNewBreedingStatus] = useState<'Open' | 'In Heat' | 'Inseminated' | 'Pregnant'>('Pregnant');
  const [newBreedingSemen, setNewBreedingSemen] = useState<string>('Premium Sahiwal Champion Semen');
  const [newBreedingNotes, setNewBreedingNotes] = useState<string>('');

  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>(() => {
    const saved = localStorage.getItem('dairy_breeding');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 1,
        animalId: 'PK-106',
        animalName: 'Sahiwal Cow #106',
        breed: 'Sahiwal Cow',
        heatDate: '2026-02-13',
        aiDate: '2026-02-14',
        pregnancyCheckDate: '2026-04-20',
        expectedDeliveryDate: '2026-11-21',
        status: 'Pregnant',
        semenDetails: 'Imported American Friesian semen (Batch #992)',
        notes: 'Pregnancy confirmed by ultrasound; health is excellent.'
      },
      {
        id: 2,
        animalId: 'PK-102',
        animalName: 'Nili Ravi Buffalo #102',
        breed: 'Nili Ravi Buffalo',
        heatDate: '2026-01-14',
        aiDate: '2026-01-15',
        pregnancyCheckDate: '2026-03-25',
        expectedDeliveryDate: '2026-11-21',
        status: 'Pregnant',
        semenDetails: 'Premium Nili Ravi natural bull mating',
        notes: 'The dry-off period is complete. Prepare a separate calving pen.'
      },
      {
        id: 3,
        animalId: 'PK-101',
        animalName: 'Sahiwal Cow #101',
        breed: 'Sahiwal Cow',
        heatDate: '2026-05-09',
        aiDate: '2026-05-10',
        pregnancyCheckDate: '2026-07-15',
        expectedDeliveryDate: '2027-02-14',
        status: 'Pregnant',
        semenDetails: 'Sahiwal beef semen',
        notes: 'In the sixth month of pregnancy; vitamins and minerals are being provided.'
      },
      {
        id: 4,
        animalId: 'PK-103',
        animalName: 'Friesian Cross #103',
        breed: 'Friesian Cross',
        heatDate: '2026-09-18',
        aiDate: '2026-09-19',
        pregnancyCheckDate: '2026-11-05',
        expectedDeliveryDate: '2027-06-26',
        status: 'Inseminated',
        semenDetails: 'Dutch Friesian semen (Top Milking Line)',
        notes: 'Inseminated. Schedule a pregnancy diagnosis test with the veterinarian on November 5.'
      },
      {
        id: 5,
        animalId: 'PK-104',
        animalName: 'Cholistani Cow #104',
        breed: 'Cholistani Cow',
        heatDate: '2026-10-20',
        aiDate: '',
        pregnancyCheckDate: '',
        expectedDeliveryDate: '',
        status: 'In Heat',
        semenDetails: 'Awaiting insemination',
        notes: 'Heat signs have been present since yesterday evening. Arrange insemination this afternoon.'
      },
      {
        id: 6,
        animalId: 'PK-105',
        animalName: 'Nili Ravi Buffalo #105',
        breed: 'Nili Ravi Buffalo',
        heatDate: '2026-09-28',
        aiDate: '',
        pregnancyCheckDate: '',
        expectedDeliveryDate: '',
        status: 'Open',
        semenDetails: '-',
        notes: 'Not pregnant; waiting for the next heat cycle.'
      }
    ];
  });

  // لائیو ڈیٹا ٹیبلز مع خودکار مستقل ڈیٹا بیس (Persistent Database Tables Architecture)
  const [animals, setAnimals] = useState<Animal[]>(() => {
    return dairyDb.getTable<Animal>(DB_KEYS.ANIMALS, 'dairy_animals', initialAnimals);
  });

  const [vaccineRecords, setVaccineRecords] = useState<VaccineRecord[]>(() => {
    return dairyDb.getTable<VaccineRecord>(DB_KEYS.VACCINES, 'dairy_vaccines', initialVaccineRecords);
  });

  const [healthIssues, setHealthIssues] = useState<HealthIssue[]>(() => {
    return dairyDb.getTable<HealthIssue>(DB_KEYS.HEALTH, 'dairy_health_issues', initialHealthIssues);
  });

  const [milkLogs, setMilkLogs] = useState<MilkLog[]>(() => {
    return dairyDb.getTable<MilkLog>(DB_KEYS.MILK, 'dairy_milk_logs', [
      { id: 1, date: '2026-10-21', morning: 42.5, evening: 36.0, total: 78.5, fat: 5.8, snf: 8.9, sold: 72.0, rate: 190 },
      { id: 2, date: '2026-10-20', morning: 41.0, evening: 37.5, total: 78.5, fat: 5.7, snf: 8.8, sold: 73.0, rate: 190 },
      { id: 3, date: '2026-10-19', morning: 43.0, evening: 36.0, total: 79.0, fat: 5.9, snf: 8.9, sold: 74.0, rate: 190 },
      { id: 4, date: '2026-10-18', morning: 40.5, evening: 35.5, total: 76.0, fat: 5.6, snf: 8.7, sold: 70.0, rate: 190 },
      { id: 5, date: '2026-10-17', morning: 42.0, evening: 36.5, total: 78.5, fat: 5.8, snf: 8.9, sold: 73.0, rate: 190 },
    ]);
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    return dairyDb.getTable<Customer>(DB_KEYS.CUSTOMERS, 'dairy_customers', [
      { id: 1, name: 'Malik Asghar Center, Gulberg', phone: '0300-1234567', address: 'Main Market, Lahore', dailyLiters: 40.0, rate: 190, balance: 18500 },
      { id: 2, name: 'Chaudhry Riaz Sweets', phone: '0321-9876543', address: 'Model Town, Sahiwal', dailyLiters: 25.0, rate: 195, balance: 8400 },
      { id: 3, name: 'Haji Tanvir (Household Customer)', phone: '0333-5551234', address: 'Civil Lines, Sahiwal', dailyLiters: 5.0, rate: 210, balance: 1200 },
      { id: 4, name: 'Bismillah Dairy Shop', phone: '0301-4447788', address: 'Lari Adda, Chunian', dailyLiters: 20.0, rate: 185, balance: 0 },
    ]);
  });

  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>(() => {
    return dairyDb.getTable<PaymentTransaction>(DB_KEYS.PAYMENTS, 'dairy_payment_history', [
      { id: 101, customerId: 1, customerName: 'Malik Asghar Center, Gulberg', date: '2026-10-21', type: 'Payment', amountReceived: 10000, remainingBalance: 18500, method: 'Cash', notes: 'Weekly partial payment' },
      { id: 102, customerId: 1, customerName: 'Malik Asghar Center, Gulberg', date: '2026-10-20', type: 'Supply', liters: 40, rate: 190, billedAmount: 7600, amountReceived: 0, remainingBalance: 28500, method: 'Daily Supply', notes: 'Delivered 40 liters of milk in the morning' },
      { id: 103, customerId: 2, customerName: 'Chaudhry Riaz Sweets', date: '2026-10-21', type: 'Payment', amountReceived: 5000, remainingBalance: 8400, method: 'Online Transfer', notes: 'Meezan Bank transfer' },
      { id: 104, customerId: 2, customerName: 'Chaudhry Riaz Sweets', date: '2026-10-19', type: 'Supply', liters: 25, rate: 195, billedAmount: 4875, amountReceived: 0, remainingBalance: 13400, method: 'Daily Supply', notes: 'Pure buffalo milk' },
      { id: 105, customerId: 3, customerName: 'Haji Tanvir (Household Customer)', date: '2026-10-20', type: 'Supply', liters: 5, rate: 210, billedAmount: 1050, amountReceived: 0, remainingBalance: 1200, method: 'Daily Supply', notes: 'Home delivery' },
      { id: 106, customerId: 4, customerName: 'Bismillah Dairy Shop', date: '2026-10-21', type: 'Payment', amountReceived: 3700, remainingBalance: 0, method: 'Cash', notes: 'Account paid in full' },
    ]);
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    return dairyDb.getTable<ExpenseRecord>(DB_KEYS.EXPENSES, 'dairy_expenses', [
      { id: 1, date: '2026-10-21', category: 'Feed & Ration', amount: 12500, notes: 'Green fodder and Vanda supply' },
      { id: 2, date: '2026-10-20', category: 'Medicines & Veterinary Care', amount: 3200, notes: 'Antibiotics and mineral supplements' },
      { id: 3, date: '2026-10-18', category: 'Labor & Wages', amount: 15000, notes: 'Weekly wages for farm staff' }
    ]);
  });

  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>(() => {
    return dairyDb.getTable<FeedRecord>(DB_KEYS.FEED, 'dairy_feed', [
      { id: 1, date: '2026-10-21', feedType: 'Lucerne Green Fodder', qtyKg: 280, cost: 4200, notes: 'Distributed to all cows morning and evening' },
      { id: 2, date: '2026-10-21', feedType: 'Formula Vanda No. 1 (Dairy Concentrate)', qtyKg: 75, cost: 7125, notes: 'Special ration for milking cows' },
      { id: 3, date: '2026-10-20', feedType: 'Wheat Straw', qtyKg: 120, cost: 1800, notes: 'Dry fodder mix' }
    ]);
  });

  const [saleRecords, setSaleRecords] = useState<SaleRecord[]>(() => {
    return dairyDb.getTable<SaleRecord>(DB_KEYS.SALES, 'dairy_sales', [
      { id: 1, date: '2026-10-15', animalTag: 'PK-098', buyer: 'Haji Bashir, Sahiwal Cattle Market', price: 285000, notes: 'Male calf sold for Eid beef preparation' }
    ]);
  });

  // خودکار مستقل ڈیٹا بیس ہم وقت سازی (Automatic Realtime Persistence to DB Tables)
  useEffect(() => {
    dairyDb.saveTable(DB_KEYS.ANIMALS, animals);
    localStorage.setItem('dairy_animals', JSON.stringify(animals));
  }, [animals]);

  useEffect(() => {
    dairyDb.saveTable(DB_KEYS.VACCINES, vaccineRecords);
    localStorage.setItem('dairy_vaccines', JSON.stringify(vaccineRecords));
  }, [vaccineRecords]);

  useEffect(() => {
    dairyDb.saveTable(DB_KEYS.HEALTH, healthIssues);
    localStorage.setItem('dairy_health_issues', JSON.stringify(healthIssues));
  }, [healthIssues]);

  useEffect(() => {
    dairyDb.saveTable(DB_KEYS.BREEDING, breedingRecords);
    localStorage.setItem('dairy_breeding', JSON.stringify(breedingRecords));
  }, [breedingRecords]);

  useEffect(() => {
    dairyDb.saveTable(DB_KEYS.MILK, milkLogs);
    localStorage.setItem('dairy_milk_logs', JSON.stringify(milkLogs));
  }, [milkLogs]);

  useEffect(() => {
    dairyDb.saveTable(DB_KEYS.CUSTOMERS, customers);
    localStorage.setItem('dairy_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    dairyDb.saveTable(DB_KEYS.PAYMENTS, paymentHistory);
    localStorage.setItem('dairy_payment_history', JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  useEffect(() => {
    dairyDb.saveTable(DB_KEYS.EXPENSES, expenses);
  }, [expenses]);

  useEffect(() => {
    dairyDb.saveTable(DB_KEYS.FEED, feedRecords);
  }, [feedRecords]);

  useEffect(() => {
    dairyDb.saveTable(DB_KEYS.SALES, saleRecords);
  }, [saleRecords]);


  // گاہکوں کے بقایا جات لیجر کو CSV میں ایکسپورٹ کرنے کا فنکشن (Export Balances to CSV)
  const exportCustomerKhataCSV = () => {
    const headers = [
      'ID',
      'Customer Name',
      'Phone Number',
      'Address',
      'Daily Milk Supply (Liters)',
      'Rate per Liter (PKR)',
      'Outstanding Balance (PKR)',
      'Account Status'
    ];

    const rows = customers.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      c.dailyLiters,
      c.rate,
      c.balance,
      c.balance > 0 ? 'Due' : 'Cleared'
    ]);

    // UTF-8 BOM (\uFEFF) برائے ایکسل میں اردو کے درست ڈسپلے
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Customer_Khata_Balances_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // ادائیگیوں اور سپلائی کی مکمل ہسٹری CSV ایکسپورٹ فنکشن (Export Payment History to CSV)
  const exportPaymentHistoryCSV = (targetCustomerId?: number) => {
    const recordsToExport = targetCustomerId
      ? paymentHistory.filter(p => p.customerId === targetCustomerId)
      : paymentHistory;

    const headers = [
      'Transaction ID',
      'Date',
      'Customer Name',
      'Transaction Type',
      'Milk (Liters)',
      'Rate per Liter (PKR)',
      'Billed Amount (PKR)',
      'Payment Received (PKR)',
      'Remaining Balance (PKR)',
      'Payment Method',
      'Remarks / Notes'
    ];

    const rows = recordsToExport.map(p => [
      p.id,
      p.date,
      `"${p.customerName.replace(/"/g, '""')}"`,
      p.type === 'Supply' ? 'Milk Supply' : 'Payment Received',
      p.liters || 0,
      p.rate || 0,
      p.billedAmount || 0,
      p.amountReceived || 0,
      p.remainingBalance,
      `"${p.method || 'Cash'}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = targetCustomerId
      ? `Customer_Payment_History_ID_${targetCustomerId}_${new Date().toISOString().split('T')[0]}.csv`
      : `Complete_Dairy_Payment_History_${new Date().toISOString().split('T')[0]}.csv`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // گاہک سے نئی وصولی درج کرنا (Record Payment Handler)
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (freeSpaceMB < 500) {
      alert("Warning: Storage space is low. Delete old data. Less than 500 MB is available.");
      return;
    }

    const cust = customers.find(c => c.id === Number(paymentCustomerId));
    if (!cust) return;

    const amt = Number(paymentAmount);
    const newBal = Math.max(0, cust.balance - amt);

    // گاہک کا بیلنس اپڈیٹ کریں
    setCustomers(customers.map(c => c.id === cust.id ? { ...c, balance: newBal } : c));

    // ہسٹری میں نیا ریکارڈ ڈالیں
    const newTransaction: PaymentTransaction = {
      id: Date.now(),
      customerId: cust.id,
      customerName: cust.name,
      date: new Date().toISOString().split('T')[0],
      type: 'Payment',
      amountReceived: amt,
      remainingBalance: newBal,
      method: paymentMethod,
      notes: paymentNotes || 'New payment recorded'
    };
    setPaymentHistory([newTransaction, ...paymentHistory]);
    setShowRecordPaymentModal(false);
    setPaymentAmount(0);
    setPaymentNotes('');
    alert(`Payment of PKR ${amt.toLocaleString()} received from ${cust.name}. New balance: PKR ${newBal.toLocaleString()}.`);
  };

  // ہیلتھ و ویکسینیشن ہینڈلرز (Health & Vaccination Actions)
  const handleAdministerVaccine = (vaccineId: number) => {
    const today = new Date().toISOString().split('T')[0];
    const rec = vaccineRecords.find(v => v.id === vaccineId);
    if (!rec) return;

    // Calculate next due date (+ frequencyMonths)
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + (rec.frequencyMonths || 6));
    const nextDueStr = dueDate.toISOString().split('T')[0];

    const updated = vaccineRecords.map(v => v.id === vaccineId ? {
      ...v,
      lastGivenDate: today,
      nextDueDate: nextDueStr,
      status: 'Completed' as const
    } : v);
    setVaccineRecords(updated);

    // Update animal status
    setAnimals(animals.map(a => a.tagNo === rec.animalTag ? {
      ...a,
      healthStatus: 'Vaccinated',
      lastVaccine: rec.vaccineName,
      lastVaccineDate: today,
      nextVaccineDue: nextDueStr
    } : a));

    triggerDbSaveNotice(`Vaccine ${rec.vaccineName} administered to animal ${rec.animalTag}. Next due date: ${nextDueStr}`);
  };

  const handleAddVaccineRecord = (newVac: Omit<VaccineRecord, 'id'>) => {
    const item: VaccineRecord = { ...newVac, id: Date.now() };
    setVaccineRecords([item, ...vaccineRecords]);
    triggerDbSaveNotice(`Vaccination schedule saved: ${newVac.vaccineName}`);
  };

  const handleAddHealthIssue = (issue: Omit<HealthIssue, 'id'>) => {
    const item: HealthIssue = { ...issue, id: Date.now() };
    setHealthIssues([item, ...healthIssues]);
    setAnimals(animals.map(a => a.tagNo === issue.animalTag ? {
      ...a,
      healthStatus: 'Treatment Needed',
      temperature: issue.temperature,
      healthNotes: issue.diagnosis
    } : a));
    triggerDbSaveNotice(`Medical examination and treatment recorded: ${issue.animalTag} (${issue.diagnosis})`);
  };

  const handleMarkIssueRecovered = (issueId: number) => {
    const issue = healthIssues.find(h => h.id === issueId);
    if (!issue) return;
    setHealthIssues(healthIssues.map(h => h.id === issueId ? { ...h, status: 'Recovered' as const } : h));
    setAnimals(animals.map(a => a.tagNo === issue.animalTag ? { ...a, healthStatus: 'Healthy' } : a));
    triggerDbSaveNotice(`Animal ${issue.animalTag} has recovered.`);
  };

  const handleUpdateAnimalHealthStatus = (animalTag: string, status: Animal['healthStatus']) => {
    setAnimals(animals.map(a => a.tagNo === animalTag ? { ...a, healthStatus: status } : a));
    triggerDbSaveNotice(`Health status updated for animal ${animalTag}: ${status}`);
  };

  const handleMarkAsCalved = (motherTag: string, calfGender: 'Male' | 'Female', calfWeight: number, birthDate: string, calfTag: string, ease: string) => {
    // 1. Mother becomes 'Doodh wali'
    setAnimals(prev => {
      const updatedMother = prev.map(a => a.tagNo === motherTag ? {
        ...a,
        category: 'Doodh wali' as const,
        status: 'Faal' as const,
        healthStatus: 'Healthy' as const
      } : a);

      const newCalf: Animal = {
        id: Date.now(),
        tagNo: calfTag,
        breed: calfGender === 'Female' ? 'Sahiwal Female Calf' : 'Sahiwal Male Calf',
        age: '1 day',
        weight: calfWeight,
        category: 'Bachra',
        status: 'Faal',
        capacity: 0,
        lastVaccine: 'Colostrum Fed',
        healthStatus: 'Healthy',
        temperature: 101.5
      };
      return [...updatedMother, newCalf];
    });

    // 2. Breeding record marked as 'Calved'
    setBreedingRecords(breedingRecords.map(b => b.animalId === motherTag ? {
      ...b,
      status: 'Calved' as const,
      notes: `${b.notes} | Calving complete: ${calfGender} (${calfTag}, ${calfWeight}kg)`
    } : b));

    triggerDbSaveNotice(`Calving recorded. The dam has been added to the milking herd and newborn ${calfTag} has been registered.`);
  };

  const handleLogVitals = (animalTag: string, temp: number, fetalMovement: string, rumination: string, bcs: number, notes: string) => {
    setAnimals(animals.map(a => a.tagNo === animalTag ? {
      ...a,
      temperature: temp,
      healthNotes: `BCS: ${bcs} | Fetal: ${fetalMovement} | ${notes}`
    } : a));
    triggerDbSaveNotice(`Vitals saved for ${animalTag} (Temp: ${temp}°F, BCS: ${bcs})`);
  };

  const handleAddExpense = (category: string, amount: number, notes: string) => {
    const newRec: ExpenseRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      category,
      amount: Number(amount),
      notes: notes || 'Farm miscellaneous expenses'
    };
    const updated = [newRec, ...expenses];
    setExpenses(updated);
    dairyDb.saveTable(DB_KEYS.EXPENSES, updated);
    triggerDbSaveNotice(`Expense Saved to Database: Rs. ${Number(amount).toLocaleString()} (${category}) ✓`);
  };

  const handleAddFeed = (feedType: string, qtyKg: number, cost: number, notes: string) => {
    const newRec: FeedRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      feedType,
      qtyKg: Number(qtyKg),
      cost: Number(cost),
      notes: notes || 'Daily feed entry'
    };
    const updated = [newRec, ...feedRecords];
    setFeedRecords(updated);
    dairyDb.saveTable(DB_KEYS.FEED, updated);
    triggerDbSaveNotice(`Feed Log Saved to Database: ${qtyKg}kg ${feedType} (Rs. ${Number(cost).toLocaleString()}) ✓`);
  };

  const handleAddSale = (animalTag: string, buyer: string, price: number, notes: string) => {
    const newRec: SaleRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      animalTag,
      buyer,
      price: Number(price),
      notes: notes || 'Animal sale receipt'
    };
    const updatedSales = [newRec, ...saleRecords];
    setSaleRecords(updatedSales);
    dairyDb.saveTable(DB_KEYS.SALES, updatedSales);

    const updatedAnimals = animals.map(a => a.tagNo === animalTag ? { ...a, status: 'Farokht' as const } : a);
    setAnimals(updatedAnimals);
    dairyDb.saveTable(DB_KEYS.ANIMALS, updatedAnimals);

    triggerDbSaveNotice(`Sale Record Saved to Database: ${animalTag} to ${buyer} for Rs. ${Number(price).toLocaleString()} ✓`);
  };

  // فارم ان پٹ اسٹیٹس
  const [newMorningMilk, setNewMorningMilk] = useState<number>(43);
  const [newEveningMilk, setNewEveningMilk] = useState<number>(37);
  const [newMilkRate, setNewMilkRate] = useState<number>(190);

  // مالی حسابات
  const monthlyIncome = 758500;
  const monthlyExpenses = 392000;
  const feedExpenses = 265000;
  const netProfit = monthlyIncome - monthlyExpenses;
  const profitMargin = ((netProfit / monthlyIncome) * 100).toFixed(1);
  const feedRatio = ((feedExpenses / monthlyExpenses) * 100).toFixed(1);
  const activeMilkingCount = animals.filter(a => a.category === 'Doodh wali' && a.status === 'Faal').length;
  const todayMilkTotal = milkLogs[0]?.total || 78.5;
  const costPerLiter = 112; // PKR

  // فری سپیس چیک کا سمولیشن (Auto Free Space Management)
  const toggleLowSpaceWarning = () => {
    if (!isLowSpace) {
      setFreeSpaceMB(420); // 420 MB (< 500 MB)
      setIsLowSpace(true);
      setShowWarningModal(true);
    } else {
      setFreeSpaceMB(755000); // 755 GB
      setIsLowSpace(false);
      setShowWarningModal(false);
    }
  };

  const handleAddMilk = (e: React.FormEvent) => {
    e.preventDefault();
    if (freeSpaceMB < 500) {
      alert("Warning: Storage space is low. Delete old data. Less than 500 MB is available.");
      return;
    }
    const total = Number(newMorningMilk) + Number(newEveningMilk);
    const newEntry: MilkLog = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      morning: Number(newMorningMilk),
      evening: Number(newEveningMilk),
      total,
      fat: 5.8,
      snf: 8.9,
      sold: Math.max(0, total - 4.5),
      rate: Number(newMilkRate),
    };
    const updated = [newEntry, ...milkLogs];
    setMilkLogs(updated);
    dairyDb.saveTable(DB_KEYS.MILK, updated);
    setShowAddMilkModal(false);
    triggerDbSaveNotice(`Milk entry saved to the database: ${total}L on ${newEntry.date} ✓`);
  };


  // نیا بریڈنگ اور ولادت ریکارڈ محفوظ کرنا (Add Breeding Record Handler)
  const handleAddBreedingRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (freeSpaceMB < 500) {
      alert("Warning: Storage space is low. Delete old data. Less than 500 MB is available.");
      return;
    }

    const animal = animals.find(a => a.tagNo === newBreedingAnimalId);
    const breed = animal ? animal.breed : 'Sahiwal Cow';
    const gestationDays = (breed.includes('بھینس') || breed.includes('Buffalo')) ? 310 : 280;
    
    // خودکار متوقع تاریخ ولادت = AI تاریخ + 280 دن
    let calculatedDelivery = '';
    if (newBreedingAiDate) {
      const aiDateObj = new Date(newBreedingAiDate);
      const deliveryObj = new Date(aiDateObj.getTime() + gestationDays * 24 * 60 * 60 * 1000);
      calculatedDelivery = deliveryObj.toISOString().split('T')[0];
    }

    const newRecord: BreedingRecord = {
      id: Date.now(),
      animalId: newBreedingAnimalId,
      animalName: `${newBreedingAnimalId} (${breed})`,
      breed,
      heatDate: newBreedingHeatDate,
      aiDate: newBreedingAiDate,
      pregnancyCheckDate: newBreedingPdDate,
      expectedDeliveryDate: calculatedDelivery,
      status: newBreedingStatus,
      semenDetails: newBreedingSemen,
      notes: newBreedingNotes || 'New breeding entry'
    };

    const updatedBreeding = [newRecord, ...breedingRecords];
    setBreedingRecords(updatedBreeding);
    dairyDb.saveTable(DB_KEYS.BREEDING, updatedBreeding);

    // اگر گابھن منتخب کیا ہو تو ریوڑ میں بھی جانور کو گابھن بنائیں
    if (newBreedingStatus === 'Pregnant') {
      const updatedAnimals = animals.map(a => a.tagNo === newBreedingAnimalId ? { ...a, category: 'Gabhan' as const } : a);
      setAnimals(updatedAnimals);
      dairyDb.saveTable(DB_KEYS.ANIMALS, updatedAnimals);
    }

    setShowAddBreedingModal(false);
    setNewBreedingNotes('');
    triggerDbSaveNotice(`Breeding Record Saved to Database: ${newBreedingAnimalId} (+${gestationDays}d Delivery: ${calculatedDelivery || 'TBD'}) ✓`);
  };


  const handleDeleteBreedingRecord = (id: number) => {
    if (confirm("Are you sure you want to delete this breeding record?")) {
      setBreedingRecords(breedingRecords.filter(r => r.id !== id));
    }
  };

  // فلٹر شدہ بریڈنگ ریکارڈز اور سمری اسٹیٹس (Breeding & Gestation Processed Data)
  const filteredBreedingRecords = breedingRecords.filter(r => {
    const matchesFilter = breedingFilterStatus === 'All' || r.status === breedingFilterStatus;
    const matchesSearch = !breedingSearchTerm || 
      r.animalId.toLowerCase().includes(breedingSearchTerm.toLowerCase()) ||
      r.animalName.toLowerCase().includes(breedingSearchTerm.toLowerCase()) ||
      r.breed.toLowerCase().includes(breedingSearchTerm.toLowerCase()) ||
      r.semenDetails.toLowerCase().includes(breedingSearchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // گابھن جانوروں کی ترتیب بلحاظ 'Due Date' یا 'Days Elapsed' (Sortable Gestation Records)
  const sortedPregnantRecords = [...breedingRecords.filter(r => r.status === 'Pregnant')].sort((a, b) => {
    const gestA = calculateGestation(a.aiDate, a.status, a.breed);
    const gestB = calculateGestation(b.aiDate, b.status, b.breed);
    if (pregnancySortBy === 'days_elapsed') {
      return gestB.daysElapsed - gestA.daysElapsed;
    }
    // 'due_date' - urgent births first (lowest days remaining first)
    return gestA.daysRemaining - gestB.daysRemaining;
  });
  const pregnantBreedingRecords = sortedPregnantRecords;
  const dueSoonBreedingRecords = breedingRecords.filter(r => calculateGestation(r.aiDate, r.status, r.breed).isDueSoon);
  const pdDueBreedingRecords = breedingRecords.filter(r => r.status === 'Inseminated' && r.pregnancyCheckDate);
  const inHeatBreedingRecords = breedingRecords.filter(r => r.status === 'In Heat');


  // کیلنڈر ویو متغیرات (Calendar View Math & Dates)
  const currentCalendarDate = new Date(2026, 9 + calendarMonthOffset, 1);
  const calYear = currentCalendarDate.getFullYear();
  const calMonth = currentCalendarDate.getMonth();
  const urduMonthNames = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  const currentUrduMonthName = urduMonthNames[calMonth];
  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const rawFirstDay = new Date(calYear, calMonth, 1).getDay(); // 0 is Sun, 1 is Mon
  const mondayStartOffset = (rawFirstDay + 6) % 7; // 0 for Mon, 6 for Sun

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-gray-800 flex flex-col font-sans" dir="rtl">
      
      {/* ⚠️ ہنگامی وارننگ اگر ہارڈ ڈسک خالی جگہ 500MB سے کم ہو (Requirement 4) */}
      {(isLowSpace || showWarningModal) && (
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg flex items-center justify-between text-sm font-semibold transition-all">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 animate-bounce text-amber-300" />
            <span>
              Warning: Storage space is low. Delete old data. Only {freeSpaceMB} MB remains.
            </span>
          </div>
          <button
            onClick={() => setShowWarningModal(false)}
            className="text-white hover:text-amber-200 text-xs px-2 py-1 rounded bg-red-700 hover:bg-red-800"
          >
            Understood ×
          </button>
        </div>
      )}

      {/* 🌟 ٹاپ نیویگیشن اور برانڈنگ ہیڈر */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* فارم لوگو اور نام */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#1B5E20] text-[#FFF8E1] flex items-center justify-center shadow-md border-2 border-[#FFF8E1]">
              <Milk className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#1B5E20] font-['Noto_Nastaliq_Urdu'] tracking-tight">
                  Chaudhry Dairy Farms
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#FFF8E1] text-[#1B5E20] border border-[#ffe082]">
                  PRO ERP
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">Punjab, Pakistan | Dairy Farm Management System</p>
            </div>
          </div>

          {/* سینٹرل لیپ ٹاپ فری سپیس انڈیکیٹر (Auto Disk Space Management) */}
          <div className="hidden md:flex items-center gap-3 bg-[#F4F6F0] px-4 py-2 rounded-xl border border-gray-200">
            <HardDrive className={`w-4 h-4 ${isLowSpace ? 'text-red-600 animate-pulse' : 'text-[#1B5E20]'}`} />
            <div className="text-xs">
              <span className="text-gray-500">Laptop disk space: </span>
              <strong className={isLowSpace ? 'text-red-600 font-bold' : 'text-[#1B5E20] font-bold'}>
                {isLowSpace ? `${freeSpaceMB} MB (Low)` : `${(freeSpaceMB / 1000).toFixed(0)} GB (Available)`}
              </strong>
            </div>
            <button
              onClick={toggleLowSpaceWarning}
              title="Test warning button"
              className="text-[10px] font-bold px-2 py-1 rounded bg-amber-100 text-[#e65100] hover:bg-amber-200 transition"
            >
              {isLowSpace ? 'Reset Space' : '⚠️ Test Warning'}
            </button>
          </div>

          {/* یوزر پروفائل، ڈیٹا بیس اسٹیٹس اور کوئیک بٹنز */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Database Status & Backup Button */}
            <button
              onClick={() => setShowDbManagerModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] border border-emerald-300 transition shadow-2xs cursor-pointer"
              title="Database connected and auto-syncing. Click to inspect tables or export backup."
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B5E20]"></span>
              </span>
              <Database className="w-3.5 h-3.5 text-[#1B5E20]" />
              <div className="flex flex-col text-left leading-none">
                <span className="font-extrabold text-[11px]">DB: Connected</span>
                <span className="text-[9px] font-normal text-emerald-800 font-['Noto_Nastaliq_Urdu']">10 tables saved</span>
              </div>
            </button>

            <button
              onClick={() => setShowAddMilkModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#1B5E20] hover:bg-[#2e7d32] shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4 text-[#FFF8E1]" />
              <div className="flex flex-col text-left leading-tight">
                <span>+ Milk Entry</span>
                <span className="text-[9px] font-normal opacity-85 font-['Noto_Nastaliq_Urdu']">Milk Entry</span>
              </div>
            </button>

            <div className="flex items-center gap-2 pl-2 border-r border-gray-200 mr-2">
              <div className="w-9 h-9 rounded-full bg-[#FF8F00] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                C
              </div>
              <div className="hidden lg:block text-right">
                <div className="text-xs font-bold text-gray-800">Chaudhry Basharat</div>
                <div className="text-[10px] text-gray-500 font-['Noto_Nastaliq_Urdu']">Farm Manager</div>
              </div>
            </div>
          </div>


        </div>

        {/* نیویگیشن ٹیب بار */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2 text-xs scrollbar-none border-t border-gray-100">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl font-bold flex flex-col items-center whitespace-nowrap transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-gray-600 hover:bg-[#FFF8E1] hover:text-[#1B5E20]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <PieChart className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </div>
            <span className="text-[10px] opacity-80 font-['Noto_Nastaliq_Urdu']">Main Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('herd')}
            className={`px-3 py-1.5 rounded-xl font-bold flex flex-col items-center whitespace-nowrap transition cursor-pointer ${
              activeTab === 'herd'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-gray-600 hover:bg-[#FFF8E1] hover:text-[#1B5E20]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span>🐄</span>
              <span>1. Herd ({animals.length})</span>
            </div>
            <span className="text-[10px] opacity-80 font-['Noto_Nastaliq_Urdu']">Herd & Animals</span>
          </button>

          <button
            onClick={() => setActiveTab('milk')}
            className={`px-3 py-1.5 rounded-xl font-bold flex flex-col items-center whitespace-nowrap transition cursor-pointer ${
              activeTab === 'milk'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-gray-600 hover:bg-[#FFF8E1] hover:text-[#1B5E20]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span>🥛</span>
              <span>2. Milk Production</span>
            </div>
            <span className="text-[10px] opacity-80 font-['Noto_Nastaliq_Urdu']">Milk Production</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`px-3 py-1.5 rounded-xl font-bold flex flex-col items-center whitespace-nowrap transition cursor-pointer ${
              activeTab === 'finance'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-gray-600 hover:bg-[#FFF8E1] hover:text-[#1B5E20]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span>💰</span>
              <span>3 & 4. Finance & Profit</span>
            </div>
            <span className="text-[10px] opacity-80 font-['Noto_Nastaliq_Urdu']">Finance & Profit</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-xl font-bold flex flex-col items-center whitespace-nowrap transition cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-gray-600 hover:bg-[#FFF8E1] hover:text-[#1B5E20]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span>🌾</span>
              <span>6. Feed & Ration</span>
            </div>
            <span className="text-[10px] opacity-80 font-['Noto_Nastaliq_Urdu']">Feed & Ration</span>
          </button>

          <button
            onClick={() => setActiveTab('breeding')}
            className={`px-3 py-1.5 rounded-xl font-bold flex flex-col items-center whitespace-nowrap transition cursor-pointer ${
              activeTab === 'breeding'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-gray-600 hover:bg-[#FFF8E1] hover:text-[#1B5E20]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span>🧬</span>
              <span>7. Breeding (280d)</span>
            </div>
            <span className="text-[10px] opacity-80 font-['Noto_Nastaliq_Urdu']">Breeding & Calving</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded-xl font-bold flex flex-col items-center whitespace-nowrap transition cursor-pointer ${
              activeTab === 'health'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-gray-600 hover:bg-[#FFF8E1] hover:text-[#1B5E20]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span>🩺</span>
              <span>8. Health & Vaccines</span>
            </div>
            <span className="text-[10px] opacity-80 font-['Noto_Nastaliq_Urdu']">Health & Vaccination</span>
          </button>

          <button
            onClick={() => setActiveTab('weight')}
            className={`px-3 py-1.5 rounded-xl font-bold flex flex-col items-center whitespace-nowrap transition cursor-pointer ${
              activeTab === 'weight'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-gray-600 hover:bg-[#FFF8E1] hover:text-[#1B5E20]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span>⚖️</span>
              <span>9. Growth & ADG</span>
            </div>
            <span className="text-[10px] opacity-80 font-['Noto_Nastaliq_Urdu']">Weight & Growth</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-xl font-bold flex flex-col items-center whitespace-nowrap transition cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-gray-600 hover:bg-[#FFF8E1] hover:text-[#1B5E20]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span>👥</span>
              <span>10. Customers & Khata</span>
            </div>
            <span className="text-[10px] opacity-80 font-['Noto_Nastaliq_Urdu']">Customers & Accounts ({customers.length})</span>
          </button>
        </div>
      </header>

      {/* 🌟 اسٹکی کوئیک ایکشن مینیو برائے فوری اندراج (Requirement: Sticky Quick Action Menu 6 Big Cards) */}
      <StickyQuickActionMenu
        onSelectAction={(act) => setShowQuickModalType(act)}
        todayMilk={todayMilkTotal}
        activeAnimalsCount={animals.length}
      />

      {/* 💾 ڈیٹا بیس محفوظ کاری لائیو الرٹ بیج (Database Save Confirmation Toast) */}
      {dbSavedConfirmation && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#1B5E20] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-4 duration-300">
          <Database className="w-4 h-4 text-emerald-300 animate-pulse" />
          <span>{dbSavedConfirmation}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
      )}

      {/* 🚀 مین ڈیش بورڈ باڈی */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {activeTab === 'health' ? (
          <HealthTab
            animals={animals}
            vaccineRecords={vaccineRecords}
            healthIssues={healthIssues}
            onAdministerVaccine={handleAdministerVaccine}
            onOpenAddVaccineModal={() => setShowQuickModalType('vaccine')}
            onOpenAddHealthIssueModal={() => setShowQuickModalType('health')}
            onMarkIssueRecovered={handleMarkIssueRecovered}
            onUpdateAnimalHealthStatus={handleUpdateAnimalHealthStatus}
          />
        ) : activeTab === 'breeding' ? (
          <div className="space-y-6">
            
            {/* 🌟 1. بریڈنگ ہیڈر بینر مع ایکشن بٹنز */}
            <div className="rounded-2xl p-6 bg-gradient-to-l from-[#0d3813] via-[#1B5E20] to-[#2e7d32] text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1.5 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FF8F00] text-white">
                  <Dna className="w-3.5 h-3.5" />
                  <span>Module 7: Breeding, Reproduction & Pregnancy Countdown</span>
                  <span>•</span>
                  <span>280-Day Gestation Tracker</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-['Noto_Nastaliq_Urdu'] leading-tight">
                  Breeding Tracker & 280-Day Pregnancy Countdown
                </h2>
                <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl">
                  Automatically calculate the expected calving date from the AI date (+280 days), with a live countdown, alerts, and calendar view.
                </p>
              </div>

              <div className="flex items-center gap-2.5 z-10">
                <button
                  onClick={() => setShowAddBreedingModal(true)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#FF8F00] text-white hover:bg-[#e65100] transition shadow flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ New Breeding Record</span>
                </button>
                <div className="flex bg-white/20 p-1 rounded-xl backdrop-blur-xs">
                  <button
                    onClick={() => setBreedingViewMode('list')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      breedingViewMode === 'list'
                        ? 'bg-white text-[#1B5E20] shadow-sm'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>List View</span>
                  </button>
                  <button
                    onClick={() => setBreedingViewMode('calendar')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      breedingViewMode === 'calendar'
                        ? 'bg-white text-[#1B5E20] shadow-sm'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Calendar View</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 🌟 2. ٹاپ 4 KPI سمری کارڈز */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-[#1B5E20]"></div>
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-bold text-gray-700 font-['Noto_Nastaliq_Urdu']">
                    Total Tracked Records
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center font-bold">
                    <Dna className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">{breedingRecords.length}</span>
                  <span className="text-xs text-gray-500 font-semibold">Animals Recorded</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Breeding records saved in the database
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-emerald-600"></div>
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-bold text-gray-700 font-['Noto_Nastaliq_Urdu']">
                    Confirmed Pregnancies
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Baby className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-800">{pregnantBreedingRecords.length}</span>
                  <span className="text-xs text-gray-500 font-semibold">Pregnant Animals</span>
                </div>
                <div className="mt-2 text-xs text-emerald-700 font-semibold">
                  Pregnancy countdown is active
                </div>
              </div>

              <div className="bg-[#FFF8E1] rounded-2xl p-5 border border-[#ffe082] shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-[#FF8F00]"></div>
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-bold text-amber-900 font-['Noto_Nastaliq_Urdu']">
                    Calving Expected Soon (&lt;35 Days)
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#FF8F00] flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4 animate-spin" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#e65100]">{dueSoonBreedingRecords.length}</span>
                  <span className="text-xs text-amber-900 font-semibold">Animals</span>
                </div>
                <div className="mt-2 text-xs text-[#e65100] font-bold">
                  ⚠️ Prepare the calving pen now!
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-bold text-gray-700 font-['Noto_Nastaliq_Urdu']">
                    Animals in Heat
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-rose-700">{inHeatBreedingRecords.length}</span>
                  <span className="text-xs text-gray-500 font-semibold">Animals in Heat</span>
                </div>
                <div className="mt-2 text-xs text-rose-600 font-semibold">
                  Immediate insemination is required
                </div>
              </div>
            </div>

            {/* 🌟 3. الرٹس اور اہم نوٹس پینل (Breeding Alerts Box) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-[#e65100] font-bold text-xs font-['Noto_Nastaliq_Urdu']">
                  <Bell className="w-4 h-4 animate-bounce text-[#FF8F00]" />
                  <span>Calving Alert: 2 births expected in November 2026</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Expected calving dates for <strong>PK-106</strong> (Sahiwal) and <strong>PK-102</strong> (Nili Ravi) are <strong>November 21, 2026</strong>. Only <strong>31 days remain</strong>. Prepare a separate calving pen and dry straw.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs font-['Noto_Nastaliq_Urdu']">
                  <HeartPulse className="w-4 h-4 text-blue-700" />
                  <span>Pregnancy Check Alert (PD Check Due)</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  <strong>PK-103</strong> Friesian Cross was inseminated on September 19. Confirm pregnancy with a veterinarian by ultrasound or PD test on <strong>November 5, 2026</strong>.
                </p>
              </div>

              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs font-['Noto_Nastaliq_Urdu']">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Heat Cycle Alert (Heat Detection)</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  <strong>PK-104</strong> Cholistani Cow has shown signs of heat since yesterday evening. Arrange insemination with Sahiwal or imported Friesian semen within the next 12 hours.
                </p>
              </div>
            </div>

            {/* 🌟 4. حمل کاؤنٹ ڈاؤن فیچر اسپاٹ لائٹ (Pregnancy Countdown Feature - 280-Day Gestation Spotlight) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF8E1] text-[#1B5E20] border-2 border-[#ffe082] flex items-center justify-center font-bold shadow-xs">
                    <Baby className="w-6 h-6 text-[#1B5E20]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-gray-900 text-base sm:text-lg font-['Noto_Nastaliq_Urdu']">
                        Pregnancy Countdown & Expected Calving
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1B5E20] text-white">
                        280-Day Gestation
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      View the days remaining, trimester, dry-off date, and progress for each pregnant animal.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Sortable Dropdown */}
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#1B5E20] shrink-0" />
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-bold text-gray-500 uppercase leading-none">Sort by</span>
                      <select
                        aria-label="Sort Breeding Tab Gestation List"
                        value={pregnancySortBy}
                        onChange={(e) => setPregnancySortBy(e.target.value as 'due_date' | 'days_elapsed')}
                        className="bg-transparent font-bold text-gray-800 text-xs outline-none cursor-pointer mt-0.5"
                      >
                        <option value="due_date">Due Date (Urgent First)</option>
                        <option value="days_elapsed">Days Elapsed (Longest Gestation)</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Actions Menu Header */}
                  <div className="inline-flex items-center p-1 bg-emerald-50 rounded-xl border border-emerald-200 gap-1.5">
                    <span className="text-[10px] font-bold text-[#1B5E20] px-2 uppercase">Quick Actions:</span>
                    <button
                      onClick={() => {
                        const firstTag = sortedPregnantRecords[0]?.animalId || 'PK-106';
                        setSelectedPregnantAnimalTag(firstTag);
                        setShowQuickModalType('calved');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#1B5E20] hover:bg-[#2e7d32] text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
                      title="Mark as Calved"
                    >
                      <Baby className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Mark as Calved</span>
                    </button>
                    <button
                      onClick={() => {
                        const firstTag = sortedPregnantRecords[0]?.animalId || 'PK-106';
                        setSelectedPregnantAnimalTag(firstTag);
                        setShowQuickModalType('vitals');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#FF8F00] hover:bg-[#e65100] text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
                      title="Quick Log Vitals"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Quick Log Vitals</span>
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 bg-[#F8F9F5] px-3 py-1.5 rounded-xl border border-gray-200 hidden sm:block">
                    <span>Today: <strong>October 21, 2026</strong></span>
                  </div>
                </div>
              </div>

              {/* کاؤنٹ ڈاؤن کارڈز گرڈ */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pregnantBreedingRecords.map((rec) => {
                  const gestation = calculateGestation(rec.aiDate, rec.status, rec.breed);
                  const isCow = !rec.breed.includes('بھینس') && !rec.breed.includes('Buffalo');
                  const totalDays = isCow ? 280 : 310;

                  return (
                    <div
                      key={rec.id}
                      className={`rounded-2xl p-5 border transition-all duration-300 space-y-4 relative overflow-hidden bg-white shadow-xs hover:shadow-md ${
                        gestation.isDueSoon
                          ? 'border-amber-400 ring-2 ring-amber-300/40 bg-gradient-to-b from-amber-50/20 via-white to-white'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      {/* ٹاپ بیج اور جانور تفصیل */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-gray-900 tracking-tight">{rec.animalId}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Pregnant
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 font-medium mt-0.5">{rec.breed}</div>
                        </div>

                        {/* بڑا کاؤنٹ ڈاؤن ہیرو بیج */}
                        <div className={`px-3 py-1.5 rounded-xl text-center shadow-xs border ${
                          gestation.isDueSoon
                            ? 'bg-amber-100 border-amber-300 text-amber-950 animate-pulse'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}>
                          <div className="text-[10px] uppercase font-bold text-gray-500">Countdown</div>
                          <div className="text-lg font-black leading-none mt-0.5 flex items-center gap-1 justify-center">
                            <Clock className="w-4 h-4 text-[#FF8F00]" />
                            <span>{gestation.daysRemaining} days left</span>
                          </div>
                        </div>
                      </div>

                      {/* 280 دن پروگریس بار */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-600 font-semibold">
                          <span>Progress: {gestation.daysElapsed} / {totalDays} days</span>
                          <span className="text-[#1B5E20] font-bold">{gestation.progressPercent}% complete</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
                          <div
                            className="bg-gradient-to-l from-[#1B5E20] via-[#2e7d32] to-[#FF8F00] h-full rounded-full transition-all duration-700 shadow-xs"
                            style={{ width: `${gestation.progressPercent}%` }}
                          ></div>
                        </div>
                        <div className="text-[11px] text-gray-500 text-right">
                          <span>Stage: </span>
                          <strong className="text-gray-800">{gestation.trimester}</strong>
                        </div>
                      </div>

                      {/* سنگ میل تواریخ (Milestone Dates) */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8F9F5] p-3 rounded-xl border border-gray-100">
                        <div>
                          <span className="text-gray-400 block text-[10px]">AI Date:</span>
                          <strong className="text-gray-800 font-mono">{rec.aiDate}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Expected Calving (+{totalDays}d):</span>
                          <strong className="text-[#1B5E20] font-mono font-bold">{rec.expectedDeliveryDate}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Dry-Off Date (-60d):</span>
                          <strong className="text-amber-800 font-mono">{gestation.dryOffDate}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Ultrasound / PD:</span>
                          <strong className="text-blue-800 font-mono">{rec.pregnancyCheckDate || 'Confirmed'}</strong>
                        </div>
                      </div>

                      {/* سیمن تفصیل */}
                      <div className="text-[11px] text-gray-600 border-t pt-2 flex items-center justify-between">
                        <span className="text-gray-400">Semen:</span>
                        <span className="font-semibold text-gray-700 truncate max-w-[200px]" title={rec.semenDetails}>
                          {rec.semenDetails}
                        </span>
                      </div>

                      {/* الرٹ بینر */}
                      {gestation.isDueSoon ? (
                        <div className="p-2.5 rounded-xl bg-amber-100/90 text-amber-950 text-xs font-bold border border-amber-300 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#e65100] shrink-0" />
                          <span>Calving is very near! Prepare the calving pen and immediate care.</span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Pregnancy is progressing normally. Continue a balanced diet.</span>
                        </div>
                      )}

                      {/* Direct Card Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setSelectedPregnantAnimalTag(rec.animalId);
                            setShowQuickModalType('calved');
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] border border-emerald-200 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Baby className="w-3 h-3 text-[#1B5E20]" />
                          <span>Mark as Calved</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPregnantAnimalTag(rec.animalId);
                            setShowQuickModalType('vitals');
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-[#b45309] border border-amber-200 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Activity className="w-3 h-3" />
                          <span>Log Vitals</span>
                        </button>
                      </div>
                    </div>
                  );

                })}
              </div>
            </div>

            {/* 🌟 5. فلٹر و سرچ بار */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              
              {/* سرچ ان پٹ */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search animal tag, breed, or semen..."
                  value={breedingSearchTerm}
                  onChange={(e) => setBreedingSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1B5E20]"
                />
              </div>

              {/* اسٹیٹس فلٹر پلز */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
                <span className="text-gray-400 text-[11px] ml-1">Filter:</span>
                {[
                  { label: 'All', value: 'All' },
                  { label: 'Pregnant', value: 'Pregnant' },
                  { label: 'Inseminated', value: 'Inseminated' },
                  { label: 'In Heat', value: 'In Heat' },
                  { label: 'Open', value: 'Open' },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setBreedingFilterStatus(tab.value)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                      breedingFilterStatus === tab.value
                        ? 'bg-[#1B5E20] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* موڈ ٹوگل بٹن */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setBreedingViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                    breedingViewMode === 'list'
                      ? 'bg-white text-[#1B5E20] shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
                <button
                  onClick={() => setBreedingViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                    breedingViewMode === 'calendar'
                      ? 'bg-white text-[#1B5E20] shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Calendar View</span>
                </button>
              </div>

            </div>

            {/* 🌟 6. ویو 1: مکمل لسٹ ٹیبل ویو (List View Table) */}
            {breedingViewMode === 'list' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                  <div className="flex items-center gap-2">
                    <Dna className="w-4 h-4 text-[#1B5E20]" />
                    <h4 className="font-bold text-gray-800 text-sm font-['Noto_Nastaliq_Urdu']">
                      Breeding & Calving Records ({filteredBreedingRecords.length})
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowAddBreedingModal(true)}
                    className="text-xs text-[#1B5E20] font-bold hover:underline"
                  >
                    + New Breeding Record
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#F8F9F5] text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-3">Animal Tag & Breed</th>
                        <th className="py-3 px-3">Heat Date</th>
                        <th className="py-3 px-3">AI Date</th>
                        <th className="py-3 px-3">PD Check Date</th>
                        <th className="py-3 px-3">Expected Calving (+280d)</th>
                        <th className="py-3 px-3 text-center">Pregnancy Countdown</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3">Semen & Notes</th>
                        <th className="py-3 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredBreedingRecords.map((r) => {
                        const gestation = calculateGestation(r.aiDate, r.status, r.breed);
                        return (
                          <tr key={r.id} className="hover:bg-gray-50/80 transition">
                            <td className="py-3 px-3 font-bold text-gray-800">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#1B5E20] font-extrabold">{r.animalId}</span>
                              </div>
                              <div className="text-[10px] text-gray-400 font-normal">{r.breed}</div>
                            </td>
                            <td className="py-3 px-3 font-mono text-gray-600">{r.heatDate || '-'}</td>
                            <td className="py-3 px-3 font-mono font-semibold text-gray-800">{r.aiDate || '-'}</td>
                            <td className="py-3 px-3 font-mono text-blue-700">{r.pregnancyCheckDate || '-'}</td>
                            <td className="py-3 px-3 font-mono font-bold text-[#1B5E20]">
                              {r.expectedDeliveryDate ? (
                                <span className="flex items-center gap-1">
                                  <span>🔔</span>
                                  <span>{r.expectedDeliveryDate}</span>
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {r.status === 'Pregnant' || r.status === 'Inseminated' ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    gestation.isDueSoon
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {gestation.daysRemaining} days left
                                  </span>
                                  <span className="text-[9px] text-gray-400 mt-0.5">
                                    {gestation.progressPercent}% complete
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                r.status === 'Pregnant'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : r.status === 'Inseminated'
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                  : r.status === 'In Heat'
                                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {r.status === 'Pregnant' ? 'Confirmed Pregnant'
                                  : r.status === 'Inseminated' ? 'Inseminated'
                                  : r.status === 'In Heat' ? 'In Heat'
                                  : 'Open'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-gray-600 max-w-[200px]">
                              <div className="truncate font-medium">{r.semenDetails}</div>
                              <div className="text-[10px] text-gray-400 truncate">{r.notes}</div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => handleDeleteBreedingRecord(r.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                                title="Delete record"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 🌟 7. ویو 2: انٹرایکٹو کیلنڈر ویو (Interactive Calendar View) */}
            {breedingViewMode === 'calendar' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5">
                
                {/* کیلنڈر ہیڈر اور مہینہ نیویگیشن */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center font-bold">
                      <CalendarDays className="w-5 h-5 text-[#1B5E20]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base font-['Noto_Nastaliq_Urdu']">
                        Breeding, Calving & PD Calendar
                      </h3>
                      <p className="text-xs text-gray-500">
                        Dated schedule for calving, pregnancy tests, and heat cycles
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalendarMonthOffset(calendarMonthOffset - 1)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>Previous Month</span>
                    </button>
                    <div className="px-4 py-1.5 rounded-xl bg-[#FFF8E1] text-[#1B5E20] font-black text-sm border border-[#ffe082]">
                      {currentUrduMonthName} {calYear}
                    </div>
                    <button
                      onClick={() => setCalendarMonthOffset(calendarMonthOffset + 1)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1 transition"
                    >
                      <span>Next Month</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* کیلنڈر گرڈ */}
                <div className="border rounded-2xl overflow-hidden bg-gray-50/40">
                  {/* ہفتے کے دن */}
                  <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-700 bg-gray-100/80 py-2.5 border-b">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Sun</div>
                  </div>

                  {/* دنوں کا گرڈ */}
                  <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-100 bg-white">
                    {/* خالی دن برائے مہینے کا آغاز */}
                    {Array.from({ length: mondayStartOffset }).map((_, i) => (
                      <div key={`empty-${i}`} className="min-h-[90px] p-2 bg-gray-50/50"></div>
                    ))}

                    {/* مہینے کے دن */}
                    {Array.from({ length: daysInCalMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isToday = dateStr === '2026-10-21';

                      // اس تاریخ کے تمام ایونٹس نکالیں
                      const dayEvents: { type: string; label: string; record: BreedingRecord }[] = [];
                      breedingRecords.forEach(rec => {
                        if (rec.expectedDeliveryDate === dateStr) {
                          dayEvents.push({ type: 'calving', label: `Calving: ${rec.animalId}`, record: rec });
                        }
                        if (rec.pregnancyCheckDate === dateStr) {
                          dayEvents.push({ type: 'pd', label: `Pregnancy check: ${rec.animalId}`, record: rec });
                        }
                        if (rec.heatDate === dateStr) {
                          dayEvents.push({ type: 'heat', label: `Heat: ${rec.animalId}`, record: rec });
                        }
                        if (rec.aiDate === dateStr) {
                          dayEvents.push({ type: 'ai', label: `Insemination: ${rec.animalId}`, record: rec });
                        }
                      });

                      const isSelected = selectedCalendarDate === dateStr;

                      return (
                        <div
                          key={dayNum}
                          onClick={() => setSelectedCalendarDate(dateStr)}
                          className={`min-h-[95px] p-2 transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-50 ring-2 ring-inset ring-[#FF8F00]'
                              : isToday
                              ? 'bg-emerald-50/60'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                              isToday
                                ? 'bg-[#1B5E20] text-white shadow-xs'
                                : 'text-gray-700'
                            }`}>
                              {dayNum}
                            </span>
                            {dayEvents.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-[#FF8F00]"></span>
                            )}
                          </div>

                          {/* ایونٹس بیجز */}
                          <div className="space-y-1">
                            {dayEvents.map((ev, idx) => (
                              <div
                                key={idx}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold truncate flex items-center gap-1 ${
                                  ev.type === 'calving'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : ev.type === 'pd'
                                    ? 'bg-blue-600 text-white'
                                    : ev.type === 'heat'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-purple-600 text-white'
                                }`}
                                title={`${ev.label} - ${ev.record.breed}`}
                              >
                                <span>{ev.type === 'calving' ? '🔔' : ev.type === 'pd' ? '🩺' : ev.type === 'heat' ? '🔥' : '🧬'}</span>
                                <span className="truncate">{ev.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* کیلنڈر کلر لیجنڈ اور منتخب تاریخ کی تفصیل */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                      <span className="font-semibold text-gray-700">Expected Calving Date (+280 days)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                      <span className="font-semibold text-gray-700">Pregnancy Test / PD Check (PD Due)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-600"></span>
                      <span className="font-semibold text-gray-700">Heat Cycle (Heat Date)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                      <span className="font-semibold text-gray-700">Insemination (AI Date)</span>
                    </span>
                  </div>

                  {selectedCalendarDate && (
                    <div className="text-xs bg-[#FFF8E1] px-3 py-1.5 rounded-xl border border-[#ffe082] text-gray-800">
                      Selected date: <strong>{selectedCalendarDate}</strong>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        ) : (
          <div className="space-y-6">
            
            {/* ہیڈر ویلکم بینر */}
        <div className="rounded-2xl p-6 bg-gradient-to-l from-[#0d3813] via-[#1B5E20] to-[#2e7d32] text-white shadow-lg relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FF8F00] text-white">
              <span>🌟 Live Performance Report</span>
              <span>•</span>
              <span>October 21, 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Noto_Nastaliq_Urdu'] leading-tight">
              Dairy Farm Daily Production & Financial Overview
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl">
              The system automatically monitors production costs, profit per liter, and feed-to-ration ratios.
            </p>
          </div>

          <div className="flex items-center gap-2.5 z-10">
            <button
              onClick={() => setShowAddMilkModal(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#FFF8E1] text-[#1B5E20] hover:bg-white transition shadow flex items-center gap-2"
            >
              <Milk className="w-4 h-4 text-[#1B5E20]" />
              <span>Record Milk</span>
            </button>
            <button
              onClick={() => setShowAddAnimalModal(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#FF8F00] text-white hover:bg-[#e65100] transition shadow flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Animal</span>
            </button>
          </div>
        </div>

        {/* 🌟 گرڈ لے آؤٹ برائے ٹاپ KPIs (Required: Total Milk Today, Monthly Income, Expenses, etc.) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: آج کا دودھ (Total Milk Today) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-full bg-[#1B5E20]"></div>
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold text-gray-600 font-['Noto_Nastaliq_Urdu']">
                Total Milk Today
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center">
                <Milk className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900 tracking-tight">{todayMilkTotal}</span>
              <span className="text-sm font-semibold text-gray-500">Liters</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
              <span>Morning: <strong>42.5L</strong></span>
              <span>Evening: <strong>36.0L</strong></span>
              <span className="font-bold text-[#1B5E20] bg-emerald-50 px-2 py-0.5 rounded">Fat: 5.8%</span>
            </div>
          </div>

          {/* KPI 2: اس مہینے کی آمدنی (Monthly Income) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-full bg-[#FF8F00]"></div>
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold text-gray-600 font-['Noto_Nastaliq_Urdu']">
                Monthly Income
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#FF8F00] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1B5E20] tracking-tight">
                {monthlyIncome.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-gray-500">PKR</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% increase
              </span>
              <span className="text-[11px] text-gray-400">Milk + Animal Sales</span>
            </div>
          </div>

          {/* KPI 3: اس مہینے کے اخراجات (Monthly Expenses) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-full bg-rose-600"></div>
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold text-gray-600 font-['Noto_Nastaliq_Urdu']">
                Monthly Expenses
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-700 tracking-tight">
                {monthlyExpenses.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-gray-500">PKR</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
              <span>Feed & Ration: <strong>{feedExpenses.toLocaleString()}</strong></span>
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[11px]">
                {feedRatio}%
              </span>
            </div>
          </div>

          {/* KPI 4: خالص منافع (Net Profit) */}
          <div className="bg-[#FFF8E1]/80 rounded-2xl p-5 border border-[#ffe082] shadow-xs hover:shadow-md transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-full bg-[#1B5E20]"></div>
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold text-gray-800 font-['Noto_Nastaliq_Urdu']">
                Net Profit
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#1B5E20] text-[#FFF8E1] flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1B5E20] tracking-tight">
                {netProfit.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-gray-600">PKR</span>
            </div>
            <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-gray-700">
              <span>Profit Margin:</span>
              <span className="font-extrabold text-[#e65100] text-sm">{profitMargin}%</span>
            </div>
          </div>

        </div>

        {/* 🌟 فنانشل کارڈ مع Recharts 6 ماہ ٹرینڈ لائن چارٹ (Financial Health & 6-Month Income vs Expenses Line Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF8E1] text-[#1B5E20] border border-[#ffe082] flex items-center justify-center font-bold shadow-xs">
                <TrendingUp className="w-6 h-6 text-[#1B5E20]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-gray-900 text-base font-['Noto_Nastaliq_Urdu']">
                    Financial Health: 6-Month Trends
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Profitable
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Detailed comparison of monthly income and expenses over the past six months.
                </p>
              </div>
            </div>

            {/* کوئیک سمری اسکور */}
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                <span className="text-[11px] text-emerald-700">6-Month Average Income: </span>
                <strong className="font-bold">Rs. 703,083</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-900 border border-rose-200">
                <span className="text-[11px] text-rose-700">6-Month Average Expenses: </span>
                <strong className="font-bold">Rs. 380,333</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#FFF8E1] text-amber-900 border border-[#ffe082]">
                <span className="text-[11px] text-amber-800">Average Net Profit: </span>
                <strong className="font-bold text-[#e65100]">Rs. 322,750</strong>
              </div>
            </div>
          </div>

          {/* Recharts لائن چارٹ کنٹینر */}
          <div className="h-72 w-full pt-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialTrendsData} margin={{ top: 10, right: 25, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="monthUrdu"
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `Rs. ${(val / 1000).toFixed(0)}k`}
                  tick={{ fill: '#475569', fontSize: 11 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  domain={[250000, 850000]}
                />
                <Tooltip content={<CustomFinancialTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  formatter={(value) => {
                    if (value === 'income') return 'Monthly Income';
                    if (value === 'expenses') return 'Monthly Expenses';
                    if (value === 'profit') return 'Net Profit';
                    return value;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="income"
                  stroke="#1B5E20"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#1B5E20', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, fill: '#1B5E20', stroke: '#ffffff', strokeWidth: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="expenses"
                  stroke="#E11D48"
                  strokeWidth={3}
                  dot={{ r: 4.5, fill: '#E11D48', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, fill: '#E11D48', stroke: '#ffffff', strokeWidth: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="profit"
                  stroke="#FF8F00"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#FF8F00', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#FF8F00', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B5E20]"></span>
              <span>Green line: <strong>Monthly Income</strong> - steady growth from May to October</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>Red line: <strong>Monthly Expenses</strong> - balanced and controlled</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF8F00]"></span>
              <span>Gold dashed line: <strong>Net Profit</strong> - positive growth (+30.8%)</span>
            </span>
          </div>
        </div>

        {/* 🌟 ڈیش بورڈ ویجیٹ: گابھن جانوروں کا حمل کاؤنٹ ڈاؤن (Pregnancy Countdown Spotlight on Dashboard) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8E1] text-[#1B5E20] border border-[#ffe082] flex items-center justify-center font-bold">
                <Clock className="w-5 h-5 text-[#FF8F00]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                    Pregnancy Countdown & Calving Tracker (280 Days)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {breedingRecords.filter(r => calculateGestation(r.aiDate, r.status, r.breed).isDueSoon).length} Animals Due Soon!
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-['Noto_Nastaliq_Urdu']">
                  Automatic expected calving date and live countdown based on a 280-day gestation period
                </p>
              </div>
            </div>

            {/* Quick Actions Header Buttons & Sortable Dropdown */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Sortable Dropdown to order list by 'Due Date' or 'Days Elapsed' */}
              <div className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-2xs transition">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#1B5E20] shrink-0" />
                <div className="flex flex-col text-left">
                  <label htmlFor="pregnancy-sort-dropdown" className="text-[9px] font-bold text-gray-500 uppercase leading-none">
                    Sort by
                  </label>
                  <select
                    id="pregnancy-sort-dropdown"
                    aria-label="Sort Pregnancy List"
                    value={pregnancySortBy}
                    onChange={(e) => setPregnancySortBy(e.target.value as 'due_date' | 'days_elapsed')}
                    className="bg-transparent font-bold text-gray-800 text-xs outline-none cursor-pointer mt-0.5"
                  >
                    <option value="due_date">Due Date (Urgent First)</option>
                    <option value="days_elapsed">Days Elapsed (Longest Gestation)</option>
                  </select>
                </div>
              </div>

              {/* Quick Actions Header Menu */}
              <div className="inline-flex items-center p-1 bg-emerald-50 rounded-xl border border-emerald-200 gap-1.5">
                <span className="text-[10px] font-bold text-[#1B5E20] px-2 uppercase">Quick Actions:</span>
                <button
                  onClick={() => {
                    const firstTag = sortedPregnantRecords[0]?.animalId || 'PK-106';
                    setSelectedPregnantAnimalTag(firstTag);
                    setShowQuickModalType('calved');
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#1B5E20] hover:bg-[#2e7d32] text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
                  title="Mark as Calved - Mother joins milking herd and registers newborn calf"
                >
                  <Baby className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Mark as Calved</span>
                </button>
                <button
                  onClick={() => {
                    const firstTag = sortedPregnantRecords[0]?.animalId || 'PK-106';
                    setSelectedPregnantAnimalTag(firstTag);
                    setShowQuickModalType('vitals');
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#FF8F00] hover:bg-[#e65100] text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
                  title="Quick Log Vitals - Record temperature, BCS, rumination & fetal activity"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Quick Log Vitals</span>
                </button>
              </div>

              <button
                onClick={() => setActiveTab('breeding')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-xs transition cursor-pointer"
              >
                <Dna className="w-3.5 h-3.5 text-[#1B5E20]" />
                <span>Full Tracker 🧬</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPregnantRecords.map((rec) => {

                const gestation = calculateGestation(rec.aiDate, rec.status, rec.breed);
                return (
                  <div
                    key={rec.id}
                    className={`rounded-xl p-4 border bg-white shadow-xs space-y-3 transition hover:shadow-md ${
                      gestation.isDueSoon ? 'border-amber-400 ring-2 ring-amber-200/50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{rec.animalId}</div>
                        <div className="text-[11px] text-gray-500">{rec.breed}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                        gestation.isDueSoon
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{gestation.daysRemaining} Days Left</span>
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                        <span>Gestation Progress:</span>
                        <strong className="text-gray-800">{gestation.daysElapsed} / 280 Days ({gestation.progressPercent}%)</strong>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-l from-[#1B5E20] to-[#FF8F00] h-full rounded-full transition-all duration-500"
                          style={{ width: `${gestation.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F8F9F5] p-2 rounded-lg text-gray-600">
                      <div>
                        <span className="text-gray-400 block text-[10px]">AI / Insemination:</span>
                        <strong className="text-gray-700">{rec.aiDate}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Expected Calving:</span>
                        <strong className="text-[#1B5E20] font-black">{rec.expectedDeliveryDate}</strong>
                      </div>
                    </div>

                    {/* Direct Card Action Buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setSelectedPregnantAnimalTag(rec.animalId);
                          setShowQuickModalType('calved');
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] border border-emerald-200 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Baby className="w-3 h-3 text-[#1B5E20]" />
                        <span>Mark as Calved</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPregnantAnimalTag(rec.animalId);
                          setShowQuickModalType('vitals');
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-[#b45309] border border-amber-200 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Activity className="w-3 h-3" />
                        <span>Log Vitals</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 🌟 سیکنڈ گرڈ: یونٹ اکنامکس، فعال جانور اور فیڈ انڈیکیٹر */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* چارہ و ونڈا انڈیکیٹر (60-70% Benchmark Indicator Card) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center">
                  <Wheat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm font-['Noto_Nastaliq_Urdu']">
                    Feed Expense Indicator
                  </h3>
                  <p className="text-xs text-gray-500">Feed costs should ideally account for 60% to 70% of total dairy farm expenses.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Current: {feedRatio}% (Healthy Range)
                </span>
              </div>
            </div>

            {/* پروگریس بار */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
                <span>0% Expenses</span>
                <span className="text-[#1B5E20] font-bold">Target Range: 60% to 70%</span>
                <span>100% Expenses</span>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex p-0.5">
                <div
                  className="bg-gradient-to-l from-[#1B5E20] to-[#FF8F00] h-full rounded-full transition-all duration-700"
                  style={{ width: `${feedRatio}%` }}
                ></div>
              </div>
            </div>

            {/* 3 فوری سمری پوائنٹس */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#F8F9F5] rounded-xl border border-gray-200/70">
                <span className="text-[11px] text-gray-500">Total Feed Cost:</span>
                <div className="text-base font-bold text-gray-800 mt-0.5">PKR {feedExpenses.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/70">
                <span className="text-[11px] text-emerald-800">Production Cost per Liter:</span>
                <div className="text-base font-bold text-[#1B5E20] mt-0.5">PKR {costPerLiter} / liter</div>
              </div>
              <div className="p-3 bg-[#FFF8E1] rounded-xl border border-[#ffe082]">
                <span className="text-[11px] text-amber-900">Average Profit per Liter:</span>
                <div className="text-base font-bold text-[#e65100] mt-0.5">PKR 78 / liter</div>
              </div>
            </div>
          </div>

          {/* فارم شماریات کارڈ (Active Animals & Quick Stats) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm font-['Noto_Nastaliq_Urdu'] flex items-center gap-2">
                <span>🐄</span>
                <span>Farm Herd Summary</span>
              </h3>
              <span className="text-xs font-bold text-[#1B5E20]">Total: {animals.length} animals</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🥛</span>
                  <span className="text-xs font-bold text-blue-900">Milking Animals:</span>
                </div>
                <strong className="text-sm text-blue-900">{activeMilkingCount} animals</strong>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🤰</span>
                  <span className="text-xs font-bold text-purple-900">Pregnant Animals:</span>
                </div>
                <strong className="text-sm text-purple-900">1 animal (calving expected)</strong>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🍂</span>
                  <span className="text-xs font-bold text-amber-900">Dry Cows:</span>
                </div>
                <strong className="text-sm text-amber-900">1 animal</strong>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50/70 border border-teal-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🌱</span>
                  <span className="text-xs font-bold text-teal-900">Calves:</span>
                </div>
                <strong className="text-sm text-teal-900">2 animals (growing)</strong>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('herd')}
              className="w-full py-2 bg-[#FFF8E1] hover:bg-[#ffecb3] text-[#1B5E20] font-bold text-xs rounded-xl border border-[#ffe082] transition flex items-center justify-center gap-1.5"
            >
              <span>View Complete Herd List</span>
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

        </div>

        {/* 🌟 نیچے والی فہرستیں: حالیہ دودھ لاگ اور گاہکوں کا کھاتہ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* پچھلے دنوں کا دودھ ریکارڈ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <div className="flex items-center gap-2">
                <Milk className="w-4 h-4 text-[#1B5E20]" />
                <h4 className="font-bold text-gray-800 text-sm font-['Noto_Nastaliq_Urdu']">
                  Recent Daily Milk Production
                </h4>
              </div>
              <button
                onClick={() => setShowAddMilkModal(true)}
                className="text-xs text-[#1B5E20] font-bold hover:underline"
              >
                + New Entry
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#F8F9F5] text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Morning</th>
                    <th className="py-2.5 px-3">Evening</th>
                    <th className="py-2.5 px-3">Total Production</th>
                    <th className="py-2.5 px-3">Fat %</th>
                    <th className="py-2.5 px-3">Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {milkLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-2.5 px-3 font-semibold text-gray-700">{log.date}</td>
                      <td className="py-2.5 px-3">{log.morning} L</td>
                      <td className="py-2.5 px-3">{log.evening} L</td>
                      <td className="py-2.5 px-3 font-bold text-[#1B5E20]">{log.total} L</td>
                      <td className="py-2.5 px-3 font-semibold text-amber-700">{log.fat}%</td>
                      <td className="py-2.5 px-3 text-emerald-800 font-bold">{log.sold} L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* گاہکوں کا کھاتہ اور مارکیٹ ادھار */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/60">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF8F00]" />
                <h4 className="font-bold text-gray-800 text-sm font-['Noto_Nastaliq_Urdu']">
                  Customer Milk Supply & Outstanding Balances
                </h4>
              </div>

              {/* ایکشن بٹنز بشمول CSV ایکسپورٹ */}
              <div className="flex items-center gap-2 relative">
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  Total Outstanding: PKR {customers.reduce((acc, c) => acc + c.balance, 0).toLocaleString()}
                </span>

                {/* ایکسپورٹ CSV بٹن اور مینیو */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition"
                    title="Export Accounts CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>

                  {/* ڈراپ ڈاؤن مینیو برائے CSV ایکسپورٹ */}
                  {showExportMenu && (
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-2 space-y-1 text-right">
                      <div className="text-[11px] font-bold text-gray-400 px-2 py-1 border-b">
                        Select an export format:
                      </div>
                      <button
                        onClick={exportCustomerKhataCSV}
                        className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-emerald-50 text-gray-800 hover:text-[#1B5E20] font-semibold flex items-center justify-between transition"
                      >
                        <span className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-[#1B5E20]" />
                          <span>Customer Balances (CSV)</span>
                        </span>
                        <span className="text-[10px] text-gray-400">Excel</span>
                      </button>
                      <button
                        onClick={() => exportPaymentHistoryCSV()}
                        className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-emerald-50 text-gray-800 hover:text-[#1B5E20] font-semibold flex items-center justify-between transition"
                      >
                        <span className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-[#FF8F00]" />
                          <span>All Payment History</span>
                        </span>
                        <span className="text-[10px] text-gray-400">Excel</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowRecordPaymentModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF8F00] hover:bg-[#e65100] text-white shadow-xs transition"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#F8F9F5] text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Customer Name</th>
                    <th className="py-2.5 px-3">Daily Supply</th>
                    <th className="py-2.5 px-3">Rate</th>
                    <th className="py-2.5 px-3">Outstanding Balance</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">History & Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-2.5 px-3 font-bold text-gray-800">
                        <div>{c.name}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{c.phone}</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#1B5E20]">{c.dailyLiters} L/day</td>
                      <td className="py-2.5 px-3">PKR {c.rate}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-900">
                        {c.balance > 0 ? (
                          <span className="text-red-700">PKR {c.balance.toLocaleString()}</span>
                        ) : (
                          <span className="text-emerald-700">0 (Paid)</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.balance > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {c.balance > 0 ? 'Due' : 'Cleared'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedCustomerForHistory(c)}
                            className="px-2 py-1 rounded-md text-[11px] font-bold text-[#1B5E20] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                            title="View payment history"
                          >
                            View Ledger 📜
                          </button>
                          <button
                            onClick={() => exportPaymentHistoryCSV(c.id)}
                            className="p-1 rounded-md text-gray-500 hover:text-[#1B5E20] hover:bg-gray-100 transition"
                            title="Download this customer's history as CSV"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    )}

      </main>

      {/* 🌟 فوٹر بار برائے لیپ ٹاپ فری سپیس اور انفارمیشن (Requirement 4) */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-4 px-4 sm:px-6 lg:px-8 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1B5E20] font-['Noto_Nastaliq_Urdu']">Dairy Farm Management System</span>
          <span>•</span>
          <span className="text-gray-500">Python Flask and single-file SQLite database (farm.db)</span>
        </div>

        {/* لائیو ہارڈ ڈسک فری سپیس مانیٹر */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <HardDrive className={`w-4 h-4 ${isLowSpace ? 'text-red-600 animate-pulse' : 'text-emerald-700'}`} />
            <span>System free space: </span>
            <strong className={isLowSpace ? 'text-red-600 font-bold' : 'text-[#1B5E20] font-bold'}>
              {isLowSpace ? `${freeSpaceMB} MB` : `${(freeSpaceMB / 1000).toFixed(0)} GB`} available
            </strong>
          </span>
          {isLowSpace ? (
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
              ⚠️ Low storage space! Delete old data.
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Storage space is available
            </span>
          )}
        </div>
      </footer>

      {/* 🌟 دودھ انٹری ماڈل (Add Daily Milk Modal) */}
      {showAddMilkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base font-['Noto_Nastaliq_Urdu'] flex items-center gap-2">
                <Milk className="w-5 h-5 text-[#1B5E20]" />
                <span>Daily Milk Production Entry</span>
              </h3>
              <button onClick={() => setShowAddMilkModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMilk} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Morning Milk (L)*:</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newMorningMilk}
                    onChange={(e) => setNewMorningMilk(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Evening Milk (L)*:</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newEveningMilk}
                    onChange={(e) => setNewEveningMilk(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rate per Liter (PKR):</label>
                <input
                  type="number"
                  value={newMilkRate}
                  onChange={(e) => setNewMilkRate(parseFloat(e.target.value) || 190)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20]"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex justify-between">
                <span>Total Production: <strong>{(Number(newMorningMilk) + Number(newEveningMilk)).toFixed(1)} liters</strong></span>
                <span>Estimated Amount: <strong>PKR {((Number(newMorningMilk) + Number(newEveningMilk)) * newMilkRate).toLocaleString()}</strong></span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddMilkModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B5E20] hover:bg-[#2e7d32] text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 نیا جانور ماڈل (Add Animal Modal) */}
      {showAddAnimalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base font-['Noto_Nastaliq_Urdu'] flex items-center gap-2">
                <span>🐄</span>
                <span>Add a New Animal to the Herd</span>
              </h3>
              <button onClick={() => setShowAddAnimalModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("New animal registered successfully.");
                setShowAddAnimalModal(false);
              }}
              className="space-y-3.5"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tag Number*:</label>
                  <input type="text" placeholder="Example: PK-110" required className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Breed*:</label>
                  <select className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20]">
                    <option>Sahiwal Cow</option>
                    <option>Nili Ravi Buffalo</option>
                    <option>Cholistani Cow</option>
                    <option>Friesian Cross</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category:</label>
                  <select className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20]">
                    <option>Milking</option>
                    <option>Dry</option>
                    <option>Pregnant</option>
                    <option>Calf</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Weight (kg):</label>
                  <input type="number" placeholder="450" className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20]" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddAnimalModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B5E20] hover:bg-[#2e7d32] text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 گاہک کی ادائیگی ہسٹری اور لیجر ماڈل (Customer Payment History & Statement Modal) */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center font-bold">
                  📜
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base font-['Noto_Nastaliq_Urdu']">
                    Customer Ledger & Payment History: {selectedCustomerForHistory.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Phone: {selectedCustomerForHistory.phone} | Address: {selectedCustomerForHistory.address}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomerForHistory(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* سمری پٹی */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold">Daily Milk Supply:</span>
                <div className="text-lg font-bold text-[#1B5E20] mt-0.5">{selectedCustomerForHistory.dailyLiters} liters / day</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[11px] text-blue-800 font-semibold">Agreed Rate per Liter:</span>
                <div className="text-lg font-bold text-blue-900 mt-0.5">PKR {selectedCustomerForHistory.rate} / liter</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[11px] text-amber-900 font-semibold">Current Outstanding Balance:</span>
                <div className="text-lg font-bold text-amber-900 mt-0.5">
                  {selectedCustomerForHistory.balance > 0 ? `PKR ${selectedCustomerForHistory.balance.toLocaleString()}` : '0 (Paid)'}
                </div>
              </div>
            </div>

            {/* ٹول بار برائے CSV ڈاؤن لوڈ */}
            <div className="flex items-center justify-between pt-2">
              <h4 className="text-xs font-bold text-gray-700 font-['Noto_Nastaliq_Urdu']">
                Recent Transactions & Payment Records:
              </h4>
              <button
                onClick={() => exportPaymentHistoryCSV(selectedCustomerForHistory.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1B5E20] hover:bg-[#2e7d32] text-white shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download This Customer's History as CSV</span>
              </button>
            </div>

            {/* ہسٹری ٹیبل */}
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#F8F9F5] text-gray-700 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Milk (Liters)</th>
                    <th className="py-2.5 px-3">Billed Amount (PKR)</th>
                    <th className="py-2.5 px-3">Amount Received (PKR)</th>
                    <th className="py-2.5 px-3">Remaining Balance</th>
                    <th className="py-2.5 px-3">Method / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paymentHistory
                    .filter(p => p.customerId === selectedCustomerForHistory.id)
                    .map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-semibold text-gray-700">{tx.date}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.type === 'Payment' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {tx.type === 'Payment' ? 'Payment Received' : 'Milk Supply'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">{tx.liters ? `${tx.liters} L` : '-'}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">
                          {tx.billedAmount ? `PKR ${tx.billedAmount.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">
                          {tx.amountReceived ? `PKR ${tx.amountReceived.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-amber-900">
                          PKR {tx.remainingBalance.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">
                          <div>{tx.method || '-'}</div>
                          <div className="text-[10px] text-gray-400">{tx.notes}</div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 ادائیگی وصولی درج کرنے کا ماڈل (Record Payment Modal) */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base font-['Noto_Nastaliq_Urdu'] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#FF8F00]" />
                <span>Record a Customer Payment</span>
              </h3>
              <button onClick={() => setShowRecordPaymentModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Customer*:</label>
                <select
                  value={paymentCustomerId}
                  onChange={(e) => setPaymentCustomerId(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20] text-xs font-semibold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Balance: PKR {c.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Amount Received (PKR)*:</label>
                <input
                  type="number"
                  required
                  placeholder="Example: 5000"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-emerald-800 outline-none focus:ring-2 focus:ring-[#1B5E20]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20] text-xs"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="JazzCash/EasyPaisa">JazzCash / EasyPaisa</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Details / Remarks:</label>
                <input
                  type="text"
                  placeholder="Weekly payment or bill number..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowRecordPaymentModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF8F00] hover:bg-[#e65100] text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 نیا بریڈنگ و حمل ریکارڈ ماڈل (Add Breeding & Insemination Record Modal) */}
      {showAddBreedingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center font-bold">
                  <Dna className="w-5 h-5 text-[#1B5E20]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base font-['Noto_Nastaliq_Urdu']">
                    New Breeding & Pregnancy Record
                  </h3>
                  <p className="text-xs text-gray-500">Automatic expected calving date (+280 days) and countdown</p>
                </div>
              </div>
              <button onClick={() => setShowAddBreedingModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBreedingRecord} className="space-y-3.5">
              
              {/* جانور سلیکشن */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Animal (Tag & Breed)*:</label>
                <select
                  value={newBreedingAnimalId}
                  onChange={(e) => setNewBreedingAnimalId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20] text-xs font-bold text-gray-800"
                >
                  {animals
                    .filter(a => a.category !== 'Bail')
                    .map((a) => (
                      <option key={a.id} value={a.tagNo}>
                        {a.tagNo} - {a.breed} ({a.category === 'Gabhan' ? 'Pregnant' : a.category === 'Doodh wali' ? 'Milking' : a.category})
                      </option>
                    ))}
                </select>
              </div>

              {/* تواریخ: ہیٹ اور ٹیکہ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Heat Date:</label>
                  <input
                    type="date"
                    value={newBreedingHeatDate}
                    onChange={(e) => setNewBreedingHeatDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">AI Date*:</label>
                  <input
                    type="date"
                    required
                    value={newBreedingAiDate}
                    onChange={(e) => setNewBreedingAiDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20] text-xs font-semibold"
                  />
                </div>
              </div>

              {/* حمل ٹیسٹ تاریخ اور اسٹیٹس */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pregnancy Test Date (PD Check Date):</label>
                  <input
                    type="date"
                    value={newBreedingPdDate}
                    onChange={(e) => setNewBreedingPdDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Status (Breeding Status)*:</label>
                  <select
                    value={newBreedingStatus}
                    onChange={(e) => setNewBreedingStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20] text-xs font-bold"
                  >
                    <option value="Pregnant">Confirmed Pregnant</option>
                    <option value="Inseminated">Inseminated - Awaiting Diagnosis</option>
                    <option value="In Heat">In Heat</option>
                    <option value="Open">Open</option>
                  </select>
                </div>
              </div>

              {/* 🌟 280 دن خودکار متوقع تاریخ ولادت لائیو پریویو */}
              {newBreedingAiDate && (
                <div className="p-3 bg-[#FFF8E1] rounded-xl border border-[#ffe082] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#FF8F00] animate-spin" />
                    <div>
                      <span className="font-bold text-gray-800">Automatically Calculated Expected Calving Date: </span>
                      <strong className="text-[#1B5E20] text-sm font-black">
                        {(() => {
                          const isBuffalo = newBreedingAnimalId.includes('102') || newBreedingAnimalId.includes('105');
                          const days = isBuffalo ? 310 : 280;
                          const ai = new Date(newBreedingAiDate);
                          const exp = new Date(ai.getTime() + days * 24 * 60 * 60 * 1000);
                          return exp.toISOString().split('T')[0];
                        })()}
                      </strong>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#1B5E20] font-bold text-[10px]">
                    +{newBreedingAnimalId.includes('102') || newBreedingAnimalId.includes('105') ? '310' : '280'}-day gestation
                  </span>
                </div>
              )}

              {/* سیمن تفصیل */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Semen / Bull Name & Batch (Semen Details):</label>
                <input
                  type="text"
                  placeholder="Example: Imported American Friesian semen, batch #441"
                  value={newBreedingSemen}
                  onChange={(e) => setNewBreedingSemen(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20] text-xs"
                />
              </div>

              {/* نوٹس */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes & Special Instructions:</label>
                <textarea
                  rows={2}
                  placeholder="Ultrasound report or alert notes..."
                  value={newBreedingNotes}
                  onChange={(e) => setNewBreedingNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1B5E20] text-xs"
                ></textarea>
              </div>

              {/* ایکشن بٹنز */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddBreedingModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B5E20] hover:bg-[#2e7d32] text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 کوئیک ایکشن ماڈلز اور پاپ اپس (Quick Action Popups & Modals) */}
      <QuickActionModals
        activeModal={showQuickModalType}
        onClose={() => setShowQuickModalType(null)}
        animals={animals}
        breedingRecords={breedingRecords}
        onAddMilk={(morning, evening, rate, fat) => {
          const total = morning + evening;
          const newEntry: MilkLog = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            morning,
            evening,
            total,
            fat,
            snf: 8.9,
            sold: Math.max(0, total - 4.5),
            rate
          };
          const updated = [newEntry, ...milkLogs];
          setMilkLogs(updated);
          dairyDb.saveTable(DB_KEYS.MILK, updated);
          triggerDbSaveNotice(`Milk entry saved to the database: ${total.toFixed(1)}L on ${newEntry.date} ✓`);
        }}
        onAddExpense={handleAddExpense}
        onAddFeed={handleAddFeed}
        onAddHealthIssue={handleAddHealthIssue}
        onAddBreeding={(rec) => {
          const newRecord: BreedingRecord = { ...rec, id: Date.now() };
          const updated = [newRecord, ...breedingRecords];
          setBreedingRecords(updated);
          dairyDb.saveTable(DB_KEYS.BREEDING, updated);
          if (rec.status === 'Pregnant') {
            const updatedAnimals = animals.map(a => a.tagNo === rec.animalId ? { ...a, category: 'Gabhan' as const } : a);
            setAnimals(updatedAnimals);
            dairyDb.saveTable(DB_KEYS.ANIMALS, updatedAnimals);
          }
          triggerDbSaveNotice(`Breeding Record Saved to Database: ${rec.animalId} (${rec.status}) ✓`);
        }}
        onAddSale={handleAddSale}
        onMarkAsCalved={handleMarkAsCalved}
        onLogVitals={handleLogVitals}
        onAddVaccine={handleAddVaccineRecord}
        preselectedAnimalTag={selectedPregnantAnimalTag}
      />

      {/* 💾 ڈیٹا بیس مینیجر ماڈل (Database Manager & Persistence Hub Modal) */}
      {showDbManagerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-gray-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-bold">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                      Database Tables & Persistence Hub
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#1B5E20] border border-emerald-300">
                      Live & Permanent
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-['Noto_Nastaliq_Urdu']">
                    All records remain saved after refreshing the browser and can be exported.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDbManagerModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Database Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Database Status</span>
                <div className="text-base font-black text-[#1B5E20] flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Connected</span>
                </div>
                <span className="text-[10px] text-emerald-800 font-['Noto_Nastaliq_Urdu']">Connected</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Total Tables</span>
                <div className="text-base font-black text-blue-900 mt-0.5">10 Tables</div>
                <span className="text-[10px] text-blue-800 font-['Noto_Nastaliq_Urdu']">10-Table Schema</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Total Records</span>
                <div className="text-base font-black text-amber-900 mt-0.5">
                  {animals.length + milkLogs.length + expenses.length + feedRecords.length + breedingRecords.length + vaccineRecords.length + healthIssues.length + customers.length + paymentHistory.length + saleRecords.length}
                </div>
                <span className="text-[10px] text-amber-800 font-['Noto_Nastaliq_Urdu']">Total Saved Records</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Storage Type</span>
                <div className="text-base font-black text-purple-900 mt-0.5">Persistent DB</div>
                <span className="text-[10px] text-purple-800 font-['Noto_Nastaliq_Urdu']">Local Database</span>
              </div>
            </div>

            {/* 10 Tables Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Database Tables (Active Schemas):</span>
                <span className="text-[11px] text-gray-400 font-normal">Auto-persisted on every save</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border bg-gray-50 flex items-center justify-between">
                  <div>
                    <strong className="text-gray-800 block">1. Animal Herd</strong>
                    <span className="text-[10px] text-gray-500 font-mono">table: dairy_db_animals</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{animals.length} rows</span>
                </div>
                <div className="p-2.5 rounded-xl border bg-gray-50 flex items-center justify-between">
                  <div>
                    <strong className="text-gray-800 block">2. Milk Production</strong>
                    <span className="text-[10px] text-gray-500 font-mono">table: dairy_db_milk_production</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{milkLogs.length} rows</span>
                </div>
                <div className="p-2.5 rounded-xl border bg-gray-50 flex items-center justify-between">
                  <div>
                    <strong className="text-gray-800 block">3. Expenses</strong>
                    <span className="text-[10px] text-gray-500 font-mono">table: dairy_db_expenses</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{expenses.length} rows</span>
                </div>
                <div className="p-2.5 rounded-xl border bg-gray-50 flex items-center justify-between">
                  <div>
                    <strong className="text-gray-800 block">4. Feed & Ration</strong>
                    <span className="text-[10px] text-gray-500 font-mono">table: dairy_db_feed_ration</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{feedRecords.length} rows</span>
                </div>
                <div className="p-2.5 rounded-xl border bg-gray-50 flex items-center justify-between">
                  <div>
                    <strong className="text-gray-800 block">5. Breeding & Calving</strong>
                    <span className="text-[10px] text-gray-500 font-mono">table: dairy_db_breeding</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{breedingRecords.length} rows</span>
                </div>
                <div className="p-2.5 rounded-xl border bg-gray-50 flex items-center justify-between">
                  <div>
                    <strong className="text-gray-800 block">6. Vaccination Schedule</strong>
                    <span className="text-[10px] text-gray-500 font-mono">table: dairy_db_vaccination</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{vaccineRecords.length} rows</span>
                </div>
                <div className="p-2.5 rounded-xl border bg-gray-50 flex items-center justify-between">
                  <div>
                    <strong className="text-gray-800 block">7. Health & Clinical Records</strong>
                    <span className="text-[10px] text-gray-500 font-mono">table: dairy_db_health_issues</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{healthIssues.length} rows</span>
                </div>
                <div className="p-2.5 rounded-xl border bg-gray-50 flex items-center justify-between">
                  <div>
                    <strong className="text-gray-800 block">8. Customer Accounts</strong>
                    <span className="text-[10px] text-gray-500 font-mono">table: dairy_db_customers</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{customers.length} rows</span>
                </div>
                <div className="p-2.5 rounded-xl border bg-gray-50 flex items-center justify-between">
                  <div>
                    <strong className="text-gray-800 block">9. Payment Transactions</strong>
                    <span className="text-[10px] text-gray-500 font-mono">table: dairy_db_payment_history</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{paymentHistory.length} rows</span>
                </div>
                <div className="p-2.5 rounded-xl border bg-gray-50 flex items-center justify-between">
                  <div>
                    <strong className="text-gray-800 block">10. Livestock Sales</strong>
                    <span className="text-[10px] text-gray-500 font-mono">table: dairy_db_sales</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{saleRecords.length} rows</span>
                </div>
              </div>
            </div>

            {/* Backup & Import Actions */}
            <div className="p-4 rounded-xl bg-[#F8F9F5] border border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <strong className="text-xs text-gray-800 block">Database Backup & Recovery</strong>
                <p className="text-[11px] text-gray-500">Download complete ERP database JSON backup or restore from file</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const jsonStr = dairyDb.exportFullBackup();
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Dairy_Farm_ERP_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    triggerDbSaveNotice('Database backup downloaded successfully ✓');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1B5E20] hover:bg-[#2e7d32] text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Backup (JSON)</span>
                </button>

                <label className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-300 hover:bg-gray-100 text-gray-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restore Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content && dairyDb.importFullBackup(content)) {
                          triggerDbSaveNotice('Database Restored Successfully! Reloading tables... ✓');
                          setTimeout(() => window.location.reload(), 1200);
                        } else {
                          alert('Invalid database backup JSON file.');
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setShowDbManagerModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
