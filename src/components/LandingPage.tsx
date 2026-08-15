import React, { useState } from 'react';
import { 
  Home, ShieldCheck, MapPin, Award, Users, HardHat, Sparkles, 
  ArrowRight, Star, Landmark, Building2, ShoppingBag, DollarSign, ChevronRight, CheckSquare
} from 'lucide-react';
import { i18n, Language } from '../i18n';
import { Property } from '../types';

interface LandingPageProps {
  lang: Language;
  onExploreProperties: () => void;
  onNavigateTab: (tab: 'projects' | 'properties') => void;
  onOpenInquiry: (propertyTitle: string) => void;
  properties: Property[];
}

export default function LandingPage({ lang, onExploreProperties, onNavigateTab, onOpenInquiry, properties }: LandingPageProps) {
  const t = i18n[lang];
  const [activeSlide, setActiveSlide] = useState(0);

  const testimonials = [
    {
      name: "Aditya Singhal",
      role: "Luxury Penthouse Buyer, Gokuldham Heights",
      feedback: "Global Group delivers immaculate RCC slab structures. The finish on double vitrified tiling is flawless. RERA numbers are perfectly verified and transparent.",
      rating: 5
    },
    {
      name: "Meenakshi Vyas",
      role: "Founder, Zenith Media Solutions",
      feedback: "Our commercial office space in Aarohi Hub represents premium craftsmanship. Solid columns and fireproof materials are certified with Indian Standard Codes.",
      rating: 5
    }
  ];

  return (
    <div className="space-y-16 animate-fade-in" id="landing-page">
      
      {/* Interactive Business Flow Blueprint Section right at the top */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/20 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-widest text-amber-500 uppercase">
            ⚡ Core Real Estate Lifecycle / मुख्य व्यावसायिक प्रवाह
          </div>
          <h2 className="text-xl md:text-3xl font-black text-white tracking-tight">
            How We Build & Monetize Communities / हमारा व्यावसायिक मॉडल
          </h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-3xl">
            We operate end-to-end: acquiring secure land plots, outsourcing heavy civil engineering layouts to contractors via milestone contracts, and selling ready structures to final buyers.
          </p>
        </div>

        {/* 3-Step Dynamic Flow Roadmap Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          
          {/* STEP 1: Buy Land */}
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900/60 transition duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-black py-1 px-2.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  STEP 1 / पहला काम
                </span>
                <Landmark className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-base font-extrabold text-white">Buy Prime Land</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                <strong>ज़मीन ख़रीदना:</strong> We scout and acquire premium layout titles, clear NOC certificates, and purchase high-yield plots.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-amber-500 hover:text-white font-bold text-xs flex items-center gap-1 group pt-2 shrink-0 text-left"
            >
              Add New Land Plot <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>

          {/* STEP 2: Award Contracts */}
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900/60 transition duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-black py-1 px-2.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  STEP 2 / दूसरा काम
                </span>
                <HardHat className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-base font-extrabold text-white">Award Construction (Theka)</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                <strong>ठेका देना (Contractor):</strong> Link buildings to land pieces, draft milestones (plinth, RCC slabs, brickwork), and track payment checks.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-orange-400 hover:text-white font-bold text-xs flex items-center gap-1 group pt-2 shrink-0 text-left"
            >
              Draft Builder Contract <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>

          {/* STEP 3: Sell Units */}
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900/60 transition duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-black py-1 px-2.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  STEP 3 / तीसरा काम
                </span>
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-extrabold text-white">Sell Flats / Retail Units</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                <strong>फ़्लैट बेचना (Property Sales):</strong> Setup ready inventory units, lock downpayment agreements with clients, and receipt installment cycles.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('properties')}
              className="text-emerald-400 hover:text-white font-bold text-xs flex items-center gap-1 group pt-2 shrink-0 text-left"
            >
              Sell Flats to Customers <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>

        </div>
      </div>

      {/* Premium Hero Carousel Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl h-[400px] md:h-[480px] flex items-center">
        {/* Dynamic Background Image overlay matching selected slide */}
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-30 select-none animate-fade-in"
             style={{ backgroundImage: `url('${properties[activeSlide]?.imageUrl || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80"}` }} />
        
        {/* Sleek Golden-Orange Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/25 pointer-events-none" />

        <div className="relative z-10 max-w-2xl ml-6 md:ml-12 p-4 space-y-5">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full text-amber-500 text-xs font-mono tracking-wider uppercase">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
            RERA Approved Builders & Promoters
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Building Legacies with <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">Solid RCC Concrete</span> & Grand Design
          </h1>
          
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Pioneering premium residential, villas, commercial complexes, and farmlands with robust Indian RCC standard grade structures, GST compliance, and flawless, on-time delivery across Gujarat.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onExploreProperties}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer text-xs"
            >
              Explore Flats Showcase <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
            
            <a
              href="#services"
              className="w-full sm:w-auto text-center border border-slate-700/80 bg-slate-900/40 hover:bg-slate-800 text-slate-200 px-5 py-3 rounded-xl text-xs font-semibold transition"
            >
              Our Structural Services
            </a>
          </div>
        </div>

        {/* 3D-Slide Controller */}
        <div className="absolute bottom-6 right-6 z-20 hidden md:flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
          {properties.slice(0, 3).map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActiveSlide(idx)}
              className={`text-[10px] px-2.5 py-1.5 rounded-lg font-mono font-bold transition-all ${
                activeSlide === idx 
                  ? 'bg-amber-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:bg-slate-850 hover:text-white'
              }`}
            >
              Unit {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Trust & Compliance Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "RERA Registrations", val: "100% Certified", desc: "Approved Gujarat State Authority" },
          { label: "Concrete Integrity", val: "M25 Hard Grade", desc: "Tested IS:456 Quality standard" },
          { label: "GST Compliant Invoicing", val: "18% Standard Tax", desc: "Full input tax credit protection" },
          { label: "Safety Milestone Records", val: "45,000+ Hrs", desc: "Accident-free smart build sites" }
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">{item.label}</span>
            <div className="mt-1">
              <span className="text-base font-extrabold text-amber-500">{item.val}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Services Section */}
      <div id="services" className="space-y-8 scroll-mt-20">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full font-mono uppercase tracking-wide">
            Our Offerings / हमारी सेवाएं
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Full-Stack Construction Services</h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto">
            From plot surveying, soil casting testing, structural drawing design, to final interior marble polishing, we provide turn-key building solutions with robust compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <HardHat className="w-6 h-6 text-amber-500" />,
              title: "Superstructure RCC Columns & Slabs",
              desc: "Heavy-duty foundation design using premium TMT steel reinforcement and Ultratech concrete mix checks following Indian standard IS-456 blueprints.",
              bg: "from-blue-950/20 to-slate-900"
            },
            {
              icon: <Sparkles className="w-6 h-6 text-orange-500" />,
              title: "Premium Luxury Interior Design",
              desc: "Premium double-charged vitrified tiling, modular kitchens, fine marble work, and intelligent false ceiling systems customized for elite living.",
              bg: "from-amber-950/20 to-slate-900"
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
              title: "RERA, Municipal approval & GST",
              desc: "End-to-end liaison with Municipal Corporation (Ahmedabad, Jaipur, Pune) and RERA compliances. Clean 18% tax calculations with input tax credit assistance.",
              bg: "from-emerald-950/20 to-slate-900"
            }
          ].map((srv, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${srv.bg} border border-slate-800 p-6 rounded-2xl shadow-lg relative group overflow-hidden hover:scale-[1.01] transition-transform`}>
              <div className="p-3 bg-slate-950 border border-slate-800 inline-block rounded-xl mb-4">
                {srv.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{srv.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{srv.desc}</p>
              
              {/* Corner Glow effect */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transitionpointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Customer Trust Board / Real Testimonials */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 select-none pointer-events-none text-9xl text-amber-500 font-sans">”</div>
        <div className="space-y-8">
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-white">Client Testimonials</h3>
            <p className="text-slate-400 text-xs">Stories of trust from our esteemed estate owners</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 italic">"{t.feedback}"</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-white">{t.name}</h4>
                  <p className="text-[10px] text-amber-400 font-mono">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Elegant Footer about section */}
      <div className="border-t border-slate-800 pt-10 text-center space-y-4">
        <div className="flex justify-center items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs text-slate-400 font-mono tracking-widest">GLOBAL BUILD-REALTY INDUSTRIES PVT LTD</span>
        </div>
        <p className="text-[11px] text-slate-500 max-w-xl mx-auto">
          Corporate HQ: 708-712 Empire State Building, Ring Road Hub, Jodhpur & Ahmedabad. RERA Registration No: PR/GJ/AHMEDABAD/SANAND/CAA00109/A1M. Standards conform to Bureau of Indian Standards (BIS) IS Code-456.
        </p>
      </div>
    </div>
  );
}
