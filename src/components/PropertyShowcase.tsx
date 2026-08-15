import React, { useState } from 'react';
import { Property, Inquiry, Project, CompanyProfile } from '../types';
import { i18n, Language } from '../i18n';
import { 
  Search, MapPin, Sparkles, Building, Phone, Send, Info, 
  Key, HelpCircle, CheckCircle, Plus, DollarSign, User,
  Calendar, Briefcase, Percent, Printer, Receipt
} from 'lucide-react';

interface PropertyShowcaseProps {
  lang: Language;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  projects: Project[];
  profile: CompanyProfile;
  onAddInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt'>) => void;
  onLogActivity: (action: string, details: string) => void;
}

export default function PropertyShowcase({ 
  lang, 
  properties, 
  setProperties, 
  projects, 
  profile,
  onAddInquiry, 
  onLogActivity 
}: PropertyShowcaseProps) {
  const t = i18n[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [filterProject, setFilterProject] = useState<string>('All');

  // GST Tax Invoice Custom States (Realtime live updating print modal)
  const [printInvoiceFlatId, setPrintInvoiceFlatId] = useState<string | null>(null);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [gstRate, setGstRate] = useState<number>(18);
  const [gstInclusive, setGstInclusive] = useState<boolean>(true);
  const [billType, setBillType] = useState<'FullValue' | 'CollectedToken' | 'CustomInstallment'>('FullValue');
  const [customInstallmentLakhs, setCustomInstallmentLakhs] = useState<number>(5); // default 5 Lakhs
  const [paymentMode, setPaymentMode] = useState<string>('Bank Transfer / RTGS');
  const [bankDetails, setBankDetails] = useState('State Bank of India, S.G. Highway, Ahmedabad Branch | IFSC: SBIN0020492 | A/C: 40982138982');
  const [invoiceNotes, setInvoiceNotes] = useState(`Payment received for residential booking slot under ${profile.state || 'Gujarat'} RERA Guidelines. Subject to municipal bylaws.`);

  // New Flat Creation form
  const [showAddFlatForm, setShowAddFlatForm] = useState(false);
  const [flatProjId, setFlatProjId] = useState(projects[0]?.id || '');
  const [flatNo, setFlatNo] = useState('');
  const [flatType, setFlatType] = useState<'Residential' | 'Premium Villa' | 'Plot' | 'Retail Shop'>('Residential');
  const [flatPriceLakhs, setFlatPriceLakhs] = useState(85);
  const [flatSqFt, setFlatSqFt] = useState('1450 sq.ft.');
  const [flatAmenities, setFlatAmenities] = useState('Power Backup, Gated Security, Parking, Gym');

  // Booking Form overlay modal controls
  const [bookingFlatId, setBookingFlatId] = useState<string | null>(null); // open modal with Flat ID
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [agreedPrice, setAgreedPrice] = useState(85);
  const [tokenReceived, setTokenReceived] = useState(15); // initial lakhs

  // Installment collector controls
  const [paymentFlatId, setPaymentFlatId] = useState<string | null>(null);
  const [installmentAmount, setInstallmentAmount] = useState(10); // in lakhs

  // Create new apartment unit
  const handleCreateFlat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNo.trim()) {
      alert('Kripya Flat No / Unit No darj karein!');
      return;
    }

    const matchingProject = projects.find(p => p.id === flatProjId);
    const projTitle = matchingProject ? matchingProject.name : 'Gokuldham Heights';
    const projLocation = matchingProject ? matchingProject.location : 'Sanand, Gujarat';

    const newFlat: Property = {
      id: `flat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      projectId: flatProjId,
      title: projTitle,
      flatNumber: flatNo,
      location: projLocation,
      type: flatType,
      price: `₹${flatPriceLakhs}.0 Lakhs`,
      priceLakhs: Number(flatPriceLakhs),
      size: flatSqFt || '1500 sq.ft.',
      amenities: flatAmenities.split(',').map(s => s.trim()).filter(Boolean),
      status: 'Available',
      amountReceived: 0,
      imageUrl: flatType === 'Premium Villa' 
        ? 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'
        : flatType === 'Retail Shop'
        ? 'https://images.unsplash.com/photo-1555636222-cae831e87094?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
    };

    setProperties(prev => [newFlat, ...prev]);
    onLogActivity('Registered New Flat Unit', `Listed ${newFlat.flatNumber} inside ${newFlat.title} at base price ₹${newFlat.priceLakhs} Lakhs.`);
    
    // Reset Form
    setFlatNo('');
    setShowAddFlatForm(false);
    alert('🎉 Flat registered successfully.');
  };

  // Submit Booking (Sell Flat / Grahak Book karna)
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim()) {
      alert('Kripya Grahak ka naam aur mobile phone number darj karein!');
      return;
    }

    setProperties(prev => prev.map(f => {
      if (f.id !== bookingFlatId) return f;
      return {
        ...f,
        status: 'Booked',
        price: `₹${agreedPrice}.0 Lakhs`,
        priceLakhs: agreedPrice,
        buyerName: buyerName,
        buyerPhone: buyerPhone,
        amountReceived: Number(tokenReceived)
      };
    }));

    const targetFlat = properties.find(f => f.id === bookingFlatId);
    const flatNameStr = targetFlat ? `${targetFlat.title} (${targetFlat.flatNumber})` : 'Flat Unit';

    // Log action to global ledger & inquiries
    onLogActivity('SOLD Flat Booking Registered', `Flat "${flatNameStr}" booked by buyer ${buyerName} at ₹${agreedPrice} Lakhs. Received token payment of ₹${tokenReceived} Lakhs.`);
    onAddInquiry({
      name: buyerName,
      email: `${buyerName.toLowerCase().replace(' ', '')}@gmail.com`,
      phone: buyerPhone,
      propertyType: 'Flat',
      message: `Confirmed booking for ${flatNameStr}. Downpayment of ₹${tokenReceived} Lakhs cleared on hand.`,
      status: 'Converted'
    });

    alert(`🎉 Flat ${flatNameStr} successfully booked to "${buyerName}".`);
    
    // Reset States
    setBuyerName('');
    setBuyerPhone('');
    setBookingFlatId(null);
  };

  // Collect installment check
  const handleCollectInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    setProperties(prev => prev.map(f => {
      if (f.id !== paymentFlatId) return f;
      const nextReceived = Math.min(f.priceLakhs, f.amountReceived + Number(installmentAmount));
      const nextStatus = nextReceived >= f.priceLakhs ? 'Sold Out' : 'Booked';
      
      onLogActivity('Flat Payment Installment Received', `Collected ₹${installmentAmount} Lakhs installment check from ${f.buyerName || 'buyer'} for ${f.title} ${f.flatNumber}. Total collected: ₹${nextReceived}L.`);
      return { 
        ...f, 
        amountReceived: nextReceived,
        status: nextStatus as any
      };
    }));

    setPaymentFlatId(null);
  };

  // Filters compute
  const filtered = properties.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (f.buyerName && f.buyerName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'All' || f.type.includes(selectedType);
    const matchesStatus = selectedStatus === 'All' || f.status === selectedStatus;
    const matchesProject = filterProject === 'All' || f.projectId === filterProject;

    return matchesSearch && matchesType && matchesStatus && matchesProject;
  });

  // Flat sales analytics sums
  const totalFlats = properties.length;
  const availableFlats = properties.filter(f => f.status === 'Available').length;
  const bookedFlats = properties.filter(f => f.status === 'Booked' || f.status === 'Sold Out').length;
  const totalBookedValue = properties.filter(f => f.status !== 'Available').reduce((sum, f) => sum + f.priceLakhs, 0);
  const totalCollectedCash = properties.reduce((sum, f) => sum + f.amountReceived, 0);

  const handleIframeDirectPrint = () => {
    const content = document.getElementById('print-invoice-layout')?.innerHTML;
    if (!content) {
      window.print();
      return;
    }

    // Capture original style documents to preserve design, branding & Tailwind colors
    let styles = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
      styles += el.outerHTML;
    });

    // We compile a self-contained beautiful HTML with auto-print
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GST Tax Invoice - ${invoiceNo || 'Draft'}</title>
          <meta charset="utf-8" />
          ${styles}
          <style>
            body {
              background-color: #f8fafc !important;
              color: #0f172a !important;
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              padding: 2rem;
              margin: 0;
            }
            #print-invoice-layout {
              background: white;
              padding: 2.5rem !important;
              border-radius: 1rem;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
              max-width: 210mm;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              box-sizing: border-box;
            }
            .no-print-control {
              display: none !important;
            }
            @media print {
              body {
                background: white !important;
                color: black !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              #print-invoice-layout {
                border: none !important;
                box-shadow: none !important;
                padding: 1.5cm !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div id="print-invoice-layout">
            ${content}
          </div>
          <script>
            window.addEventListener('load', function() {
              window.focus();
              setTimeout(function() {
                window.print();
              }, 300);
            });
          </script>
        </body>
      </html>
    `;

    // Try direct native print first (if in full tab or if sandbox allows it)
    try {
      // In some browsers or tab modes, window.print() is fully allowed. Let's try to open a new popup if permitted.
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(fullHtml);
        printWindow.document.close();
        return;
      }
    } catch (e) {
      console.warn("Direct window.open blocked by sandbox restriction, initiating fallback download...", e);
    }

    // Secondary fallback: Since we are in a sandboxed iframe, popup is blocked.
    // We convert the full custom styled page to a local HTML file and trigger an auto-download.
    // When the user double-clicks this file, it opens in a clean browser window and instantly triggers browser print!
    try {
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoiceNo || 'Draft'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert("⚠️ Direct Print Restriction (प्रिंट सुविधा जानकारी):\n\n" +
            "ब्राउज़र सुरक्षा नियमों के तहत iframe/sandbox के अंदर सीधा प्रिंट चालू करना अवरुद्ध है।\n\n" +
            "इसलिए हमने आपके लिए एक 100% रेडी-टू-प्रिंट 'Invoice HTML File' डाउनलोड की है!\n" +
            "जैसे ही आप डाउनलोडेड फ़ाइल को खोलेंगे, प्रिंटर डायलॉग तुरंत खुल जायेगा।\n\n" +
            "(यदि आप सीधा प्रिंट ही करना चाहते हैं, तो ऊपर 'Development App URL' या 'Shared App URL' पर क्लिक करके ऐप को नए टैब में खोलें!)");
    } catch (downloadErr) {
      console.error("All print mechanisms failed", downloadErr);
      // Final emergency fallback
      window.print();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800" id="property-showcase">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-amber-500 animate-pulse" />
            Flat Inventory & Sales Directory
          </h2>
          <p className="text-slate-500 text-xs text-xs font-semibold">
            Step 3: Sell individual flats & apartments (फ़्लैट बेचना), register buyer detail sheets, and track installment checks.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddFlatForm(!showAddFlatForm)}
          className="bg-white border border-slate-300 hover:border-amber-500 hover:text-amber-600 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow"
        >
          <Plus className="w-3.5 h-3.5 text-amber-500" /> Add New Apartment Unit
        </button>
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">TOTAL FLATS MANAGED</span>
          <span className="text-lg font-black text-slate-900 block mt-1">{totalFlats} Units</span>
          <span className="text-[10px] text-slate-500 font-mono font-semibold">Inside {projects.length} Buildings</span>
        </div>
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition animate-pulse">
          <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-600 block font-bold">AVAILABLE TO BOOK</span>
          <span className="text-lg font-black text-emerald-600 block mt-1">{availableFlats} Empty</span>
          <span className="text-[10px] text-slate-500 font-mono font-semibold">Ready for site visits</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <span className="text-[9px] uppercase font-mono tracking-widest text-amber-600 block font-bold">SALES REVENUE BOOKED</span>
          <span className="text-lg font-black text-amber-600 block mt-1">₹{totalBookedValue} Lakhs</span>
          <span className="text-[10px] text-slate-505 text-slate-500 font-mono font-semibold">{bookedFlats} flats locked</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">CASH INFLOW COLLECTED</span>
          <span className="text-lg font-black text-slate-900 block mt-1">₹{totalCollectedCash} Lakhs</span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-emerald-500 h-full" style={{ width: `${totalBookedValue > 0 ? (totalCollectedCash / totalBookedValue) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* CREATE APARTMENT BOX CONTAINER */}
      {showAddFlatForm && (
        <form onSubmit={handleCreateFlat} className="bg-slate-50 border border-slate-205 p-6 rounded-2xl space-y-4 max-w-4xl mx-auto shadow-inner animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs uppercase font-mono tracking-widest text-amber-600 font-extrabold">Register New Apartment Unit inside Building</h3>
            <button type="button" onClick={() => setShowAddFlatForm(false)} className="text-slate-500 text-[10px] hover:text-slate-800">✕ Close</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Select Building Project Tower *</label>
              <select
                required
                value={flatProjId}
                onChange={(e) => setFlatProjId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Apartment Flat / Unit Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. Flat B-402, Shop G-12"
                value={flatNo}
                onChange={(e) => setFlatNo(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Layout Category</label>
              <select
                value={flatType}
                onChange={(e: any) => setFlatType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800"
              >
                <option value="Residential">Residential Apartment</option>
                <option value="Premium Villa">Luxury Duplex Villa Lot</option>
                <option value="Retail Shop">Commercial Retail Shop Unit</option>
                <option value="Plot">Farm Plot Layout</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Base Price (₹ Lakhs) *</label>
              <input
                type="number"
                required
                value={flatPriceLakhs}
                onChange={(e) => setFlatPriceLakhs(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-850 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Dimensions Space (e.g. 1450 sq.ft.)</label>
              <input
                type="text"
                placeholder="e.g. 1450 sq.ft. Super Built-up"
                value={flatSqFt}
                onChange={(e) => setFlatSqFt(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Featured Amenities (comma separated)</label>
              <input
                type="text"
                placeholder="Power Backup, Club House, Double Tiling"
                value={flatAmenities}
                onChange={(e) => setFlatAmenities(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs transition shadow-sm"
          >
            Confirm Flat Registration Listing
          </button>
        </form>
      )}

      {/* FILTER PANEL */}
      <div className="bg-white p-4 rounded-2xl border border-slate-205 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search flats, check buyer names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 rounded-lg text-xs py-2.5 pl-10 pr-3 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Project filter */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-white border border-slate-300 p-2 rounded-lg text-xs text-slate-700 font-semibold focus:outline-none"
          >
            <option value="All">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Unit layout category */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-white border border-slate-300 p-2 rounded-lg text-xs text-slate-700 font-semibold focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Residential">Residential Floors</option>
            <option value="Premium Villa">Luxury Villas</option>
            <option value="Retail Shop">Commercial Shops</option>
          </select>

          {/* Status filtering */}
          <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
            {['All', 'Available', 'Booked', 'Sold Out'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`text-[9.5px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  selectedStatus === st ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* CORE FLAT GRID CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(flat => {
          const matchingProject = projects.find(p => p.id === flat.projectId);
          const percentPaid = flat.priceLakhs > 0 ? Math.round((flat.amountReceived / flat.priceLakhs) * 100) : 0;
          
          return (
            <div 
              key={flat.id} 
              className="bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between transition duration-200"
            >
              <div>
                
                {/* Graphics & Badges */}
                <div className="h-44 overflow-hidden bg-slate-100 relative">
                  <img src={flat.imageUrl} alt={flat.flatNumber} className="w-full h-full object-cover" />
                  
                  <div className="absolute top-3 left-3 bg-white/90 text-amber-705 text-amber-700 border border-slate-200 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md uppercase shadow-sm">
                    {flat.type}
                  </div>

                  <div className={`absolute bottom-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-md shadow ${
                    flat.status === 'Available' ? 'bg-emerald-500 text-white' : flat.status === 'Booked' ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-200 text-slate-700 font-bold'
                  }`}>
                    {flat.status}
                  </div>
                </div>

                {/* Info block */}
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-slate-450 text-slate-500 font-bold text-[10px] font-mono uppercase tracking-wide">
                        {flat.title} {matchingProject ? `(${matchingProject.progress}% Built structure)` : ''}
                      </h4>
                      <h3 className="text-base font-black text-slate-900 mt-1">{flat.flatNumber}</h3>
                    </div>
                    <span className="font-mono text-sm font-black text-amber-600">{flat.price}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {flat.location}
                  </p>

                  <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono flex justify-between items-center text-[10px] shadow-inner font-semibold">
                    <span>Dimension: <strong className="text-slate-800">{flat.size}</strong></span>
                    <span>Approved title clear</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {flat.amenities.map((a, idx) => (
                      <span key={idx} className="bg-slate-50 text-[10px] text-slate-600 py-1 px-2.5 border border-slate-200 rounded-md font-medium">
                        ☘️ {a}
                      </span>
                    ))}
                  </div>

                  {/* SOLD BUYER RECORD SECTION */}
                  {(flat.status === 'Booked' || flat.status === 'Sold Out') && (
                    <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl space-y-2.5 mt-3 shadow-inner text-slate-800">
                      <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wide text-slate-450 text-slate-500 border-b border-amber-500/15 pb-1.5">
                        <span className="text-amber-705 text-amber-700 font-black flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Registered Buyer details
                        </span>
                        <span className="font-bold">Verified Agreement</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">BUYER NAME</span>
                          <span className="text-slate-900 font-extrabold">{flat.buyerName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">MOBILE NO</span>
                          <a href={`tel:${flat.buyerPhone}`} className="text-amber-700 font-mono text-[10px] font-bold hover:underline block">
                            📞 {flat.buyerPhone}
                          </a>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                          <span className="text-slate-500">Collected Payments (₹ Lakhs)</span>
                          <span className="text-emerald-600">
                            ₹{flat.amountReceived}L / ₹{flat.priceLakhs}L ({percentPaid}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${percentPaid}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Action operations button layout */}
              <div className="p-5 pt-0 mt-1">
                {flat.status === 'Available' ? (
                  <button
                    onClick={() => {
                      setBookingFlatId(flat.id);
                      setAgreedPrice(flat.priceLakhs);
                      setTokenReceived(Math.round(flat.priceLakhs * 0.2)); // 20% default token downpayment
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <Send className="w-4 h-4 text-slate-950" /> Sell Flat & Record Token
                  </button>
                ) : flat.status === 'Booked' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setPaymentFlatId(flat.id);
                        setInstallmentAmount(10);
                      }}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold py-2.5 rounded-xl text-[11px] flex items-center justify-center gap-1 transition shadow-sm"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" /> + Installment
                    </button>
                    <button
                      onClick={() => {
                        setPrintInvoiceFlatId(flat.id);
                        setInvoiceNo(`INV-AMD-${flat.flatNumber.replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-[11px] flex items-center justify-center gap-1 transition shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" /> GST Invoice
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setPrintInvoiceFlatId(flat.id);
                      setInvoiceNo(`INV-AMD-${flat.flatNumber.replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <Printer className="w-4 h-4" /> Print Final GST Invoice (जीएसटी बिल)
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL 1: SOLD / BOOK FLAT FORM */}
      {bookingFlatId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 overflow-y-auto p-4 flex items-center justify-center" id="flat-sales-booking-modal">
          <form onSubmit={handleConfirmBooking} className="bg-white border border-slate-300 text-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setBookingFlatId(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 bg-slate-100 p-2 rounded-full border border-slate-200 transition"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 pb-3">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 border border-amber-500/20 px-3 py-1 rounded-full text-[9px] font-mono uppercase font-black">
                RERA Authorized Booking
              </span>
              <h3 className="text-base font-black text-slate-900 mt-2">Confirm Flat Sale & Book Unit</h3>
              <p className="text-slate-500 text-xs mt-1 font-semibold">
                Enter buyer identification coordinate data to generate standard registry agreement of sale.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Purchaser/Buyer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Buyer Mobile Phone (WhatsApp Alert) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98980 12345"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Agreed Deal Price (Lakhs) *</label>
                  <input
                    type="number"
                    required
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Token Downpayment Lakhs *</label>
                  <input
                    type="number"
                    required
                    value={tokenReceived}
                    onChange={(e) => setTokenReceived(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-800 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-xl text-xs flex justify-center items-center gap-1.5 cursor-pointer shadow"
            >
              Confirm Sale & Register Agreement of Booking
            </button>
          </form>
        </div>
      )}

      {/* MODAL 2: RECEIVE INSTALLMENT CHECK */}
      {paymentFlatId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 overflow-y-auto p-4 flex items-center justify-center" id="flat-installment-modal">
          <form onSubmit={handleCollectInstallment} className="bg-white border border-slate-300 text-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-fade-in">
            <button
              type="button"
              onClick={() => setPaymentFlatId(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 bg-slate-100 p-2 rounded-full border border-slate-200 transition"
            >
              ✕
            </button>

            <div>
              <h3 className="text-sm font-black text-slate-900">Record Installment Check</h3>
              <p className="text-slate-505 text-slate-500 text-xs mt-1 font-semibold">
                Enter installment payout amount in lakhs to clear flat structural progression liability.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Additional Collected Amount (₹ Lakhs) *</label>
              <input
                type="number"
                required
                value={installmentAmount}
                onChange={(e) => setInstallmentAmount(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-xs text-slate-800 font-bold font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-2.5 rounded-lg text-xs transition shadow-sm"
            >
              Receipt Installment Payment
            </button>
          </form>
        </div>
      )}

      {/* MODAL 3: GST INVOICE LIVE VIEWER & PRINT ENGINE */}
      {printInvoiceFlatId && (() => {
        const flat = properties.find(f => f.id === printInvoiceFlatId);
        if (!flat) return null;

        // Financial Variables in Lakhs
        const totalLakhs = billType === 'FullValue' ? flat.priceLakhs : 
                           billType === 'CollectedToken' ? flat.amountReceived : 
                           customInstallmentLakhs;
        
        // Let's convert lakhs to INR rupees for the official look (Multiply by 1,00,000)
        const totalAmountRupees = totalLakhs * 100000;
        
        // Tax computation formulas:
        let taxableValue = 0;
        let cgstAmount = 0;
        let sgstAmount = 0;
        let finalDisplayRupees = totalAmountRupees;

        if (gstInclusive) {
          // Total amount includes GST, so we extract back Base taxable value
          taxableValue = totalAmountRupees / (1 + (gstRate / 100));
          const totalTax = totalAmountRupees - taxableValue;
          cgstAmount = totalTax / 2;
          sgstAmount = totalTax / 2;
          finalDisplayRupees = totalAmountRupees;
        } else {
          // GST is on top of base Price
          taxableValue = totalAmountRupees;
          const totalTax = totalAmountRupees * (gstRate / 100);
          cgstAmount = totalTax / 2;
          sgstAmount = totalTax / 2;
          finalDisplayRupees = totalAmountRupees + totalTax;
        }

        // Helper to format rupees to elegant Indian currency: e.g. "₹85,00,000.00"
        const formatRupees = (num: number) => {
          return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
          }).format(num);
        };

        // Number to Words converter (English & Hindi elements) so it looks beautiful
        const numToWords = (n: number): string => {
          const a = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
          ];
          const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
          const g = ['', 'Thousand', 'Lakh', 'Crore'];
          
          if (n === 0) return 'Zero';
          
          const makeGroup = (num: number) => {
            let out = '';
            if (num >= 100) {
              out += a[Math.floor(num / 100)] + ' Hundred ';
              num %= 100;
            }
            if (num >= 20) {
              out += b[Math.floor(num / 10)] + ' ';
              num %= 10;
            }
            if (num > 0) {
              out += a[num] + ' ';
            }
            return out.trim();
          };

          let wordString = '';
          let temp = Math.floor(n);
          
          // Crore
          if (temp >= 10000000) {
            wordString += makeGroup(Math.floor(temp / 10000000)) + ' Crore ';
            temp %= 10000000;
          }
          // Lakhs
          if (temp >= 100000) {
            wordString += makeGroup(Math.floor(temp / 100000)) + ' Lakh ';
            temp %= 100000;
          }
          // Thousands
          if (temp >= 1000) {
            wordString += makeGroup(Math.floor(temp / 1000)) + ' Thousand ';
            temp %= 1000;
          }
          // Hundreds & Tens
          if (temp > 0) {
            wordString += makeGroup(temp);
          }
          
          return wordString.trim() + ' Rupees Only';
        };

        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 overflow-y-auto p-2 md:p-6 flex items-center justify-center animate-fade-in" id="gst-invoice-pannel-modal">
            
            {/* INJECT PRINTSHEET CSS ON THE FLY */}
            <style dangerouslySetInnerHTML={{__html: `
              @page {
                size: A4 portrait;
                margin: 0.6cm !important;
              }
              @media print {
                /* Hide everything in the document by default */
                body * {
                  visibility: hidden !important;
                }

                /* Show only the invoice layout and its children to the printer */
                #print-invoice-layout, #print-invoice-layout * {
                  visibility: visible !important;
                }

                /* Standardize all ancestor elements to be transparent, block layout and overflow so printing spans perfectly */
                html, body, #root, main, #tab-module-content, #property-showcase, #gst-invoice-pannel-modal, #gst-invoice-pannel-modal > div, #print-sheet-viewport {
                  background: white !important;
                  color: black !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  height: auto !important;
                  min-height: auto !important;
                  max-height: none !important;
                  overflow: visible !important;
                  display: block !important;
                  position: static !important;
                  box-shadow: none !important;
                  border: none !important;
                }

                /* Position #print-invoice-layout exactly at top left corner */
                #print-invoice-layout {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  min-height: 0 !important;
                  margin: 0 !important;
                  padding: 0.4cm !important;
                  box-sizing: border-box !important;
                  background: white !important;
                  color: black !important;
                  border: none !important;
                  box-shadow: none !important;
                  display: block !important;
                  page-break-inside: avoid !important;
                }

                /* Strict overrides to enforce compact sizes and fit perfectly on single page A4 portrait */
                #print-invoice-layout {
                  font-size: 10px !important;
                  line-height: 1.25 !important;
                }
                #print-invoice-layout h1 {
                  font-size: 14px !important;
                }
                #print-invoice-layout table {
                  font-size: 9px !important;
                }
                /* Tighten tailwind spacings on print */
                #print-invoice-layout .space-y-6,
                #print-invoice-layout .space-y-4 {
                  margin-top: 0.5rem !important;
                  margin-bottom: 0.5rem !important;
                }
                #print-invoice-layout .space-y-6 > :not([hidden]) ~ :not([hidden]),
                #print-invoice-layout .space-y-4 > :not([hidden]) ~ :not([hidden]) {
                  margin-top: 0.5rem !important;
                }
                #print-invoice-layout .p-8 {
                  padding: 0.8rem !important;
                }
                #print-invoice-layout .p-4 {
                  padding: 0.4rem !important;
                }
                #print-invoice-layout .p-3 {
                  padding: 0.35rem 0.4rem !important;
                }
                #print-invoice-layout .pt-12 {
                  padding-top: 0.8rem !important;
                }
                #print-invoice-layout .pt-5 {
                  padding-bottom: 0.5rem !important;
                }
                #print-invoice-layout .pb-5 {
                  padding-bottom: 0.5rem !important;
                }
                #print-invoice-layout .gap-6 {
                  gap: 0.5rem !important;
                }

                /* Maintain pristine printing colors and details */
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
            `}} />

            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-6xl h-[90vh] md:h-[85vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
              
              {/* SIDEBAR: CONTROLS & EDITORS (Hides on standard printout) */}
              <div className="w-full md:w-80 bg-slate-800 border-b md:border-b-0 md:border-r border-slate-700/85 p-5 flex flex-col justify-between overflow-y-auto no-print-control text-slate-100 shrink-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">GST Invoice Engine</h3>
                    </div>
                    <span className="text-[9px] bg-slate-700 px-2 py-0.5 rounded font-mono text-slate-300">Live Editor</span>
                  </div>

                  {/* Operational Bill Modes */}
                  <div className="space-y-1.5 text-xs">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase">Invoice Billing Scope</label>
                    <div className="flex flex-col gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-700/60">
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => setBillType('FullValue')}
                          className={`py-1.5 rounded-lg text-[9px] font-black transition ${
                            billType === 'FullValue' ? 'bg-amber-500 text-slate-950 flex-1' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          📄 Full Value
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (flat.amountReceived === 0) {
                              alert('⚠️ Warning: No payment check received yet. Generating token receipt of ₹0L.');
                            }
                            setBillType('CollectedToken');
                          }}
                          className={`py-1.5 rounded-lg text-[9px] font-black transition ${
                            billType === 'CollectedToken' ? 'bg-amber-500 text-slate-950 flex-1' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          💳 Token
                        </button>
                        <button
                          type="button"
                          onClick={() => setBillType('CustomInstallment')}
                          className={`py-1.5 rounded-lg text-[9px] font-black transition flex items-center justify-center gap-1 ${
                            billType === 'CustomInstallment' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          💸 Installment
                        </button>
                      </div>
                      
                      {billType === 'CustomInstallment' && (
                        <div className="flex items-center gap-2 mt-1 px-1 py-1">
                          <label className="text-[10px] text-slate-300 font-bold w-1/2">Installment Amt (Lakhs):</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={customInstallmentLakhs}
                            onChange={(e) => setCustomInstallmentLakhs(Number(e.target.value))}
                            className="flex-1 bg-slate-800 text-white text-xs font-mono px-2 py-1.5 rounded border border-slate-600 focus:outline-none focus:border-indigo-400"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GST Calculation Toggles */}
                  <div className="space-y-1.5 text-xs">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase">GST Mode Switcher</label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => setGstInclusive(true)}
                        className={`py-1.5 rounded-lg text-[10px] font-black transition ${
                          gstInclusive ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Inclusive (शामिल)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGstInclusive(false)}
                        className={`py-1.5 rounded-lg text-[10px] font-black transition ${
                          !gstInclusive ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Exclusive (अलग से)
                      </button>
                    </div>
                  </div>

                  {/* Customized Inputs */}
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Tax Invoice No *</label>
                      <input
                        type="text"
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-[11px] text-amber-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">State GST Rate (%)</label>
                      <select
                        value={gstRate}
                        onChange={(e) => setGstRate(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value={18}>18% Standard GST (CGST 9% + SGST 9%)</option>
                        <option value={12}>12% Real Estate Effective ITC Claimed</option>
                        <option value={5}>5% Affordable Housing Scheme Rate</option>
                        <option value={1}>1% Special Low Cost Scheme Rate</option>
                        <option value={0}>0% GST Exemption Declared</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Settlement Method</label>
                      <input
                        type="text"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Company Bank Details</label>
                      <textarea
                        rows={2}
                        value={bankDetails}
                        onChange={(e) => setBankDetails(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-[10px] text-slate-300 leading-relaxed font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Legal Declarations Footnote</label>
                      <textarea
                        rows={3}
                        value={invoiceNotes}
                        onChange={(e) => setInvoiceNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-[10px] text-slate-300 leading-relaxed focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700 space-y-3 mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleIframeDirectPrint}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95"
                  >
                    <Printer className="w-5 h-5 text-slate-950" /> Print Invoice / बिल प्रिंट करें
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrintInvoiceFlatId(null)}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs py-2 px-4 rounded-xl transition"
                  >
                    ✕ Close Panel
                  </button>
                </div>
              </div>

              {/* SHEET: HIGHLY POLISHED OFFICIAL A4 REAL-ESTATE GST TAX INVOICE */}
              <div className="flex-1 bg-slate-950 p-4 md:p-8 overflow-y-auto text-slate-900 select-all" id="print-sheet-viewport">

                {/* THE ACTUAL PRINT AREA KEY TARGET */}
                <div id="print-invoice-layout" className="bg-white text-slate-900 p-6 md:p-7 border border-white rounded-2xl space-y-4 max-w-[210mm] mx-auto min-h-0 shadow-xl">
                  
                  {/* Top Header: Brand Identity & Stamp banner */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3.5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {profile.logoUrl && (
                          <img src={profile.logoUrl} alt="Logo" className="w-9 h-9 object-contain bg-white mr-1" />
                        )}
                        <h1 className="text-lg font-black uppercase tracking-tight text-slate-950 leading-none">
                          {profile.companyName}
                        </h1>
                      </div>
                      <p className="text-[10px] text-slate-600 font-semibold max-w-sm leading-normal whitespace-pre-line">
                        📍 Registered Office: {profile.address}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        📞 Phone / WhatsApp: <strong className="text-slate-800">{profile.phoneNo}</strong> | Director: <strong className="text-slate-800">{profile.directorName}</strong>
                      </p>
                      <p className="text-[9px] uppercase font-mono tracking-wider text-amber-700 bg-amber-50 border border-amber-200 py-0.5 px-2 rounded font-extrabold inline-block">
                        RERA RGN NO: {profile.state?.substring(0, 2).toUpperCase() || 'GJ'}/{profile.city?.substring(0, 6).toUpperCase() || 'SANAND'}/REG/A1M
                      </p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="inline-block bg-slate-950 text-white font-black uppercase tracking-wider text-[9px] px-3 py-0.5 rounded-sm mb-1.5">
                        TAX INVOICE (जीएसटी बिल)
                      </span>
                      <p className="text-[9.5px] text-slate-500 font-mono">INVOICE NO: <strong className="text-slate-950 text-[10px]">{invoiceNo}</strong></p>
                      <p className="text-[9.5px] text-slate-500 font-mono">DATE: <strong className="text-slate-950">{new Date().toISOString().substring(0, 10)}</strong></p>
                      <p className="text-[9.5px] text-slate-505 text-slate-500 font-mono">GSTIN: <strong className="text-amber-700 text-[10px]">{profile.gstNo || '24AAACH8172J1ZS'}</strong></p>
                      <p className="text-[9.5px] text-slate-500 font-mono">PLACE OF OUTFLOW: <strong className="text-slate-950">{profile.city || 'Ahmedabad'}, {profile.state || 'Gujarat'}</strong></p>
                    </div>
                  </div>

                  {/* Consignee / Buyer metadata block */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 border border-slate-200 rounded-xl">
                    <div className="space-y-0.5 text-xs">
                      <span className="text-[9px] uppercase font-mono font-black text-rose-600 block">Property Purchaser (क्रेता विवरण)</span>
                      <p className="font-extrabold text-xs text-slate-950 leading-tight">{flat.buyerName}</p>
                      <p className="text-[9.5px] text-slate-500 font-mono">Mobile No: <strong className="text-slate-850 font-sans">{flat.buyerPhone}</strong></p>
                      <p className="text-[9.5px] text-slate-500 font-semibold">Residential booking agreement sheet verified.</p>
                    </div>
                    
                    <div className="space-y-0.5 text-xs text-right">
                      <span className="text-[9px] uppercase font-mono font-black text-slate-500 block">Unit Particulars (विवरण)</span>
                      <p className="font-extrabold text-slate-950 text-xs">Unit Unit No: {flat.flatNumber}</p>
                      <p className="text-[9.5px] text-slate-600 font-semibold font-mono">Structure Status: {flat.type} | Dimension: {flat.size}</p>
                      <p className="text-[9.5px] text-slate-500">Project Tower: <strong className="text-slate-800">{flat.title}</strong></p>
                    </div>
                  </div>

                  {/* Core GST Calculation breakdown table */}
                  <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs bg-white">
                      <thead className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider">
                        <tr>
                          <th className="py-2 px-3">Description of Housing Asset Supplied</th>
                          <th className="py-2 px-3 text-right">Super Area</th>
                          <th className="py-2 px-3 text-right">Payment Scope</th>
                          <th className="py-2 px-3 text-right">Taxable Base (₹)</th>
                          <td className="py-2 px-3 text-right">CGST ({gstRate/2}%)</td>
                          <td className="py-2 px-3 text-right">SGST ({gstRate/2}%)</td>
                          <th className="py-2 px-3 text-right">Final Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-2 px-3 font-semibold text-slate-900 leading-normal">
                            Booking agreement value of RERA Unit <strong className="text-slate-950 font-black">{flat.flatNumber}</strong> inside {flat.title}. <br />
                            <span className="block text-[8.5px] text-slate-500 font-mono font-bold mt-0.5">
                              GST Mode: {gstInclusive ? 'Inclusive' : 'Plus GST Rate extra'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-700">{flat.size}</td>
                          <td className="py-2 px-3 text-right text-slate-600 font-bold">
                            {billType === 'FullValue' ? 'Full Value' : billType === 'CollectedToken' ? 'Token Receipt' : 'Installment Receipt'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-black text-slate-800">
                            {formatRupees(taxableValue)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            {formatRupees(cgstAmount)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            {formatRupees(sgstAmount)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-black text-slate-950">
                            {formatRupees(finalDisplayRupees)}
                          </td>
                        </tr>

                        {/* Calculation Summary Block */}
                        <tr className="bg-slate-50 font-semibold font-mono text-[10px]">
                          <td colSpan={3} className="py-1.5 px-3 text-right font-black uppercase text-[8.5px] tracking-wider text-slate-500">Totals</td>
                          <td className="py-1.5 px-3 text-right text-slate-800 font-black">{formatRupees(taxableValue)}</td>
                          <td className="py-1.5 px-3 text-right text-slate-600">{formatRupees(cgstAmount)}</td>
                          <td className="py-1.5 px-3 text-right text-slate-600">{formatRupees(sgstAmount)}</td>
                          <td className="py-1.5 px-3 text-right text-slate-950 font-black text-xs">{formatRupees(finalDisplayRupees)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* INR Amount in Words */}
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs space-y-0.5">
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-500 block">Amount in words (शब्दों में राशि)</span>
                    <p className="font-extrabold text-slate-950 text-[10.5px] font-serif tracking-wide">
                      {numToWords(finalDisplayRupees)}
                    </p>
                  </div>

                  {/* Payment Settlement Coordinates and Legal terms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                    <div className="space-y-2 border-r border-dashed border-slate-200 pr-3">
                      <div className="space-y-0.5">
                        <span className="text-[8.5px] font-black uppercase text-slate-500 tracking-wider block">Company Bank RTGS Payout Settings</span>
                        <p className="text-[9.5px] font-mono leading-relaxed text-slate-850 bg-slate-50 p-2 border border-slate-200 rounded-lg whitespace-pre-line">
                          💳 {bankDetails}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8.5px] font-black uppercase text-slate-500 tracking-wider block">Approved Settlement Class</span>
                        <p className="text-[10px] font-mono font-black text-amber-700">Mode: {paymentMode}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pl-1">
                      <span className="text-[8.5px] font-black uppercase text-slate-500 tracking-wider block">Real Estate Declarations & Liability Limit</span>
                      <p className="text-[9.5px] text-slate-500 leading-normal italic">
                        {invoiceNotes}
                      </p>
                      <p className="text-[9px] font-bold text-slate-600 font-mono">
                        RERA RGN NO: {profile.city?.substring(0, 6).toUpperCase() || 'SANAND'}-{profile.state?.substring(0, 2).toUpperCase() || 'GJ'}-A1M | Approved Municipal NOC Number: AMC/BUILD/RGN-492
                      </p>
                    </div>
                  </div>

                  {/* Signatures & Stamps section */}
                  <div className="flex justify-between items-end pt-5 border-t border-slate-200">
                    <div className="text-[9.5px] text-slate-500 max-w-xs">
                      <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-[8.5px] font-bold leading-normal uppercase">
                        ⚠️ NOTE: This tax invoice is RERA-active. Any disputes are subject to the exclusive jurisdiction of High Court, {profile.city || 'Ahmedabad'}.
                      </div>
                    </div>

                    <div className="text-right space-y-1.5">
                      {/* Interactive visual spacer mimicking genuine signature stamp */}
                      <div className="relative inline-block pr-6">
                        <div className="w-14 h-14 border-2 border-red-500/30 rounded-full flex flex-col items-center justify-center text-center rotate-12 absolute -top-8 right-12 scale-90 pointer-events-none opacity-45 select-none font-black font-mono">
                          <span className="text-[7px] uppercase text-red-600 tracking-tighter">APPROVED</span>
                          <span className="text-[6px] text-red-600 tracking-tight">{profile.companyName.substring(0, 15)}</span>
                          <span className="text-[5px] text-red-500">RERA GSTIN</span>
                        </div>
                        <div className="font-mono text-[9px] text-slate-500 select-none pb-1.5">
                          For {profile.companyName}
                        </div>
                      </div>
                      
                      <div className="text-center font-bold">
                        <div className="w-40 border-b border-slate-900 mx-auto" />
                        <span className="block text-[10px] text-slate-950 font-black tracking-wide uppercase mt-1">
                          {profile.directorName}
                        </span>
                        <span className="block text-[7.5px] text-slate-500 uppercase font-bold tracking-wider">
                          Onsite Managing Director / Auth. Signatory
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
              
            </div>
          </div>
        );
      })()}

    </div>
  );
}
