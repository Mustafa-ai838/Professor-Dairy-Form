import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  HeartPulse,
  Syringe,
  Stethoscope,
  Calendar,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Layers,
  Clock,
  Sparkles,
  Thermometer,
  FileText,
  Pill,
  Check
} from 'lucide-react';
import { Animal, VaccineRecord, HealthIssue } from '../types';

interface HealthTabProps {
  animals: Animal[];
  vaccineRecords: VaccineRecord[];
  healthIssues: HealthIssue[];
  onAdministerVaccine: (vaccineId: number) => void;
  onOpenAddVaccineModal: () => void;
  onOpenAddHealthIssueModal: () => void;
  onMarkIssueRecovered: (issueId: number) => void;
  onUpdateAnimalHealthStatus: (animalTag: string, status: Animal['healthStatus']) => void;
}

// Custom Tooltip for the Recharts Bar Chart
const CustomHealthTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-gray-200 text-left text-xs space-y-1 min-w-[190px]">
        <div className="font-bold text-gray-900 border-b pb-1 flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.fill }}></span>
            <span>{data.name}</span>
          </span>
          <span className="text-[11px] text-gray-500 font-['Noto_Nastaliq_Urdu']">{data.nameUrdu}</span>
        </div>
        <div className="flex justify-between items-center text-gray-700 pt-1">
          <span className="text-gray-500">Animal Count:</span>
          <strong className="text-sm font-black text-gray-900">{data.count} Animals</strong>
        </div>
        <div className="flex justify-between items-center text-gray-600">
          <span className="text-gray-500">Herd Share:</span>
          <span className="font-bold text-[#1B5E20]">{data.percentage}</span>
        </div>
        <div className="text-[10px] text-gray-400 italic pt-1 border-t border-gray-100">
          {data.description}
        </div>
      </div>
    );
  }
  return null;
};

export const HealthTab: React.FC<HealthTabProps> = ({
  animals,
  vaccineRecords,
  healthIssues,
  onAdministerVaccine,
  onOpenAddVaccineModal,
  onOpenAddHealthIssueModal,
  onMarkIssueRecovered,
  onUpdateAnimalHealthStatus
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'calendar' | 'schedules'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [breedFilter, setBreedFilter] = useState<string>('All');
  const [calendarMonthOffset, setCalendarMonthOffset] = useState<number>(0); // 0 = Oct 2026
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>('2026-10-25');
  const [selectedHealthStatusFilter, setSelectedHealthStatusFilter] = useState<string | null>(null);

  // 1. Compute Distribution of Animal Health Status for Recharts Bar Chart
  const healthChartData = useMemo(() => {
    const total = animals.length || 1;
    
    // Counts based on healthStatus field with fallback logic
    const healthyCount = animals.filter(a => a.healthStatus === 'Healthy' || (!a.healthStatus && a.status === 'Faal' && a.id % 4 !== 0)).length;
    const vaccinatedCount = animals.filter(a => a.healthStatus === 'Vaccinated' || (!a.healthStatus && a.lastVaccine && a.id % 3 === 0)).length;
    const treatmentCount = animals.filter(a => a.healthStatus === 'Treatment Needed' || healthIssues.some(h => h.animalTag === a.tagNo && h.status === 'Under Treatment')).length;
    const criticalOverdueCount = vaccineRecords.filter(v => v.status === 'Overdue').length || animals.filter(a => a.healthStatus === 'Critical').length;

    return [
      {
        id: 'healthy',
        name: 'Healthy',
        nameUrdu: 'Healthy',
        count: healthyCount,
        fill: '#10B981', // Emerald
        percentage: `${Math.round((healthyCount / total) * 100)}%`,
        description: 'Active animals in prime condition'
      },
      {
        id: 'vaccinated',
        name: 'Vaccinated',
        nameUrdu: 'Vaccinated',
        count: vaccinatedCount,
        fill: '#2563EB', // Blue
        percentage: `${Math.round((vaccinatedCount / total) * 100)}%`,
        description: 'Up to date with essential immunizations'
      },
      {
        id: 'treatment',
        name: 'Treatment Needed',
        nameUrdu: 'Under treatment',
        count: treatmentCount,
        fill: '#F59E0B', // Amber
        percentage: `${Math.round((treatmentCount / total) * 100)}%`,
        description: 'Under veterinarian monitoring / medication'
      },
      {
        id: 'overdue',
        name: 'Overdue / Alert',
        nameUrdu: 'Overdue vaccinations',
        count: criticalOverdueCount,
        fill: '#EF4444', // Red
        percentage: `${Math.round((criticalOverdueCount / total) * 100)}%`,
        description: 'Missed scheduled doses requiring action'
      }
    ];
  }, [animals, healthIssues, vaccineRecords]);

  // Overall Wellness Score
  const wellnessScore = useMemo(() => {
    const healthyOrVaccinated = animals.filter(a => a.healthStatus === 'Healthy' || a.healthStatus === 'Vaccinated').length;
    return Math.round((healthyOrVaccinated / (animals.length || 1)) * 100);
  }, [animals]);

  // Active treatments count
  const activeTreatmentsCount = useMemo(() => {
    return healthIssues.filter(h => h.status === 'Under Treatment' || h.status === 'Quarantine').length;
  }, [healthIssues]);

  // Upcoming vaccines due soon
  const dueSoonCount = useMemo(() => {
    return vaccineRecords.filter(v => v.status === 'Due Soon' || v.status === 'Overdue').length;
  }, [vaccineRecords]);

  // Filtered Vaccine Schedule
  const filteredVaccines = useMemo(() => {
    return vaccineRecords.filter(rec => {
      const matchesSearch = !searchQuery ||
        rec.animalTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.vaccineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.breed.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
      const matchesBreed = breedFilter === 'All' || rec.breed.includes(breedFilter);
      return matchesSearch && matchesStatus && matchesBreed;
    });
  }, [vaccineRecords, searchQuery, statusFilter, breedFilter]);

  // Calendar Math (Base date: Oct 2026)
  const currentCalDate = new Date(2026, 9 + calendarMonthOffset, 1);
  const calYear = currentCalDate.getFullYear();
  const calMonth = currentCalDate.getMonth();
  const monthNames = [
    { en: 'January', ur: 'January' },
    { en: 'February', ur: 'February' },
    { en: 'March', ur: 'March' },
    { en: 'April', ur: 'April' },
    { en: 'May', ur: 'May' },
    { en: 'June', ur: 'June' },
    { en: 'July', ur: 'July' },
    { en: 'August', ur: 'August' },
    { en: 'September', ur: 'September' },
    { en: 'October', ur: 'October' },
    { en: 'November', ur: 'November' },
    { en: 'December', ur: 'December' }
  ];
  const currentMonthObj = monthNames[calMonth];
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0 is Sun
  const mondayOffset = (firstDayOfWeek + 6) % 7; // Monday = 0

  return (
    <div className="space-y-6">
      
      {/* 🌟 1. Header Banner (Bilingual English + Urdu, Green Theme) */}
      <div className="rounded-2xl p-6 bg-gradient-to-l from-[#0d3813] via-[#1B5E20] to-[#2e7d32] text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FF8F00] text-white shadow-xs">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Module 8: Herd Health & Vaccination Tracker</span>
            <span>•</span>
            <span className="font-['Noto_Nastaliq_Urdu']">Health and Vaccination Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Herd Health & Vaccination Management
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl">
            Track upcoming immunization schedules, breed-specific protocols (FMD, HS, Anthrax), health status distribution, and clinical treatments.
            <span className="block text-[11px] text-emerald-200 mt-0.5 font-['Noto_Nastaliq_Urdu']">
              Vaccination schedules by breed (FMD, Hemorrhagic Septicemia, Anthrax) and complete health records
            </span>
          </p>
        </div>

        {/* Action Buttons & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={onOpenAddVaccineModal}
            className="px-3.5 py-2 rounded-xl font-bold text-xs bg-[#FF8F00] hover:bg-[#e65100] text-white transition shadow flex items-center gap-2 cursor-pointer"
          >
            <Syringe className="w-4 h-4" />
            <div className="text-left">
              <div>+ Record Vaccine</div>
              <div className="text-[10px] opacity-90 font-['Noto_Nastaliq_Urdu']">Vaccine Entry</div>
            </div>
          </button>

          <button
            onClick={onOpenAddHealthIssueModal}
            className="px-3.5 py-2 rounded-xl font-bold text-xs bg-white text-[#1B5E20] hover:bg-emerald-50 transition shadow flex items-center gap-2 cursor-pointer"
          >
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <div className="text-left">
              <div>+ Log Treatment</div>
              <div className="text-[10px] opacity-90 font-['Noto_Nastaliq_Urdu']">Medical Examination</div>
            </div>
          </button>

          <div className="flex bg-white/20 p-1 rounded-xl backdrop-blur-xs">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'overview'
                  ? 'bg-white text-[#1B5E20] shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#1B5E20] shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('schedules')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'schedules'
                  ? 'bg-white text-[#1B5E20] shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Breed Protocols</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 2. Top Summary KPI Cards (Bilingual English + Urdu) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Overall Wellness Score */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#1B5E20]"></div>
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <div>
              <span className="text-xs font-bold text-gray-700 block">Herd Wellness Score</span>
              <span className="text-[10px] text-gray-400 font-['Noto_Nastaliq_Urdu']">Overall Herd Health Index</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight">{wellnessScore}%</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Optimal
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>Healthy Herd: <strong>{animals.filter(a => a.healthStatus !== 'Treatment Needed' && a.healthStatus !== 'Critical').length} / {animals.length}</strong></span>
            <span className="text-[11px] text-emerald-800 font-semibold font-['Noto_Nastaliq_Urdu']">Healthy Animals</span>
          </div>
        </div>

        {/* KPI 2: Immunization Coverage */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <div>
              <span className="text-xs font-bold text-gray-700 block">Vaccine Coverage</span>
              <span className="text-[10px] text-gray-400 font-['Noto_Nastaliq_Urdu']">Vaccination Coverage</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Syringe className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight">88.9%</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              8 Dosed
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>Primary Target: <strong>FMD & HS</strong></span>
            <span className="text-[11px] text-blue-800 font-semibold font-['Noto_Nastaliq_Urdu']">FMD and Hemorrhagic Septicemia</span>
          </div>
        </div>

        {/* KPI 3: Vaccines Due Soon / Overdue */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#FF8F00]"></div>
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <div>
              <span className="text-xs font-bold text-gray-700 block">Upcoming / Overdue</span>
              <span className="text-[10px] text-gray-400 font-['Noto_Nastaliq_Urdu']">Upcoming and Overdue Doses</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#FF8F00] flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight">{dueSoonCount}</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Action Required
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>Overdue: <strong className="text-rose-600">{vaccineRecords.filter(v => v.status === 'Overdue').length} doses</strong></span>
            <span className="text-[11px] text-amber-800 font-semibold font-['Noto_Nastaliq_Urdu']">Immediate Attention Required</span>
          </div>
        </div>

        {/* KPI 4: Active Treatments / Clinical Care */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-rose-500"></div>
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <div>
              <span className="text-xs font-bold text-gray-700 block">Active Treatments</span>
              <span className="text-[10px] text-gray-400 font-['Noto_Nastaliq_Urdu']">Under Treatment and Isolation</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight">{activeTreatmentsCount}</span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {activeTreatmentsCount > 0 ? 'Under Vet Watch' : 'All Clear'}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>Isolated: <strong>{healthIssues.filter(h => h.status === 'Quarantine').length} head</strong></span>
            <span className="text-[11px] text-rose-800 font-semibold font-['Noto_Nastaliq_Urdu']">Veterinary Supervision</span>
          </div>
        </div>

      </div>

      {/* 🌟 3. MAIN SECTION: Recharts Small Bar Chart (Health Status Distribution) + Wellness Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* The Recharts Bar Chart Card (Takes 7 cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                  <span>Animal Health Status Distribution</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-[#1B5E20] font-bold">
                    Recharts
                  </span>
                </h3>
                <p className="text-xs text-gray-500 font-['Noto_Nastaliq_Urdu']">
                  Herd health status overview (healthy, vaccinated, under treatment)
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Herd: <strong>{animals.length} Heads</strong></span>
            </div>
          </div>

          {/* 📊 Small Recharts Bar Chart Container */}
          <div className="w-full h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={healthChartData}
                margin={{ top: 12, right: 15, left: -15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomHealthTooltip />}
                  cursor={{ fill: 'rgba(27, 94, 32, 0.04)', radius: 8 }}
                />
                <Bar
                  dataKey="count"
                  radius={[8, 8, 0, 0]}
                  barSize={38}
                  animationDuration={800}
                >
                  {healthChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      className="cursor-pointer transition-opacity hover:opacity-85"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Clickable Status Badges underneath chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-gray-100">
            {healthChartData.map((status) => (
              <div
                key={status.id}
                onClick={() => setSelectedHealthStatusFilter(selectedHealthStatusFilter === status.name ? null : status.name)}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  selectedHealthStatusFilter === status.name
                    ? 'ring-2 ring-emerald-600 bg-emerald-50/50 border-emerald-300'
                    : 'bg-[#F8F9F5] border-gray-200/80 hover:bg-gray-100/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.fill }}></span>
                  <span className="text-xs font-black text-gray-900">{status.count}</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800 leading-tight">{status.name}</div>
                  <div className="text-[10px] text-gray-500 font-['Noto_Nastaliq_Urdu']">{status.nameUrdu}</div>
                </div>
                <div className="text-[10px] font-semibold text-emerald-800 mt-1">
                  {status.percentage} of herd
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Quick Health Actions & Protocol Highlights (Takes 5 cols on desktop) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#1B5E20]" />
                  <span>Veterinary Quick Guidelines</span>
                </h3>
                <p className="text-xs text-gray-500 font-['Noto_Nastaliq_Urdu']">
                  Preventive care and vaccination schedule guidelines
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#1B5E20]">
                Punjab L&DD
              </span>
            </div>

            {/* Quick alert banners */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Pre-Monsoon Warning: Hemorrhagic Septicemia (HS)</span>
              </div>
              <p className="text-[11px] text-amber-800">
                All Nili-Ravi buffaloes and Sahiwal cows must receive the HS vaccine before seasonal humidity increases.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Biannual Foot and Mouth Disease (FMD) Campaign</span>
              </div>
              <p className="text-[11px] text-blue-800">
                Next mass herd booster scheduled for November 2026. Maintain booster within 21 days for newly arrived heifers.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-[#1B5E20]">
                <CheckCircle2 className="w-4 h-4 text-[#1B5E20]" />
                <span>Routine Deworming</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Quarterly broad-spectrum anthelmintic (Albendazole / Oxyclozanide) rotation reduces feed conversion waste by up to 18%.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Last Herd Inspection:</span>
            <strong className="text-gray-800">20 Oct 2026 (Dr. Tariq Vet)</strong>
          </div>

        </div>

      </div>

      {/* 🌟 4. INTERACTIVE VACCINATION CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5">
          
          {/* Calendar Header with Month Navigator */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center font-bold">
                <CalendarDays className="w-5 h-5 text-[#1B5E20]" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                  <span>Interactive Vaccination & Health Calendar</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#FFF8E1] text-[#1B5E20] font-bold border border-[#ffe082]">
                    2026 Schedule
                  </span>
                </h3>
                <p className="text-xs text-gray-500 font-['Noto_Nastaliq_Urdu']">
                  Dated vaccination schedule and upcoming dose details
                </p>
              </div>
            </div>

            {/* Month Nav Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalendarMonthOffset(calendarMonthOffset - 1)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <div className="px-4 py-1.5 rounded-xl bg-[#FFF8E1] text-[#1B5E20] font-black text-sm border border-[#ffe082] flex items-center gap-2">
                <span>{currentMonthObj.en} {calYear}</span>
                <span className="text-xs font-['Noto_Nastaliq_Urdu'] text-gray-600">({currentMonthObj.ur})</span>
              </div>
              <button
                onClick={() => setCalendarMonthOffset(calendarMonthOffset + 1)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1 transition cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/40">
            
            {/* Week Days Header */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-700 bg-gray-100/80 py-2.5 border-b border-gray-200">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-100 bg-white">
              
              {/* Offset empty days for start of month */}
              {Array.from({ length: mondayOffset }).map((_, i) => (
                <div key={`cal-empty-${i}`} className="min-h-[92px] p-2 bg-gray-50/40"></div>
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isToday = dateStr === '2026-10-21';

                // Find all vaccines scheduled or due on this date
                const dayVaccines = vaccineRecords.filter(v => v.nextDueDate === dateStr);
                const isSelected = selectedCalendarDate === dateStr;

                return (
                  <div
                    key={`day-${dayNum}`}
                    onClick={() => setSelectedCalendarDate(dateStr)}
                    className={`min-h-[96px] p-2 transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/90 ring-2 ring-inset ring-[#1B5E20]'
                        : isToday
                        ? 'bg-amber-50/70 border border-amber-300'
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                        isToday
                          ? 'bg-[#FF8F00] text-white shadow-xs'
                          : isSelected
                          ? 'bg-[#1B5E20] text-white'
                          : 'text-gray-700'
                      }`}>
                        {dayNum}
                      </span>
                      {dayVaccines.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      )}
                    </div>

                    {/* Vaccine Pills */}
                    <div className="space-y-1">
                      {dayVaccines.map((v) => (
                        <div
                          key={v.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold truncate flex items-center gap-1 ${
                            v.status === 'Overdue'
                              ? 'bg-red-600 text-white shadow-xs'
                              : v.status === 'Due Soon'
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                          title={`${v.animalTag} - ${v.vaccineName} (${v.disease})`}
                        >
                          <Syringe className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{v.animalTag}: {v.vaccineName.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

            </div>

          </div>

          {/* Selected Date Details Panel */}
          {selectedCalendarDate && (
            <div className="p-4 rounded-xl bg-[#F8F9F5] border border-gray-200/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1B5E20]" />
                  <span className="text-xs font-bold text-gray-800">
                    Selected Schedule Date: <strong className="text-[#1B5E20]">{selectedCalendarDate}</strong>
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-['Noto_Nastaliq_Urdu']">
                  Vaccinations scheduled for this date
                </span>
              </div>

              {vaccineRecords.filter(v => v.nextDueDate === selectedCalendarDate).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vaccineRecords
                    .filter(v => v.nextDueDate === selectedCalendarDate)
                    .map((v) => (
                      <div key={v.id} className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-gray-900 text-sm">{v.animalTag}</span>
                            <span className="text-xs text-gray-500">({v.breed})</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              v.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {v.status}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-[#1B5E20] mt-0.5">{v.vaccineName}</div>
                          <div className="text-[11px] text-gray-500">Target: {v.disease} ({v.diseaseUrdu}) | Dose: {v.dosage}</div>
                        </div>

                        <button
                          onClick={() => onAdministerVaccine(v.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1B5E20] hover:bg-[#2e7d32] text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Administer</span>
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500 italic py-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No scheduled vaccines on this specific date. Click on other highlighted dates or add a new schedule entry.</span>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* 🌟 5. BREED-SPECIFIC VACCINATION PROTOCOLS (Pakistan Dairy Livestock Guidelines) */}
      {viewMode === 'schedules' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1B5E20]" />
                <span>Breed-Specific Vaccination Protocols (Pakistan Dairy Farms)</span>
              </h3>
              <p className="text-xs text-gray-500 font-['Noto_Nastaliq_Urdu']">
                Recommended veterinary and preventive schedules for Sahiwal cattle, Nili Ravi buffaloes, Friesian Cross cattle, and calves
              </p>
            </div>
            <span className="text-xs font-bold text-[#1B5E20] bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              Department of Livestock Punjab Standard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Protocol 1: Sahiwal & Cholistani Indigenous Cattle */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2.5">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <div className="font-black text-gray-900 text-sm flex items-center gap-1.5">
                  <span>🐄</span>
                  <span>Sahiwal & Cholistani Cows</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#1B5E20]">
                  High Hardy
                </span>
              </div>
              <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside">
                <li><strong className="text-emerald-900">FMD (Foot and Mouth Disease):</strong> Biannual (March & September) - 5ml S/C.</li>
                <li><strong className="text-emerald-900">HS (Hemorrhagic Septicemia):</strong> Pre-monsoon in May & Nov - 5ml S/C.</li>
                <li><strong className="text-emerald-900">Anthrax:</strong> Annual in endemic zones (July).</li>
                <li><strong className="text-emerald-900">Deworming:</strong> Quarterly rotation (Albendazole / Ivermectin).</li>
              </ul>
              <div className="text-[11px] text-gray-500 italic pt-1 border-t border-emerald-200/40 font-['Noto_Nastaliq_Urdu']">
                Indigenous breeds have good immunity, but timely FMD and HS vaccination is essential.
              </div>
            </div>

            {/* Protocol 2: Nili Ravi & Kundi Buffaloes */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2.5">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                <div className="font-black text-gray-900 text-sm flex items-center gap-1.5">
                  <span>🐃</span>
                  <span>Nili Ravi Buffaloes</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  HS Vulnerable
                </span>
              </div>
              <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside">
                <li><strong className="text-blue-900">HS (Hemorrhagic Septicemia):</strong> Critical! Every 6 months before rains (oil adjuvant vaccine).</li>
                <li><strong className="text-blue-900">FMD (Foot and Mouth Disease):</strong> Every 6 months (February & October).</li>
                <li><strong className="text-blue-900">Liver Fluke:</strong> Post-monsoon flooding deworming with Triclabendazole.</li>
                <li><strong className="text-blue-900">Mastitis Screening:</strong> Surf field test monthly.</li>
              </ul>
              <div className="text-[11px] text-gray-500 italic pt-1 border-t border-blue-200/40 font-['Noto_Nastaliq_Urdu']">
                Preventing Hemorrhagic Septicemia in buffaloes should be a top priority.
              </div>
            </div>

            {/* Protocol 3: Holstein Friesian Crossbreds */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2.5">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <div className="font-black text-gray-900 text-sm flex items-center gap-1.5">
                  <span>🥛</span>
                  <span>Friesian Crossbreds</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  High Yield / Sensitive
                </span>
              </div>
              <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside">
                <li><strong className="text-amber-900">Theileriosis (Tick Fever):</strong> Strict tick control (Cypermethrin spray) & Buparvaquone protocol.</li>
                <li><strong className="text-amber-900">FMD (Foot and Mouth Disease):</strong> High-potency polyvalent FMD booster every 6 months.</li>
                <li><strong className="text-amber-900">Heat Stress & Electrolytes:</strong> May to August continuous cooling & minerals.</li>
                <li><strong className="text-amber-900">Brucellosis:</strong> Calfhood vaccination (Strain 19) at 4-8 months.</li>
              </ul>
              <div className="text-[11px] text-gray-500 italic pt-1 border-t border-amber-200/40 font-['Noto_Nastaliq_Urdu']">
                Protect crossbreeds from ticks and heat stress.
              </div>
            </div>

            {/* Protocol 4: Young Calves (Newborn to 6 Months) */}
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-2.5">
              <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                <div className="font-black text-gray-900 text-sm flex items-center gap-1.5">
                  <span>👶</span>
                  <span>Calves & Heifers (&lt; 6mo)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Growth Phase
                </span>
              </div>
              <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside">
                <li><strong className="text-purple-900">Colostrum:</strong> 10% body weight within first 2 hours of birth.</li>
                <li><strong className="text-purple-900">Deworming:</strong> Day 14 and Day 30, then monthly until weaning.</li>
                <li><strong className="text-purple-900">Blackleg (BQ):</strong> At 3-4 months age.</li>
                <li><strong className="text-purple-900">FMD First Dose:</strong> At 4 months with booster at 5 months.</li>
              </ul>
              <div className="text-[11px] text-gray-500 italic pt-1 border-t border-purple-200/40 font-['Noto_Nastaliq_Urdu']">
                Timely colostrum feeding and deworming help improve future milk production.
              </div>
            </div>

            {/* Protocol 5: Breeding Bulls */}
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 space-y-2.5">
              <div className="flex items-center justify-between border-b border-teal-200/60 pb-2">
                <div className="font-black text-gray-900 text-sm flex items-center gap-1.5">
                  <span>🐂</span>
                  <span>Breeding Bulls</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  Reproductive
                </span>
              </div>
              <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside">
                <li><strong className="text-teal-900">Brucellosis & TB:</strong> Bi-annual blood screening for herd safety.</li>
                <li><strong className="text-teal-900">FMD & HS:</strong> Standard biannual protocol.</li>
                <li><strong className="text-teal-900">Vitamin ADE & Selenium:</strong> Monthly injection for sperm motility.</li>
                <li><strong className="text-teal-900">Hoof Trimming:</strong> Every 6 months.</li>
              </ul>
              <div className="text-[11px] text-gray-500 italic pt-1 border-t border-teal-200/40 font-['Noto_Nastaliq_Urdu']">
                The health of breeding bulls affects the herd's conception rate.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 🌟 6. VACCINATION SCHEDULE MASTER TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        
        {/* Table Top Controls & Search */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/70">
          <div className="flex items-center gap-2">
            <Syringe className="w-4 h-4 text-[#1B5E20]" />
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <span>All Animals Vaccination Schedule</span>
              <span className="text-xs text-gray-400 font-normal">({filteredVaccines.length} entries)</span>
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tag, vaccine, disease..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1B5E20] outline-none bg-white w-48 sm:w-56"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-[#1B5E20]"
            >
              <option value="All">All Statuses</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Overdue">Overdue</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Breed Filter */}
            <select
              value={breedFilter}
              onChange={(e) => setBreedFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-[#1B5E20]"
            >
              <option value="All">All Breeds</option>
              <option value="Sahiwal">Sahiwal Cattle</option>
              <option value="Nili Ravi">Nili Ravi Buffalo</option>
              <option value="Cholistani">Cholistani</option>
              <option value="Friesian">Friesian Cross</option>
              <option value="Calf">Calves</option>
            </select>
          </div>
        </div>

        {/* The Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9F5] text-gray-600 border-b border-gray-200 font-bold">
              <tr>
                <th className="py-3 px-4">Animal Tag & Breed</th>
                <th className="py-3 px-4">Vaccine & Target Disease</th>
                <th className="py-3 px-4">Last Given</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4">Dose & Route</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVaccines.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                      <span>{rec.animalTag}</span>
                      <span className="text-[10px] font-normal text-gray-400">#{rec.id}</span>
                    </div>
                    <div className="text-[11px] text-gray-500">{rec.breed}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-[#1B5E20]">{rec.vaccineName}</div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1">
                      <span>{rec.disease}</span>
                      <span className="text-gray-400 font-['Noto_Nastaliq_Urdu']">({rec.diseaseUrdu})</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-gray-700">
                    <div className="font-semibold">{rec.lastGivenDate || '-'}</div>
                    <div className="text-[10px] text-gray-400">Freq: Every {rec.frequencyMonths} mo</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-extrabold text-gray-900">{rec.nextDueDate}</div>
                    <div className="text-[10px] text-gray-500">
                      {rec.status === 'Overdue' ? (
                        <span className="text-rose-600 font-bold">Past Due!</span>
                      ) : rec.status === 'Due Soon' ? (
                        <span className="text-amber-600 font-bold">Due within 15 days</span>
                      ) : (
                        <span className="text-emerald-700">Scheduled</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-gray-600">
                    <div>{rec.dosage}</div>
                    <div className="text-[10px] text-gray-400">{rec.route}</div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                      rec.status === 'Overdue'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                        : rec.status === 'Due Soon'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : rec.status === 'Completed'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {rec.status === 'Overdue' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                      {rec.status === 'Completed' && <Check className="w-3 h-3 text-blue-600" />}
                      <span>{rec.status}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onAdministerVaccine(rec.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1B5E20] hover:bg-[#2e7d32] text-white shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                      title="Mark as Administered"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Administer</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* 🌟 7. CLINICAL HEALTH ISSUES & TREATMENT LOGS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/70">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <span>Recent Health Issues & Clinical Treatments</span>
              <span className="text-xs text-gray-400 font-normal">({healthIssues.length} records)</span>
            </h4>
          </div>

          <button
            onClick={onOpenAddHealthIssueModal}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF8F00] hover:bg-[#e65100] text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Report Illness / Treatment</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9F5] text-gray-600 border-b border-gray-200 font-bold">
              <tr>
                <th className="py-3 px-4">Animal Tag</th>
                <th className="py-3 px-4">Date Logged</th>
                <th className="py-3 px-4">Diagnosis & Illness</th>
                <th className="py-3 px-4">Vitals / Temp</th>
                <th className="py-3 px-4">Medication & Treatment</th>
                <th className="py-3 px-4">Vet Cost</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {healthIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50/80 transition">
                  <td className="py-3 px-4 font-black text-gray-900">
                    <div>{issue.animalTag}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{issue.date}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-gray-900">{issue.diagnosis}</div>
                    <div className="text-[11px] text-gray-500 font-['Noto_Nastaliq_Urdu']">{issue.diagnosisUrdu}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      issue.temperature > 102.5 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {issue.temperature}°F
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    <div className="font-semibold">{issue.medication}</div>
                    <div className="text-[10px] text-gray-400">{issue.treatment}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-800">
                    Rs. {issue.cost.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      issue.status === 'Under Treatment'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : issue.status === 'Quarantine'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {issue.status !== 'Recovered' && (
                      <button
                        onClick={() => onMarkIssueRecovered(issue.id)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#1B5E20] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition cursor-pointer"
                      >
                        Mark Recovered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
