import React from 'react';
import {
  Milk,
  DollarSign,
  Wheat,
  Stethoscope,
  Dna,
  ShoppingCart,
  Plus
} from 'lucide-react';

interface StickyQuickActionMenuProps {
  onSelectAction: (actionType: 'milk' | 'expense' | 'feed' | 'health' | 'breeding' | 'sale') => void;
  todayMilk?: number;
  activeAnimalsCount?: number;
}

export const StickyQuickActionMenu: React.FC<StickyQuickActionMenuProps> = ({
  onSelectAction,
  todayMilk = 78.5,
  activeAnimalsCount = 9
}) => {
  const actions = [
    {
      id: 'milk' as const,
      title: 'Milk Entry',
      titleUrdu: 'دودھ اندراج',
      icon: Milk,
      bgGradient: 'from-emerald-700 to-[#1B5E20]',
      hoverBorder: 'hover:border-emerald-400',
      badge: `${todayMilk} L Today`,
      badgeColor: 'bg-emerald-800/80 text-emerald-100',
      subtext: 'Morning & evening yields'
    },
    {
      id: 'expense' as const,
      title: 'Expense',
      titleUrdu: 'خرچہ اندراج',
      icon: DollarSign,
      bgGradient: 'from-amber-700 to-[#b45309]',
      hoverBorder: 'hover:border-amber-400',
      badge: 'Feed & Meds',
      badgeColor: 'bg-amber-800/80 text-amber-100',
      subtext: 'Log bills & vet costs'
    },
    {
      id: 'feed' as const,
      title: 'Feed & Winda',
      titleUrdu: 'ونڈا و چارہ',
      icon: Wheat,
      bgGradient: 'from-teal-800 to-[#0f766e]',
      hoverBorder: 'hover:border-teal-400',
      badge: 'Silage & Vanda',
      badgeColor: 'bg-teal-900/80 text-teal-100',
      subtext: 'Ration & stock entry'
    },
    {
      id: 'health' as const,
      title: 'Health / Disease',
      titleUrdu: 'بیماری و ویکسین',
      icon: Stethoscope,
      bgGradient: 'from-rose-800 to-[#9f1239]',
      hoverBorder: 'hover:border-rose-400',
      badge: 'Vet Care',
      badgeColor: 'bg-rose-900/80 text-rose-100',
      subtext: 'Meds, temps & vaccines'
    },
    {
      id: 'breeding' as const,
      title: 'Breeding & AI',
      titleUrdu: 'بریڈنگ و ٹیکہ',
      icon: Dna,
      bgGradient: 'from-purple-800 to-[#6b21a8]',
      hoverBorder: 'hover:border-purple-400',
      badge: '280d Gestation',
      badgeColor: 'bg-purple-900/80 text-purple-100',
      subtext: 'Heat, semen & calving'
    },
    {
      id: 'sale' as const,
      title: 'Animal Sale',
      titleUrdu: 'جانور فروخت',
      icon: ShoppingCart,
      bgGradient: 'from-[#1e3a5f] to-[#0f2942]',
      hoverBorder: 'hover:border-blue-400',
      badge: 'Deal & Cash',
      badgeColor: 'bg-blue-900/80 text-blue-100',
      subtext: 'Record cow or calf sale'
    }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border-y border-emerald-200/80 shadow-sm py-3 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-xs font-black text-gray-900 tracking-wide uppercase">
              Quick Farmer Action Hub
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-[#1B5E20] font-['Noto_Nastaliq_Urdu'] font-bold">
              فوری کارروائی مینیو (ایک کلک پر اندراج)
            </span>
          </div>
          <span className="text-[11px] text-gray-500 hidden sm:inline-block">
            Click any card to add instantly without leaving this page
          </span>
        </div>

        {/* 6 Big Mobile-Friendly Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {actions.map((act) => {
            const IconComponent = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => onSelectAction(act.id)}
                className={`relative group p-3 rounded-2xl bg-gradient-to-br ${act.bgGradient} text-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-white/20 ${act.hoverBorder} text-left flex flex-col justify-between min-h-[92px] cursor-pointer`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center opacity-80 group-hover:opacity-100">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-xs sm:text-sm font-extrabold leading-tight tracking-tight">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-white/90 font-['Noto_Nastaliq_Urdu'] font-bold leading-none mt-0.5">
                    {act.titleUrdu}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
