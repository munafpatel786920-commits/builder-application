import React, { useState } from 'react';
import { 
  Building2, CheckCircle2, ShieldCheck, Zap, Users, Sparkles, 
  ArrowRight, Star, ChevronRight, Check, BarChart3, HelpCircle, HardHat, Phone, Mail, Landmark
} from 'lucide-react';
import { GlobalLogo } from './GlobalLogo';

interface SaaSPageProps {
  isRegistering: boolean;
  setIsRegistering: (val: boolean) => void;
  authError: string;
  setAuthError: (val: string) => void;
  emailInput: string;
  setEmailInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  nameInput: string;
  setNameInput: (val: string) => void;
  mobileInput: string;
  setMobileInput: (val: string) => void;
  actionLoading: boolean;
  handleEmailSignIn: (e: React.FormEvent) => void;
  handleEmailSignUp: (e: React.FormEvent) => void;
  handleGoogleSignIn: () => void;
  handleSandboxSignIn?: (customEmail?: string, customName?: string) => void;
  handleSuperAdminInstantLogin?: () => void;
  saasConfig?: any;
}

export default function SaaSPage({
  isRegistering,
  setIsRegistering,
  authError,
  setAuthError,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  nameInput,
  setNameInput,
  mobileInput,
  setMobileInput,
  actionLoading,
  handleEmailSignIn,
  handleEmailSignUp,
  handleGoogleSignIn,
  handleSandboxSignIn,
  handleSuperAdminInstantLogin,
  saasConfig
}: SaaSPageProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const supervisorMonthly = saasConfig?.supervisorPrice !== undefined ? saasConfig.supervisorPrice : 1499;
  const proMonthly = saasConfig?.proPrice !== undefined ? saasConfig.proPrice : 3999;
  const enterpriseMonthly = saasConfig?.enterprisePrice !== undefined ? saasConfig.enterprisePrice : 11999;

  const plans = [
    {
      name: "Site Supervisor",
      slug: "supervisor",
      priceMonthly: supervisorMonthly,
      priceYearly: Math.round(supervisorMonthly * 0.8),
      desc: "Perfect for local independent civil contractors and masonry crew leads managing single standard building structures.",
      features: [
        "1 Active Standard Construction Site",
        "Interactive Daily Laborer Attendance",
        "Raw Materials Stock Inventory Tracker",
        "Basic Cash Book Ledger (No GST Sync)",
        "Mobile App Console Access"
      ],
      cta: "Start 7-Day Free Trial",
      popular: false,
      color: "border-slate-200"
    },
    {
      name: "MD / Builder Pro",
      slug: "builder-pro",
      priceMonthly: proMonthly,
      priceYearly: Math.round(proMonthly * 0.8),
      desc: "Our signature flagship standard package for full-scale real estate developers and standard managing directors.",
      features: [
        "Unlimited Active Land Plots (Zameen)",
        "Milestone Theka Contracts Builder",
        "RERA Verified compliance parameters",
        "GST Compliant Invoicing with CGST/SGST",
        "Professional Booking Agreement Generator",
        "Export PDFs & Secure Cloud Sync backups",
        "Intelligent Construction AI Chatbot"
      ],
      cta: "Get Instant Access",
      popular: true,
      color: "border-amber-500 ring-2 ring-amber-500/10"
    },
    {
      name: "Corporate Enterprise",
      slug: "enterprise",
      priceMonthly: enterpriseMonthly,
      priceYearly: Math.round(enterpriseMonthly * 0.8),
      desc: "For global construction conglomerates, syndicates, and multisite infrastructure corporations needing premium legal backups.",
      features: [
        "All features inside MD Builder Pro",
        "Multi-Company Ledger Sync nodes",
        "Dedicated isolated cloud database options",
        "Custom legal draft frameworks",
        "Dedicated Account Officer Assistance",
        "99.9% uptime SLA compliance guarantee"
      ],
      cta: "Contact Sales Rep",
      popular: false,
      color: "border-slate-200"
    }
  ];

  const handleChoosePlan = (planName: string) => {
    setSelectedPlan(planName);
    setIsRegistering(false); // Open signin screen directly for chosen plan
    setAuthError('');
    setShowAuthModal(true);
  };

  const openAdminLogin = () => {
    setIsRegistering(false); // Sign-in mode
    setAuthError('');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative overflow-x-hidden">
      

      {/* Modern SaaS Header Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/60 shadow-xs px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <GlobalLogo iconClassName="w-9 h-9" />

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-amber-600 transition">Core Features</a>
            <a href="#pricing" className="hover:text-amber-600 transition">Pricing Plans</a>
            <a href="#reviews" className="hover:text-amber-600 transition">Client Success</a>
            <a href="#properties-showcase" className="hover:text-amber-600 transition">Properties Poster</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={openAdminLogin}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600/20 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black tracking-widest uppercase transition active:scale-95 cursor-pointer shadow-md"
            >
              Sign In / Console
            </button>
          </div>
        </div>
      </header>

      {/* Hero Presentation Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-8 overflow-hidden bg-white">
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-amber-50/40 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in flex flex-col items-center justify-center space-y-8">
          
          {/* Hero text */}
          <div className="space-y-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full text-amber-700 text-[10px] sm:text-xs font-mono tracking-widest font-bold uppercase">
              🏆 INDUSTRIAL GRADE BUILDER ERP SYSTEM
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Manage Your Real Estate Properties, <span className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 bg-clip-text text-transparent">Land & Contractor Bills</span> with absolute trust.
            </h1>
            
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              Global SaaS is the ultimate full-stack digital ledger meticulously engineered for builders, realtors, and civil contractors. Track complex land investments, automate subcontractor milestone contracts, calculate RERA standard tax sheets, and download professional booking agreements in just seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-3">
              <a
                href="#pricing"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 px-8 py-4 rounded-xl text-xs font-black tracking-widest uppercase text-center transition shadow-lg shadow-orange-500/10 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                View Plans & Pricing
              </a>
            </div>

            {/* Quick value indicators */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 max-w-md w-full">
              <div>
                <span className="block text-lg font-black text-slate-900">100%</span>
                <span className="block text-[10px] text-slate-500 font-mono tracking-wide uppercase">RERA Compliant</span>
              </div>
              <div>
                <span className="block text-lg font-black text-slate-900">M25 Grade</span>
                <span className="block text-[10px] text-slate-500 font-mono tracking-wide uppercase">IS-456 Audited</span>
              </div>
              <div>
                <span className="block text-lg font-black text-slate-900">18% GST</span>
                <span className="block text-[10px] text-slate-500 font-mono tracking-wide uppercase">Input-Tax Cleared</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Product Core Modules Section */}
      <section id="features" className="py-20 bg-slate-100 border-y border-slate-200/60 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full font-mono uppercase tracking-wide font-bold">
              BUILDER WORKFLOW MODULES
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Everything You Need to Run & Protect Your Real Estate Empire</h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              We replaced scattered ledger notebooks under bricks, unorganized photos of labourers, and loose WhatsApp GST calculations with a single robust standard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-3 hover:translate-y-[-2px] transition duration-300">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Secure Land Plot (Zameen) Ledger</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add purchased properties with coordinates, track registry legal stamp approvals, court deed status certificates, and easily link building templates to exact physical parcels.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-3 hover:translate-y-[-2px] transition duration-300">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Milestone Theka Contract Suite</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Draft builders' contracts with specified milestones: RCC slabs, bricks plastering, tile fittings. Instantly check progress status and issue secure banking checks.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-3 hover:translate-y-[-2px] transition duration-300">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                <HardHat className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Worker Attendance & Wage Sheet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Register masons, carpenters, supervisors, and labor crews. Roll out daily check-ins (Present, Half-Day, Absent), automatically calculate wages, and disburse UPI payments cleanly.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-3 hover:translate-y-[-2px] transition duration-300">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Corporate GST Booking Agreements</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Lock customer flat reservations with customizable downpayment structures, legal stamp validation terms, and auto-computed CGST/SGST tax bills.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-3 hover:translate-y-[-2px] transition duration-300">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Real-time Stock Stock Alert</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Always know how many tons of high-strength TMT steel rods and cement bags remain in the warehouse. Receive push indicators when inventory falls below minimum threshold limits.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-3 hover:translate-y-[-2px] transition duration-300">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Generative Construction AI Legal Advisor</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Need details about structural RCC safety codes or draft standard notice layouts? Tap the embedded smart chatbot assistant to analyze local regulations instantly.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Pricing Interactive Portal Section */}
      <section id="pricing" className="py-20 bg-white px-4 sm:px-8 scroll-mt-12">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-amber-700 font-mono bg-amber-500/10 px-3 py-1 rounded-full">
              AFFORDABLE SAAS PRICING PLANS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">Flexible Budgets For Builders of All Scales</h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Save big with annual billing systems. Pay once and ensure absolute digital tracking legal security for your multi-lakh real estate constructions.
            </p>

            {/* Billing Toggle Selector */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className={`text-xs font-bold transition ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>Billed Monthly</span>
              <button
                type="button"
                onClick={() => setIsYearly(!isYearly)}
                className="w-12 h-6.5 bg-slate-200 hover:bg-slate-300 rounded-full p-1 transition relative flex items-center cursor-pointer"
              >
                <div className={`w-4.5 h-4.5 bg-amber-500 rounded-full shadow-sm transition-transform ${isYearly ? 'translate-x-5.5' : 'translate-x-0'}`} />
              </button>
              <span className={`text-xs font-bold transition ${isYearly ? 'text-slate-900' : 'text-slate-400'} flex items-center gap-1.5`}>
                Billed Yearly <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full font-mono tracking-wider">Save 20%</span>
              </span>
            </div>
          </div>

          {/* Pricing cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((p, idx) => (
              <div 
                key={idx} 
                className={`bg-white rounded-3xl border p-8 shadow-lg flex flex-col justify-between space-y-6 relative hover:scale-[1.01] transition-transform ${p.color}`}
              >
                {p.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-mono font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow">
                    ⭐⭐ MOST POPULAR DEVELOPER PLAN ⭐⭐
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-black text-slate-950 uppercase tracking-wide">{p.name}</h3>
                    <p className="text-xs text-slate-500 leading-normal mt-1.5">{p.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-2xl font-black text-slate-950">₹</span>
                    <span className="text-4xl font-extrabold text-slate-950 tracking-tight">
                      {isYearly ? p.priceYearly.toLocaleString() : p.priceMonthly.toLocaleString()}
                    </span>
                    <span className="text-slate-500 font-mono text-xs">/month</span>
                  </div>

                  <div className="h-[1px] bg-slate-100" />

                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {p.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-tight font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleChoosePlan(p.name)}
                  className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-center transition cursor-pointer active:scale-95 ${
                    p.popular 
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-orange-500/10' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Customer Trust Matrix */}
      <section id="reviews" className="py-20 bg-slate-900 text-white px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-4 space-y-4">
            <span className="text-amber-500 font-mono font-bold text-xs uppercase tracking-widest block">CLIENT SUCCESS MATTERS</span>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">Adopted By Leading Builders & Real Estate Developers</h2>
            <p className="text-slate-400 text-xs">
              We monitor customer operations closely across housing states, commercial plots, and premium layout properties. Read feedback from our early adopters.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Review 1 */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-slate-300 text-xs italic">
                "Our real estate group managed over 15 distinct contractor bills using Global SaaS this year. The audit checklist features matched our M25 steel/concrete workflows flawlessly."
              </p>
              <div className="border-t border-slate-800/80 pt-3">
                <p className="text-[9px] text-slate-400 font-mono">Managing Director, Gujarat Builders</p>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-slate-300 text-xs italic">
                "We had huge issues tracking labor attendance and daily wage ledger payouts on physical register books. Now with Global SaaS, we save roughly ₹25,000 every single month."
              </p>
              <div className="border-t border-slate-800/80 pt-3">
                <p className="text-[9px] text-slate-400 font-mono">Senior Supervisor, Aarohi Complexes</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Real Estate Properties Showcase */}
      <section id="properties-showcase" className="py-20 bg-slate-900 px-4 sm:px-8 border-t border-slate-800 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-500 font-mono">PREMIUM DESIGNS & INFRASTRUCTURE</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Elite Real Estate Properties & Layouts</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Experience our layout planning, RCC casting structures, and high-quality premium residency designs built across top-tier housing zones.
            </p>
          </div>

          {/* Elegant Poster Showcase Container */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative group">
            {/* Top decorative header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-950/40 backdrop-blur-md relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                  LIVE COMPLIANCE POSTER • PROJECTS SECTOR I
                </span>
              </div>
              <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                APPROVED BY RERA & APEX ARCHITECTS
              </span>
            </div>

            {/* Poster Image Container */}
            <div className="relative overflow-hidden aspect-video">
              <img 
                src="/src/assets/images/property_poster_1780126082282.png" 
                alt="Elite Apartment Development Poster" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
              
              {/* Dynamic Overlay badges on actual image */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-3 items-end justify-between">
                <div className="space-y-1">
                  <span className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded tracking-wider">
                    Gokuldham Premium Sector
                  </span>
                  <h3 className="text-white font-black text-lg sm:text-2xl drop-shadow-md">
                    Signature Skyline Residential Residency
                  </h3>
                </div>
                <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-[8px] text-slate-500 font-mono tracking-wider uppercase">STARTING FROM</span>
                    <span className="block text-sm font-black text-amber-500">Fixed Rate Packages Compliant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium details block under the poster */}
            <div className="p-6 sm:p-8 bg-slate-950 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left border-t border-slate-800/80">
              <div className="space-y-1">
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">STRUCTURE RATING</span>
                <span className="block text-xs font-black text-white">M25 Concrete Standard</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">STEEL GRADING</span>
                <span className="block text-xs font-black text-white">Fe 550D TMT Reinforcement</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">PROJECT APPROVAL</span>
                <span className="block text-xs font-black text-white">100% RERA Verified</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">COMPLETION ETA</span>
                <span className="block text-xs font-black text-white">Dec 2027 (Under-way)</span>
              </div>
            </div>
          </div>



        </div>
      </section>

      {/* Stunning SaaS App Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-12 px-4 sm:px-8 text-center text-xs space-y-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-slate-950 font-black" />
            </div>
            <span className="text-sm font-black text-white tracking-widest uppercase text-left">GLOBAL SAAS</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-semibold text-slate-400 text-[11px]">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#reviews" className="hover:text-white transition">Reviews</a>
            <a href="#properties-showcase" className="hover:text-white transition">Properties Poster</a>
          </div>

          <div className="text-slate-500 text-[10px] font-mono">
            Conforms to IS:456 Grade Steel standard models
          </div>
        </div>

        <div className="w-full h-[1px] bg-slate-900" />

        <div className="text-[10px] text-slate-500 max-w-xl mx-auto space-y-3">
          <p>
            Corporate HQ: Empire State RERA Ring Hub, Sanand & Jodhpur. RERA Standard Registration Compliance validation. Designed explicitly for elite developer syndicates and infrastructure builders.
          </p>
          <p>Copyright Global Software, Contact For Support: <a href="mailto:patelmunaf90@gmail.com" className="text-blue-600 hover:underline">patelmunaf90@gmail.com</a></p>
        </div>
      </footer>

      {/* AUTHENTICATION PORTAL MODAL DIALOG OVERLAY */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-5 relative max-h-[95vh] overflow-y-auto">
            
            {/* Close button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 font-black text-xs p-1.5 rounded-full transition cursor-pointer"
            >
              ✕
            </button>

            {/* Logo details inside modal */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow flex items-center justify-center shrink-0 mx-auto">
                <Building2 className="w-6 h-6 text-slate-950 font-bold" />
              </div>
              <h3 className="text-base font-black uppercase text-slate-900">
                Sign In to Console
              </h3>
              <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                {selectedPlan ? `Plan: ${selectedPlan}` : 'Global Sovereign Construction Ledger'}
              </p>
            </div>

            {/* Error alerts inside Modal */}
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] py-3.5 px-4 rounded-xl space-y-2">
                <div className="flex items-start gap-2">
                  <span className="shrink-0 text-red-500 font-extrabold text-xs">⚠️</span>
                  <p className="leading-tight font-bold">{authError}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form 
              onSubmit={handleEmailSignIn}
              className="space-y-3.5"
            >
              <div className="space-y-1">
                <label className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider font-bold">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. patelmunaf90@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="absolute left-3.5 top-2.5 text-xs">✉️</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider font-bold">
                  Account Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="absolute left-3.5 top-2.5 text-xs">🔒</div>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {actionLoading ? 'Processing...' : 'Sign In to Console'}
              </button>

              <div className="pt-4 text-center text-[10px] text-slate-500 font-medium border-t border-slate-100 space-y-1">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px]">Copyright Global Software</p>
                <p>Support: <a href="mailto:patelmunaf90@gmail.com" className="text-blue-600 hover:underline font-semibold">patelmunaf90@gmail.com</a></p>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
