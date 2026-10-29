import React, { useState } from 'react';
import {
  X,
  Milk,
  DollarSign,
  Wheat,
  Stethoscope,
  Dna,
  ShoppingCart,
  Baby,
  Activity,
  Check,
  Thermometer,
  HeartPulse,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Animal, BreedingRecord, VaccineRecord, HealthIssue } from '../types';

interface QuickActionModalsProps {
  activeModal: 'milk' | 'expense' | 'feed' | 'health' | 'breeding' | 'sale' | 'calved' | 'vitals' | 'vaccine' | null;
  onClose: () => void;
  animals: Animal[];
  breedingRecords: BreedingRecord[];
  onAddMilk: (morning: number, evening: number, rate: number, fat: number) => void;
  onAddExpense: (category: string, amount: number, notes: string) => void;
  onAddFeed: (feedType: string, qtyKg: number, cost: number, notes: string) => void;
  onAddHealthIssue: (issue: Omit<HealthIssue, 'id'>) => void;
  onAddBreeding: (record: Omit<BreedingRecord, 'id'>) => void;
  onAddSale: (animalTag: string, buyer: string, price: number, notes: string) => void;
  onMarkAsCalved: (motherTag: string, calfGender: 'Male' | 'Female', calfWeight: number, birthDate: string, calfTag: string, ease: string) => void;
  onLogVitals: (animalTag: string, temp: number, fetalMovement: string, rumination: string, bcs: number, notes: string) => void;
  onAddVaccine: (vaccine: Omit<VaccineRecord, 'id'>) => void;
  preselectedAnimalTag?: string;
}

export const QuickActionModals: React.FC<QuickActionModalsProps> = ({
  activeModal,
  onClose,
  animals,
  breedingRecords,
  onAddMilk,
  onAddExpense,
  onAddFeed,
  onAddHealthIssue,
  onAddBreeding,
  onAddSale,
  onMarkAsCalved,
  onLogVitals,
  onAddVaccine,
  preselectedAnimalTag
}) => {
  // Milk state
  const [morningMilk, setMorningMilk] = useState<number>(43);
  const [eveningMilk, setEveningMilk] = useState<number>(37);
  const [milkRate, setMilkRate] = useState<number>(190);
  const [milkFat, setMilkFat] = useState<number>(5.8);

  // Expense state
  const [expenseCategory, setExpenseCategory] = useState<string>('Feed & Winda');
  const [expenseAmount, setExpenseAmount] = useState<number>(15000);
  const [expenseNotes, setExpenseNotes] = useState<string>('');

  // Feed state
  const [feedType, setFeedType] = useState<string>('Balanced Vanda 22% CP');
  const [feedQty, setFeedQty] = useState<number>(200);
  const [feedCost, setFeedCost] = useState<number>(18000);
  const [feedNotes, setFeedNotes] = useState<string>('4 Bags from Supreme Feed Mill');

  // Health state
  const [healthAnimalTag, setHealthAnimalTag] = useState<string>(preselectedAnimalTag || animals[0]?.tagNo || 'PK-101');
  const [healthDiagnosis, setHealthDiagnosis] = useState<string>('Mastitis Screening');
  const [healthSeverity, setHealthSeverity] = useState<'Mild' | 'Moderate' | 'Critical'>('Mild');
  const [healthTemp, setHealthTemp] = useState<number>(101.8);
  const [healthTreatment, setHealthTreatment] = useState<string>('Antibiotic intramammary infusion + anti-inflammatory');
  const [healthCost, setHealthCost] = useState<number>(1200);
  const [healthNotes, setHealthNotes] = useState<string>('');

  // Breeding state
  const [breedingAnimalTag, setBreedingAnimalTag] = useState<string>(preselectedAnimalTag || 'PK-104');
  const [breedingHeatDate, setBreedingHeatDate] = useState<string>('2026-10-21');
  const [breedingAiDate, setBreedingAiDate] = useState<string>('2026-10-22');
  const [breedingStatus, setBreedingStatus] = useState<BreedingRecord['status']>('Inseminated');
  const [breedingSemen, setBreedingSemen] = useState<string>('Imported Sahiwal Champion Semen #55');
  const [breedingNotes, setBreedingNotes] = useState<string>('');

  // Sale state
  const [saleAnimalTag, setSaleAnimalTag] = useState<string>('PK-107');
  const [saleBuyer, setSaleBuyer] = useState<string>('Haji Aslam Qureshi');
  const [salePrice, setSalePrice] = useState<number>(145000);
  const [saleNotes, setSaleNotes] = useState<string>('Sold for Eid fattening, 50k token received');

  // Calved state
  const [calvedMotherTag, setCalvedMotherTag] = useState<string>(preselectedAnimalTag || 'PK-106');
  const [calfGender, setCalfGender] = useState<'Male' | 'Female'>('Female');
  const [calfWeight, setCalfWeight] = useState<number>(28);
  const [calfTag, setCalfTag] = useState<string>(`PK-${110 + animals.length}`);
  const [calvingDate, setCalvingDate] = useState<string>('2026-10-21');
  const [calvingEase, setCalvingEase] = useState<string>('Normal / Unassisted Calving');
  const [colostrumFed, setColostrumFed] = useState<boolean>(true);

  // Vitals state
  const [vitalsAnimalTag, setVitalsAnimalTag] = useState<string>(preselectedAnimalTag || 'PK-106');
  const [vitalsTemp, setVitalsTemp] = useState<number>(101.6);
  const [vitalsFetalMovement, setVitalsFetalMovement] = useState<string>('Strong & Active');
  const [vitalsRumination, setVitalsRumination] = useState<string>('Normal (3 cycles per 2 mins)');
  const [vitalsBcs, setVitalsBcs] = useState<number>(3.5);
  const [vitalsNotes, setVitalsNotes] = useState<string>('Healthy dam in 3rd trimester. Good appetite.');

  // Vaccine state
  const [vacAnimalTag, setVacAnimalTag] = useState<string>(preselectedAnimalTag || animals[0]?.tagNo || 'PK-101');
  const [vacName, setVacName] = useState<string>('FMD Polyvalent Vaccine');
  const [vacDisease, setVacDisease] = useState<string>('Foot and Mouth Disease');
  const [vacDiseaseUrdu, setVacDiseaseUrdu] = useState<string>('Foot and Mouth Disease');
  const [vacDose, setVacDose] = useState<string>('5ml S/C');
  const [vacDueDate, setVacDueDate] = useState<string>('2026-11-15');
  const [vacBatch, setVacBatch] = useState<string>('VRI-BATCH-99');
  const [vacVet, setVacVet] = useState<string>('Dr. Tariq Veterinary Officer');
  const [vacNotes, setVacNotes] = useState<string>('');

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-l from-[#0d3813] to-[#1B5E20] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
              {activeModal === 'milk' && <Milk className="w-5 h-5" />}
              {activeModal === 'expense' && <DollarSign className="w-5 h-5 text-amber-300" />}
              {activeModal === 'feed' && <Wheat className="w-5 h-5 text-emerald-300" />}
              {activeModal === 'health' && <Stethoscope className="w-5 h-5 text-rose-300" />}
              {activeModal === 'breeding' && <Dna className="w-5 h-5 text-purple-300" />}
              {activeModal === 'sale' && <ShoppingCart className="w-5 h-5 text-orange-300" />}
              {activeModal === 'calved' && <Baby className="w-5 h-5 text-yellow-300" />}
              {activeModal === 'vitals' && <Activity className="w-5 h-5 text-cyan-300" />}
              {activeModal === 'vaccine' && <HeartPulse className="w-5 h-5 text-emerald-300" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {activeModal === 'milk' && 'Quick Milk Entry'}
                {activeModal === 'expense' && 'Quick Expense Log'}
                {activeModal === 'feed' && 'Quick Feed & Winda'}
                {activeModal === 'health' && 'Quick Health & Illness Check'}
                {activeModal === 'breeding' && 'Quick Breeding & Heat Log'}
                {activeModal === 'sale' && 'Quick Animal Sale'}
                {activeModal === 'calved' && 'Mark as Calved & Register Newborn'}
                {activeModal === 'vitals' && 'Quick Animal Vitals Log'}
                {activeModal === 'vaccine' && 'Schedule Vaccination Dose'}
              </h3>
              <p className="text-xs text-emerald-200 font-['Noto_Nastaliq_Urdu']">
                Quick entry • automatically saved to the database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* 1. MILK MODAL */}
          {activeModal === 'milk' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              onAddMilk(morningMilk, eveningMilk, milkRate, milkFat);
              onClose();
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Morning Milk*:</label>
                  <input
                    type="number"
                    step="0.5"
                    value={morningMilk}
                    onChange={(e) => setMorningMilk(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Evening Milk*:</label>
                  <input
                    type="number"
                    step="0.5"
                    value={eveningMilk}
                    onChange={(e) => setEveningMilk(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rate per Liter:</label>
                  <input
                    type="number"
                    value={milkRate}
                    onChange={(e) => setMilkRate(parseFloat(e.target.value) || 190)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Average Fat %:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={milkFat}
                    onChange={(e) => setMilkFat(parseFloat(e.target.value) || 5.8)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 flex justify-between font-bold border border-emerald-200">
                <span>Total Milk: {(morningMilk + eveningMilk).toFixed(1)} L</span>
                <span>Est. Revenue: Rs. {((morningMilk + eveningMilk) * milkRate).toLocaleString()}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#1B5E20] hover:bg-[#2e7d32] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Save Milk Record</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. EXPENSE MODAL */}
          {activeModal === 'expense' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              onAddExpense(expenseCategory, expenseAmount, expenseNotes);
              onClose();
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Expense Category*:</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                >
                  <option>Feed & Winda, Fodder, and Silage</option>
                  <option>Veterinary Care, Medicines, Vaccines, and Fees</option>
                  <option>Labor & Farm Staff Wages</option>
                  <option>Electricity & Generator Diesel</option>
                  <option>Shed Maintenance & Repair</option>
                  <option>Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amount (PKR)*:</label>
                <input
                  type="number"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-xl text-base font-black text-rose-700 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payment Notes / Paid To:</label>
                <input
                  type="text"
                  placeholder="e.g. 5 bags Khal Binola from Sabzi Mandi supplier"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#1B5E20] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#FF8F00] hover:bg-[#e65100] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. FEED MODAL */}
          {activeModal === 'feed' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              onAddFeed(feedType, feedQty, feedCost, feedNotes);
              onClose();
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Feed Type*:</label>
                <select
                  value={feedType}
                  onChange={(e) => setFeedType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                >
                  <option>Balanced Vanda 22% CP</option>
                  <option>Corn Silage</option>
                  <option>Wheat Straw</option>
                  <option>Binola Cake</option>
                  <option>Rhodes Grass Hay</option>
                  <option>Mineral Mixture & Salts</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quantity (Kg / Bags)*:</label>
                  <input
                    type="number"
                    value={feedQty}
                    onChange={(e) => setFeedQty(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Total Cost (PKR)*:</label>
                  <input
                    type="number"
                    value={feedCost}
                    onChange={(e) => setFeedCost(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Supplier / Quality Notes:</label>
                <input
                  type="text"
                  value={feedNotes}
                  onChange={(e) => setFeedNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#1B5E20] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#1B5E20] hover:bg-[#2e7d32] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Log Feed Entry</span>
                </button>
              </div>
            </form>
          )}

          {/* 4. HEALTH MODAL */}
          {activeModal === 'health' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              onAddHealthIssue({
                animalTag: healthAnimalTag,
                date: new Date().toISOString().split('T')[0],
                diagnosis: healthDiagnosis,
                diagnosisUrdu: healthDiagnosis.includes('Mastitis') ? 'Signs of mastitis' : 'Medical examination and treatment',
                severity: healthSeverity,
                temperature: healthTemp,
                treatment: healthTreatment,
                medication: healthTreatment.split('+')[0] || 'Broad spectrum antibiotic',
                cost: healthCost,
                status: 'Under Treatment',
                notes: healthNotes || 'Reported via Quick Action'
              });
              onClose();
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Select Animal*:</label>
                  <select
                    value={healthAnimalTag}
                    onChange={(e) => setHealthAnimalTag(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  >
                    {animals.map((a) => (
                      <option key={a.id} value={a.tagNo}>{a.tagNo} - {a.breed}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Body Temperature (°F):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={healthTemp}
                    onChange={(e) => setHealthTemp(parseFloat(e.target.value) || 101.5)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Illness / Diagnosis*:</label>
                <input
                  type="text"
                  value={healthDiagnosis}
                  onChange={(e) => setHealthDiagnosis(e.target.value)}
                  required
                  placeholder="e.g. Mastitis, Bovine Ephemeral Fever, Indigestion"
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Severity:</label>
                  <select
                    value={healthSeverity}
                    onChange={(e) => setHealthSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estimated Cost (PKR):</label>
                  <input
                    type="number"
                    value={healthCost}
                    onChange={(e) => setHealthCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Treatment / Medicine Given:</label>
                <textarea
                  rows={2}
                  value={healthTreatment}
                  onChange={(e) => setHealthTreatment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#1B5E20] outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Log Illness</span>
                </button>
              </div>
            </form>
          )}

          {/* 5. BREEDING MODAL */}
          {activeModal === 'breeding' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const animal = animals.find(a => a.tagNo === breedingAnimalTag);
              const breed = animal ? animal.breed : 'ساہیوال گائے (Sahiwal)';
              const isBuffalo = breed.includes('بھینس') || breed.includes('Buffalo');
              const gestationDays = isBuffalo ? 310 : 280;
              const aiDateObj = new Date(breedingAiDate);
              const expDate = new Date(aiDateObj.getTime() + gestationDays * 24 * 60 * 60 * 1000);

              onAddBreeding({
                animalId: breedingAnimalTag,
                animalName: `${breedingAnimalTag} (${breed})`,
                breed,
                heatDate: breedingHeatDate,
                aiDate: breedingAiDate,
                pregnancyCheckDate: new Date(aiDateObj.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                expectedDeliveryDate: expDate.toISOString().split('T')[0],
                status: breedingStatus,
                semenDetails: breedingSemen,
                notes: breedingNotes || 'Logged via Quick Action'
              });
              onClose();
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Animal*:</label>
                <select
                  value={breedingAnimalTag}
                  onChange={(e) => setBreedingAnimalTag(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                >
                  {animals.filter(a => a.category !== 'Bail').map((a) => (
                    <option key={a.id} value={a.tagNo}>{a.tagNo} - {a.breed} ({a.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Heat Date:</label>
                  <input
                    type="date"
                    value={breedingHeatDate}
                    onChange={(e) => setBreedingHeatDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">AI / Insemination Date*:</label>
                  <input
                    type="date"
                    required
                    value={breedingAiDate}
                    onChange={(e) => setBreedingAiDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Semen / Bull Details:</label>
                <input
                  type="text"
                  value={breedingSemen}
                  onChange={(e) => setBreedingSemen(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#1B5E20] outline-none"
                />
              </div>

              <div className="p-3 bg-[#FFF8E1] rounded-xl border border-[#ffe082] text-xs flex items-center justify-between">
                <span className="font-bold text-gray-800">Auto Expected Calving (+280 / +310d):</span>
                <strong className="text-[#1B5E20] font-black">
                  {(() => {
                    const ai = new Date(breedingAiDate);
                    const days = breedingAnimalTag.includes('102') || breedingAnimalTag.includes('105') ? 310 : 280;
                    return new Date(ai.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  })()}
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#1B5E20] hover:bg-[#2e7d32] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Save Breeding</span>
                </button>
              </div>
            </form>
          )}

          {/* 6. SALE MODAL */}
          {activeModal === 'sale' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              onAddSale(saleAnimalTag, saleBuyer, salePrice, saleNotes);
              onClose();
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Animal for Sale*:</label>
                <select
                  value={saleAnimalTag}
                  onChange={(e) => setSaleAnimalTag(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                >
                  {animals.map((a) => (
                    <option key={a.id} value={a.tagNo}>{a.tagNo} - {a.breed} ({a.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Buyer Name*:</label>
                  <input
                    type="text"
                    required
                    value={saleBuyer}
                    onChange={(e) => setSaleBuyer(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Agreed Price (PKR)*:</label>
                  <input
                    type="number"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl text-base font-black text-emerald-800 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Terms / Advance / Notes:</label>
                <input
                  type="text"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#1B5E20] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#FF8F00] hover:bg-[#e65100] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Record Sale</span>
                </button>
              </div>
            </form>
          )}

          {/* 7. MARK AS CALVED MODAL (From Pregnancy Countdown Widget) */}
          {activeModal === 'calved' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              onMarkAsCalved(calvedMotherTag, calfGender, calfWeight, calvingDate, calfTag, calvingEase);
              onClose();
            }} className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[#1B5E20]">
                  <Baby className="w-4 h-4" />
                  <span>Congratulations on the New Calf!</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Mother will automatically be marked as <strong>'Doodh wali' (Milking)</strong>, breeding record will be updated, and the newborn calf will be added to herd.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mother Cow / Dam*:</label>
                  <select
                    value={calvedMotherTag}
                    onChange={(e) => setCalvedMotherTag(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  >
                    {animals.filter(a => a.category === 'Gabhan' || breedingRecords.some(b => b.animalId === a.tagNo && b.status === 'Pregnant')).map((a) => (
                      <option key={a.id} value={a.tagNo}>{a.tagNo} - {a.breed}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Calving Date*:</label>
                  <input
                    type="date"
                    required
                    value={calvingDate}
                    onChange={(e) => setCalvingDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Calf Gender:</label>
                  <select
                    value={calfGender}
                    onChange={(e) => setCalfGender(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  >
                    <option value="Female">Female Calf</option>
                    <option value="Male">Male Calf</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">New Tag #:</label>
                  <input
                    type="text"
                    required
                    value={calfTag}
                    onChange={(e) => setCalfTag(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Birth Weight (Kg):</label>
                  <input
                    type="number"
                    value={calfWeight}
                    onChange={(e) => setCalfWeight(parseFloat(e.target.value) || 25)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Calving Ease:</label>
                <select
                  value={calvingEase}
                  onChange={(e) => setCalvingEase(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                >
                  <option>Normal / Unassisted</option>
                  <option>Slight Assistance</option>
                  <option>Veterinary Assisted</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="colostrum"
                  checked={colostrumFed}
                  onChange={(e) => setColostrumFed(e.target.checked)}
                  className="w-4 h-4 text-[#1B5E20] rounded"
                />
                <label htmlFor="colostrum" className="text-xs font-bold text-gray-800">
                  Colostrum fed within the first 2 hours (10% of body weight)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#1B5E20] hover:bg-[#2e7d32] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Register Calving & Newborn</span>
                </button>
              </div>
            </form>
          )}

          {/* 8. QUICK LOG VITALS MODAL */}
          {activeModal === 'vitals' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              onLogVitals(vitalsAnimalTag, vitalsTemp, vitalsFetalMovement, vitalsRumination, vitalsBcs, vitalsNotes);
              onClose();
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pregnant Animal*:</label>
                  <select
                    value={vitalsAnimalTag}
                    onChange={(e) => setVitalsAnimalTag(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  >
                    {animals.filter(a => a.category === 'Gabhan' || breedingRecords.some(b => b.animalId === a.tagNo && b.status === 'Pregnant')).map((a) => (
                      <option key={a.id} value={a.tagNo}>{a.tagNo} - {a.breed}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Body Temperature (°F)*:</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={vitalsTemp}
                    onChange={(e) => setVitalsTemp(parseFloat(e.target.value) || 101.5)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fetal Movement:</label>
                  <select
                    value={vitalsFetalMovement}
                    onChange={(e) => setVitalsFetalMovement(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  >
                    <option>Strong & Active</option>
                    <option>Normal</option>
                    <option>Weak / Sluggish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Body Condition Score (BCS 1-5):</label>
                  <input
                    type="number"
                    step="0.25"
                    min="1"
                    max="5"
                    value={vitalsBcs}
                    onChange={(e) => setVitalsBcs(parseFloat(e.target.value) || 3.5)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rumination / Appetite:</label>
                <input
                  type="text"
                  value={vitalsRumination}
                  onChange={(e) => setVitalsRumination(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#1B5E20] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Veterinary / Observation Notes:</label>
                <textarea
                  rows={2}
                  value={vitalsNotes}
                  onChange={(e) => setVitalsNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#1B5E20] outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#1B5E20] hover:bg-[#2e7d32] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Save Vitals Log</span>
                </button>
              </div>
            </form>
          )}

          {/* 9. ADD VACCINE MODAL */}
          {activeModal === 'vaccine' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const animal = animals.find(a => a.tagNo === vacAnimalTag);
              onAddVaccine({
                animalTag: vacAnimalTag,
                animalName: `${vacAnimalTag} (${animal?.breed || 'Dairy Cattle'})`,
                breed: animal?.breed || 'Sahiwal Cow',
                vaccineName: vacName,
                disease: vacDisease,
                diseaseUrdu: vacDiseaseUrdu,
                lastGivenDate: new Date().toISOString().split('T')[0],
                nextDueDate: vacDueDate,
                frequencyMonths: 6,
                dosage: vacDose,
                route: 'Subcutaneous',
                status: 'Upcoming',
                batchNo: vacBatch,
                vetName: vacVet,
                notes: vacNotes || 'Administered and logged'
              });
              onClose();
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Select Animal*:</label>
                  <select
                    value={vacAnimalTag}
                    onChange={(e) => setVacAnimalTag(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  >
                    {animals.map((a) => (
                      <option key={a.id} value={a.tagNo}>{a.tagNo} - {a.breed}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Next Due Date*:</label>
                  <input
                    type="date"
                    required
                    value={vacDueDate}
                    onChange={(e) => setVacDueDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vaccine Name*:</label>
                <select
                  value={vacName}
                  onChange={(e) => {
                    setVacName(e.target.value);
                    if (e.target.value.includes('FMD')) {
                      setVacDisease('Foot and Mouth Disease');
                      setVacDiseaseUrdu('Foot and Mouth Disease');
                      setVacDose('5ml S/C');
                    } else if (e.target.value.includes('HS')) {
                      setVacDisease('Hemorrhagic Septicemia');
                      setVacDiseaseUrdu('Hemorrhagic Septicemia');
                      setVacDose('5ml S/C');
                    } else if (e.target.value.includes('Anthrax')) {
                      setVacDisease('Anthrax');
                      setVacDiseaseUrdu('Anthrax');
                      setVacDose('1ml S/C');
                    } else if (e.target.value.includes('Deworming')) {
                      setVacDisease('Gastrointestinal Parasites');
                      setVacDiseaseUrdu('Intestinal worms');
                      setVacDose('100ml Oral');
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1B5E20] outline-none"
                >
                  <option>FMD Polyvalent Vaccine</option>
                  <option>HS Alum Precipitated Vaccine</option>
                  <option>Anthrax Spore Vaccine</option>
                  <option>Blackleg Vaccine - BQ</option>
                  <option>Quarterly Deworming</option>
                  <option>Theileriosis Prophylaxis</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Dose & Route:</label>
                  <input
                    type="text"
                    value={vacDose}
                    onChange={(e) => setVacDose(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Batch # / Supplier:</label>
                  <input
                    type="text"
                    value={vacBatch}
                    onChange={(e) => setVacBatch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Veterinarian / Administered By:</label>
                <input
                  type="text"
                  value={vacVet}
                  onChange={(e) => setVacVet(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#1B5E20] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#1B5E20] hover:bg-[#2e7d32] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Save Vaccine</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
