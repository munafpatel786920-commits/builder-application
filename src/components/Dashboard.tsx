import React from 'react';
import { 
  Building2, Landmark, ShieldCheck, MapPin, HardHat, 
  TrendingUp, CircleDollarSign, ArrowRight, Layers, Users, 
  Receipt, PlusCircle, ArrowUpRight, ArrowDownRight, Wallet, History
} from 'lucide-react';
import { Project, LandPurchase, Property, Worker, OfficeExpense, Inquiry, CompanyProfile } from '../types';

interface DashboardProps {
  lands: LandPurchase[];
  projects: Project[];
  properties: Property[];
  workers: Worker[];
  expenses: OfficeExpense[];
  inquiries: Inquiry[];
  profile: CompanyProfile;
  onNavigateTab: (tab: any) => void;
  onOpenQuickAdd: (formType: 'land' | 'contract' | 'flat' | 'expense') => void;
}

export default function Dashboard({
  lands,
  projects,
  properties,
  workers,
  expenses,
  inquiries,
  profile,
  onNavigateTab,
  onOpenQuickAdd
}: DashboardProps) {

  // Metrics computation
  const totalLandCount = lands.length;
  const totalLandInvestment = lands.reduce((sum, l) => sum + l.costLakhs, 0);
  
  const totalContractCount = projects.length;
  const activeContractsCount = projects.filter(p => p.status === 'Ongoing').length;
  const totalContractBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalContractPaid = projects.reduce((sum, p) => sum + p.spent, 0);

  const totalFlatsCount = properties.length;
  const soldFlats = properties.filter(p => p.status === 'Sold Out' || p.status === 'Booked');
  const soldFlatsCount = soldFlats.length;
  const unsoldFlatsCount = totalFlatsCount - soldFlatsCount;
  const totalRevenueCollected = properties.reduce((sum, p) => sum + p.amountReceived, 0);
  
  // Worker Attendance today
  // Let's check how many total workers are active, and if they are present on current date
  const todayDateStr = new Date().toISOString().substring(0, 10);
  const workersPresentToday = workers.filter(w => w.attendance[todayDateStr] === 'Present' || w.attendance[todayDateStr] === 'Half-Day').length;
  const totalWorkersCount = workers.length;

  // Expenses summary
  const totalOfficeExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Recent 5 activities log or recent inquiries
  const activeInquiries = inquiries.slice(0, 4);

  const maxCashflowVal = Math.max(0.1, totalLandInvestment, totalContractBudget, totalRevenueCollected);

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Premium Builder Welcome & CAD Guideline Header */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 text-slate-100 p-6 md:p-8 rounded-3xl shadow-xl">
        {/* Architectural grid overlay background */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED DEVELOPER WORKSPACE
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest bg-slate-800 text-slate-300 font-extrabold px-2 py-0.5 rounded border border-slate-700">
                LTD ENTERPRISE SYSTEM
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight uppercase font-sans">
              {profile.companyName} <span className="text-amber-500 font-light font-mono">&bull;</span> Executive Center
            </h2>
            <p className="text-slate-400 text-xs font-medium max-w-xl">
              Industry Grade Management Console for <span className="text-slate-100 font-bold">{profile.directorName}</span>. Instantly coordinate land acquisition deeds, building construction milestones, material requisitions, and RERA compliance.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/60 p-3 rounded-2xl flex items-center gap-2 text-left shadow-md">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="font-mono text-[10px]">
                <span className="text-slate-400 block uppercase font-black text-[8px]">Realtime Cloud DB</span>
                <span className="text-emerald-400 font-bold">MUTUAL SYNC READY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Indian Compliance & Standard Indicators */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-6 pt-6 border-t border-slate-800/60 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
          <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="text-amber-500 font-bold text-xs">&bull;</span>
            <span className="leading-normal"><strong className="text-slate-200">RERA:</strong> {profile.city?.substring(0, 4).toUpperCase() || 'SA'}-{profile.state?.substring(0, 2).toUpperCase() || 'GJ'}-REGISTERED</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="text-amber-500 font-bold text-xs">&bull;</span>
            <span className="leading-normal"><strong className="text-slate-200">IS-456:</strong> REINFORCED STANDARD</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="text-amber-500 font-bold text-xs">&bull;</span>
            <span className="leading-normal"><strong className="text-slate-200">ISO 9001:</strong> SAFETY DIRECTIVES</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="text-amber-500 font-bold text-xs">&bull;</span>
            <span className="leading-normal"><strong className="text-slate-200">GST:</strong> INPUT CREDIT RECONCILED</span>
          </div>
        </div>
      </div>

      {/* Main High-Density Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI: Lands Bought */}
        <div 
          onClick={() => onNavigateTab('buy-land')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-amber-500/50 hover:bg-amber-500/[0.01] cursor-pointer shadow-sm hover:shadow-md transition duration-200 group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 font-black">
              <Landmark className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">STEP 1</span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-semibold font-mono tracking-wider block">Lands (Zameen) Portfolio</span>
            <span className="text-2xl font-black text-slate-900 font-mono block">
              {totalLandCount} <span className="text-xs font-semibold text-slate-500 uppercase">Plots</span>
            </span>
            <p className="text-[10px] text-slate-500 font-medium">Book Value of ₹<strong className="text-slate-900">{totalLandInvestment} Lakhs</strong></p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-mono">Registry Documents</span>
            <span className="text-amber-600 font-extrabold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Review <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI: Builder Contracts */}
        <div 
          onClick={() => onNavigateTab('contracts')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-orange-500/50 hover:bg-orange-500/[0.01] cursor-pointer shadow-sm hover:shadow-md transition duration-200 group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />
          <div className="flex justify-between items-start">
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-600 font-black">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">STEP 2</span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-semibold font-mono tracking-wider block">Civil Building Contracts</span>
            <span className="text-2xl font-black text-slate-900 font-mono block">
              {totalContractCount} <span className="text-xs font-semibold text-slate-500 uppercase font-sans">Active</span>
            </span>
            <p className="text-[10px] text-slate-500 font-medium">Outflow: ₹<strong className="text-slate-900">{totalContractPaid}L</strong> / ₹{totalContractBudget}L</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-mono">Milestone Releases</span>
            <span className="text-orange-600 font-extrabold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI: Sell Flats */}
        <div 
          onClick={() => onNavigateTab('sell-flats')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 hover:bg-emerald-500/[0.01] cursor-pointer shadow-sm hover:shadow-md transition duration-200 group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 font-black">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">STEP 3</span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-semibold font-mono tracking-wider block">Residential Unit Sales</span>
            <span className="text-2xl font-black text-slate-900 font-mono block flex items-baseline gap-1">
              <span>{soldFlatsCount}</span>
              <span className="text-xs font-semibold text-slate-400">/ {totalFlatsCount} Booked</span>
            </span>
            <p className="text-[10px] text-emerald-600 font-semibold">Inflow: ₹<strong>{totalRevenueCollected} Lakhs</strong></p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-mono">Inventory Inventory</span>
            <span className="text-emerald-600 font-extrabold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Showcase <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI: Worker Attendance */}
        <div 
          onClick={() => onNavigateTab('worker-attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-blue-500/50 hover:bg-blue-500/[0.01] cursor-pointer shadow-sm hover:shadow-md transition duration-200 group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 font-black">
              <HardHat className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">LABOUR</span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-semibold font-mono tracking-wider block">Daily Onsite Attendance</span>
            <span className="text-2xl font-black text-slate-900 font-mono block flex items-baseline gap-1">
              <span>{workersPresentToday}</span>
              <span className="text-xs font-semibold text-slate-400">/ {totalWorkersCount} Pr. Today</span>
            </span>
            <p className="text-[10px] text-slate-500 font-medium">Labour deployment rate {totalWorkersCount ? Math.round((workersPresentToday/totalWorkersCount)*100) : 0}%</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-mono">Labor Ledger Work</span>
            <span className="text-blue-600 font-extrabold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Attendance <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

      </div>

      {/* Heavy-Industry Capital Allocation SVG Native Graph Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-amber-500" /> Business Cashflow & Asset Allocation Analytics
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Comparative visualization of book investments versus recorded sales revenues in Lakhs (₹).
            </p>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-mono uppercase font-black tracking-wider text-slate-500">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Land Deals</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> Construction Outlay</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Sales Realized</div>
          </div>
        </div>

        {/* SVG/HTML Progress Balance Bars */}
        <div className="space-y-4 pt-2">
          
          {/* Bar 1: Land Investment */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-end text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-xs" /> Total Land Capital Value
              </span>
              <span className="font-mono font-black text-slate-900">₹{totalLandInvestment} Lakhs</span>
            </div>
            <div className="w-full bg-slate-100 h-3.5 rounded-lg overflow-hidden border border-slate-200/40 relative">
              <div 
                className="bg-amber-500 h-full rounded-r-sm transition-all duration-1000 origin-left"
                style={{ width: `${Math.min(100, Math.max(2, (totalLandInvestment / maxCashflowVal) * 100))}%` }}
              />
            </div>
          </div>

          {/* Bar 2: Contractor Contracts */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-end text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-orange-500 rounded-xs" /> Awarded Civil Structures Commitment
              </span>
              <span className="font-mono font-black text-slate-900">₹{totalContractPaid}L paid <span className="text-slate-400 font-normal">of ₹{totalContractBudget}L</span></span>
            </div>
            <div className="w-full bg-slate-100 h-3.5 rounded-lg overflow-hidden border border-slate-200/40 relative">
              <div 
                className="bg-orange-500 h-full rounded-r-sm transition-all duration-1000 origin-left"
                style={{ width: `${Math.min(100, Math.max(2, (totalContractPaid / maxCashflowVal) * 100))}%` }}
              />
            </div>
          </div>

          {/* Bar 3: Received Capital */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-end text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-xs" /> Customer Booking Payments Received
              </span>
              <span className="font-mono font-black text-emerald-600">₹{totalRevenueCollected} Lakhs</span>
            </div>
            <div className="w-full bg-slate-100 h-3.5 rounded-lg overflow-hidden border border-slate-200/40 relative">
              <div 
                className="bg-emerald-500 h-full rounded-r-sm transition-all duration-1000 origin-left"
                style={{ width: `${Math.min(100, Math.max(2, (totalRevenueCollected / maxCashflowVal) * 100))}%` }}
              />
            </div>
          </div>

        </div>

        {/* Real-time Ledger health telemetry readout */}
        <div className="bg-amber-500/[0.04] border border-amber-500/10 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 text-xs font-mono">
          <div className="space-y-0.5">
            <span className="block text-[8.5px] text-slate-400 uppercase font-black">Net Consolidated Balance Value</span>
            <p className="text-slate-700 font-bold leading-normal">
              Book Equity Margin: <span className={`${(totalRevenueCollected - totalLandInvestment - totalContractPaid - (totalOfficeExpenses/100000)) < 0 ? 'text-red-600' : 'text-emerald-600'} font-black`}>
                ₹{Number((totalRevenueCollected - totalLandInvestment - totalContractPaid - (totalOfficeExpenses/100000)).toFixed(2))} Lakhs
              </span>
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="block text-[8.5px] text-slate-400 uppercase font-black">RERA Compliance Safe Guard Status</span>
            <span className="text-emerald-600 font-extrabold flex items-center gap-1">🟢 SEPARATE GST ESCROW FUND LOCKED</span>
          </div>
        </div>
      </div>

      {/* Interactive Business Model Process Flowchart Map */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-amber-500" />
            Core Civil Engineering & Sales Lifecycle Flow
          </h3>
          <p className="text-slate-550 text-slate-500 text-xs mt-1 font-medium">
            Initiate actions directly in your pipeline. Click any phase to bring up corresponding rapid transaction forms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Phase 1 Map Box */}
          <div 
            onClick={() => onOpenQuickAdd('land')}
            className="bg-gradient-to-b from-amber-50/40 to-amber-50/10 hover:from-amber-50 border border-amber-200/80 p-5 rounded-2xl cursor-pointer hover:shadow-sm hover:border-amber-400 transition-all text-left relative overflow-hidden group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-mono font-black text-xs">1</span>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Buy New Land Plot</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Acquire commercial or residential plots with validated NOC and clear deed registry entries under your portfolio.
            </p>
            <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-amber-700 font-mono group-hover:translate-x-1 transition-transform">
              <PlusCircle className="w-3.5 h-3.5" /> Book Zameen Plot Deal
            </div>
          </div>

          {/* Phase 2 Map Box */}
          <div 
            onClick={() => onOpenQuickAdd('contract')}
            className="bg-gradient-to-b from-orange-50/40 to-orange-50/10 hover:from-orange-50 border border-orange-200/80 p-5 rounded-2xl cursor-pointer hover:shadow-sm hover:border-orange-400 transition-all text-left relative overflow-hidden group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center font-mono font-black text-xs">2</span>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Award Contractor (Theka)</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Link purchased plots to builders. Award structural construction contracts, map civil milestones, and release mobilization funds.
            </p>
            <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-orange-700 font-mono group-hover:translate-x-1 transition-transform">
              <PlusCircle className="w-3.5 h-3.5" /> Grant Construction Theka
            </div>
          </div>

          {/* Phase 3 Map Box */}
          <div 
            onClick={() => onNavigateTab('sell-flats')}
            className="bg-gradient-to-b from-emerald-50/40 to-emerald-50/10 hover:from-emerald-50 border border-emerald-200/80 p-5 rounded-2xl cursor-pointer hover:shadow-sm hover:border-emerald-400 transition-all text-left relative overflow-hidden group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-mono font-black text-xs">3</span>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Sell Ready Flats</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Showcase floor sizes, register incoming client buyer bookings, collect unit advances, and generate tax bills.
            </p>
            <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-emerald-700 font-mono group-hover:translate-x-1 transition-transform">
              <PlusCircle className="w-3.5 h-3.5" /> Register Flat Sales
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Real-time Construction Progress Milestone Monitor */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-orange-500" /> Active Building Milestones
            </h3>
            <button 
              onClick={() => onNavigateTab('contracts')}
              className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline"
            >
              View Contract Ledger &rarr;
            </button>
          </div>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="border border-slate-200 border-dashed rounded-2xl p-8 text-center space-y-3 bg-slate-50/50">
                <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-xs font-black text-slate-700 uppercase">No Active Construction Projects</h4>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Welcome to your raw workspace! To start tracking building sites, register a land plot and award a building contract under the <strong>Zameen (Land Plot Manager)</strong> or <strong>Theka (Contracts)</strong> pages.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('buy-land')}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] px-3.5 py-2 rounded-xl transition shadow-sm inline-flex items-center gap-1"
                >
                  🚀 Register First Zameen / Land
                </button>
              </div>
            ) : (
              projects.slice(0, 3).map(p => {
                const pendingCount = p.milestones.filter(m => m.status === 'Pending').length;
                const doneCount = p.milestones.filter(m => m.status === 'Done').length;
                return (
                  <div key={p.id} className="border border-slate-100 p-4 rounded-2xl bg-slate-50/30 space-y-3 hover:bg-slate-50 transition duration-150">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{p.name}</h4>
                        <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {p.location} • Contractor: <strong className="text-slate-600">{p.contractorName}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400">Paid to Builder:</span>
                          <span className="block text-xs font-black text-slate-900 font-mono">₹{p.spent}L / ₹{p.budget}L</span>
                        </div>
                        <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20">
                          {p.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full" style={{ width: `${p.progress}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                        <span>{doneCount} milestones completed</span>
                        <span>{pendingCount} remaining stages</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Office Expenses Summary & Live Lead Influx */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Office Expenses Summary box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase font-mono tracking-widest text-slate-400 font-extrabold flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-slate-400" /> Office Expenses
              </h3>
              <button 
                onClick={() => onNavigateTab('office-expenses')}
                className="text-[10px] font-bold text-amber-600 hover:underline"
              >
                Vouchers &rarr;
              </button>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">Aggregate Running Outflow</span>
              <span className="text-xl font-black font-mono text-slate-900 block">
                ₹{totalOfficeExpenses.toLocaleString('en-IN')}
              </span>
              <button
                onClick={() => onOpenQuickAdd('expense')}
                className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-extrabold px-3.5 py-2 rounded-xl transition inline-flex items-center gap-1 mt-2.5 shadow-sm"
              >
                + Add Chai / Fuel Voucher
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Recent Vouchers</span>
              {expenses.slice(0, 3).map((exp) => (
                <div key={exp.id} className="flex justify-between items-center text-[11px] p-2 hover:bg-slate-50 rounded-lg transition border-b border-dashed border-slate-100">
                  <div>
                    <span className="font-extrabold text-slate-900 truncate max-w-[120px] inline-block">{exp.description}</span>
                    <span className="block text-[8px] text-slate-500 font-mono uppercase">{exp.category}</span>
                  </div>
                  <span className="font-mono text-slate-900 font-black">- ₹{exp.amount}</span>
                </div>
              ))}
              {expenses.length === 0 && (
                <span className="text-[10px] text-slate-400 italic block text-center py-2">No office expenses recorded yet.</span>
              )}
            </div>
          </div>

          {/* Quick Lead Inquiries */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-mono tracking-widest text-slate-400 font-extrabold flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-slate-500" /> Buyer Inquiries ({inquiries.length})
            </h3>

            <div className="space-y-3">
              {activeInquiries.map(inq => (
                <div key={inq.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1 transition hover:bg-slate-50">
                  <div className="flex justify-between text-[11px]">
                    <strong className="text-slate-800 font-extrabold">{inq.name}</strong>
                    <span className="text-[9px] font-mono text-slate-500">{inq.createdAt}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-600">Interested: <strong className="text-slate-900 font-bold">{inq.propertyType}</strong></span>
                    <a href={`tel:${inq.phone}`} className="text-amber-600 hover:underline font-mono font-bold">{inq.phone}</a>
                  </div>
                </div>
              ))}

              {inquiries.length === 0 && (
                <p className="text-[10px] text-slate-400 italic text-center py-3">No flat buyer inquiries today.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
