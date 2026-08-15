import React, { useState, useRef } from 'react';
import { Property, CompanyProfile, Project } from '../types';
import { FileText, Search, Building2, User, Phone, Save, Download, Stamp, Landmark, CheckCircle2, Printer } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface BookingAgreementManagerProps {
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  projects: Project[];
  profile: CompanyProfile;
  onLogActivity: (action: string, details: string) => void;
}

export default function BookingAgreementManager({
  properties,
  setProperties,
  projects,
  profile,
  onLogActivity
}: BookingAgreementManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const relatedProject = projects.find(proj => proj.id === selectedProperty?.projectId);
  
  // Filter available and booked properties (for agreement generation/viewing)
  const filteredProperties = properties.filter(p => 
    (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (p.buyerName && p.buyerName.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleSelectProperty = (property: Property) => {
    setSelectedPropertyId(property.id);
    setBuyerName(property.buyerName || '');
    setBuyerPhone(property.buyerPhone || '');
    setBuyerAddress(property.buyerAddress || '');
    setAdvanceAmount(property.amountReceived > 0 ? property.amountReceived.toString() : '');
  };

  const generateAgreementPdf = async () => {
    if (!printRef.current) return null;
    
    const element = printRef.current;
    const width = element.scrollWidth;
    const height = element.scrollHeight;
    
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width: width,
      height: height,
      style: {
        width: width + 'px',
        height: height + 'px',
        overflow: 'hidden'
      }
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pdfHeight = (height * pdfWidth) / width;

    let position = 0;
    let heightLeft = pdfHeight;

    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    return pdf;
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    
    // Open the new tab synchronously to avoid popup blockers
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to use the print feature.");
      return;
    }

    const printContent = printRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Agreement</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page { size: auto; margin: 10mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .print\\:hidden { display: none !important; }
              .print\\:block { display: block !important; }
            }
            body { 
              background: white; 
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
              padding: 20px;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          <div class="max-w-3xl mx-auto">
            ${printContent}
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 1000);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPdf = async () => {
    try {
      const pdf = await generateAgreementPdf();
      if (pdf) {
        pdf.save(`Booking_Agreement_${selectedProperty?.flatNumber || 'Draft'}.pdf`);
      }
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleSaveAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    
    // In a real app we'd save this to a backend. For now, we update the property state.
    setProperties(prev => prev.map(p => 
      p.id === selectedProperty.id ? { 
        ...p, 
        status: 'Booked',
        buyerName: buyerName,
        buyerPhone: buyerPhone,
        buyerAddress: buyerAddress,
        amountReceived: Number(advanceAmount)
      } : p
    ));
    
    onLogActivity('Booking Agreement Created', `Drafted agreement for ${selectedProperty.flatNumber} (${selectedProperty.title}) in name of ${buyerName}.`);
    setTimeout(() => {
      if (handlePrint) {
        handlePrint();
      }
    }, 150);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Stamp className="w-6 h-6 text-amber-500" />
            Booking Agreements
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Draft, review and finalize customer property booking agreements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Property Search List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search flats, plots, or buyers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredProperties.length === 0 ? (
              <div className="text-center text-slate-400 py-8 text-sm">
                No properties match your search.
              </div>
            ) : (
              filteredProperties.map((prop) => (
                <div 
                  key={prop.id}
                  onClick={() => handleSelectProperty(prop)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPropertyId === prop.id 
                      ? 'bg-amber-50 border-amber-300 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-amber-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">{prop.flatNumber}</h4>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      prop.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                      prop.status === 'Booked' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {prop.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-1"><Building2 className="w-3 h-3 inline mr-1" />{prop.title}</p>
                  {prop.buyerName && (
                    <p className="text-xs text-slate-600 font-semibold"><User className="w-3 h-3 inline mr-1" /> {prop.buyerName}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Agreement Drafter Document */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          {selectedProperty ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              {/* Draft Header Actions */}
              <div className="bg-slate-50/80 border-b border-slate-100 p-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-slate-800">Draft Agreement: {selectedProperty.flatNumber}</h3>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => handlePrint()}
                     className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                   >
                     <Printer className="w-3.5 h-3.5" /> Print
                   </button>
                   <button 
                     onClick={handleDownloadPdf}
                     className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                   >
                     <Download className="w-3.5 h-3.5" /> Download PDF
                   </button>
                   <button 
                     onClick={handleSaveAgreement}
                     className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-amber-400 border border-amber-500 px-3 py-1.5 rounded-lg hover:bg-amber-500 transition shadow-sm"
                   >
                     <Save className="w-3.5 h-3.5" /> Save Draft
                   </button>
                </div>
              </div>

              {/* The Agreement Paper */}
              <div className="p-8 max-w-3xl mx-auto">
                <div id="printable-agreement" ref={printRef} className="border border-slate-200 p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.03)] bg-white relative">
                  
                  {/* Letterhead */}
                  <div className="flex items-start justify-between border-b-2 border-slate-800 pb-6 mb-8">
                    <div className="w-1/3 text-left">
                      {profile.logoUrl ? (
                        <img src={profile.logoUrl} alt="Logo" className="h-16 object-contain" />
                      ) : (
                        <div className="h-16 w-16 bg-slate-100 flex items-center justify-center rounded-xl border border-slate-200">
                           <Building2 className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="w-2/3 text-right">
                      <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900 font-serif">
                        {profile.companyName}
                      </h1>
                      <p className="text-sm text-slate-600 font-medium mt-1">{profile.address}</p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">GSTIN: {profile.gstNo} | Ph: {profile.phoneNo}</p>
                    </div>
                  </div>

                  <h2 className="text-center text-lg font-bold uppercase decoration-slate-300 underline underline-offset-4 mb-10">
                    Allotment / Booking Agreement
                  </h2>

                  <div className="space-y-6 text-sm text-slate-700 leading-relaxed text-justify">
                    <p>
                      This Agreement is made on <strong>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>, between 
                      <strong className="text-slate-900"> {profile.companyName} </strong> 
                      represented by its Director <strong>{profile.directorName}</strong> (hereinafter referred to as the "Builder/Developer") AND:
                    </p>

                    {/* Buyer Inputs Form Style within the Document */}
                    <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-lg space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Purchaser Name</label>
                          <input 
                            type="text" 
                            value={buyerName}
                            onChange={e => setBuyerName(e.target.value)}
                            placeholder="Enter full name"
                            className="w-full bg-white border-b border-slate-300 px-2 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500 print:hidden" 
                          />
                          <span className="hidden print:block w-full border-b border-slate-400 border-dotted px-2 py-1.5 text-sm font-bold text-slate-900">
                            {buyerName || '\u00A0'}
                          </span>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Mobile No.</label>
                          <input 
                            type="text" 
                            value={buyerPhone}
                            onChange={e => setBuyerPhone(e.target.value)}
                            placeholder="+91 XXXX XXXXX"
                            className="w-full bg-white border-b border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 print:hidden" 
                          />
                          <span className="hidden print:block w-full border-b border-slate-400 border-dotted px-2 py-1.5 text-sm text-slate-900">
                            {buyerPhone || '\u00A0'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Permanent Address</label>
                        <input 
                          type="text" 
                          value={buyerAddress}
                          onChange={e => setBuyerAddress(e.target.value)}
                          placeholder="Current residential address"
                          className="w-full bg-white border-b border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 print:hidden" 
                        />
                        <span className="hidden print:block w-full border-b border-slate-400 border-dotted px-2 py-1.5 text-sm text-slate-900">
                          {buyerAddress || '\u00A0'}
                        </span>
                      </div>
                    </div>

                    <p>
                      (Hereinafter referred to as the "Purchaser"), who has agreed to purchase the following property:
                    </p>

                    {/* Property Details Grid */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm bg-slate-50 p-5 border border-slate-200">
                      <div>
                        <span className="text-slate-500 text-xs block">Unit ID / Flat No.</span>
                        <span className="font-bold text-slate-900">{selectedProperty.flatNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs block">Project / Building</span>
                        <span className="font-bold text-slate-900">{selectedProperty.title}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs block">Property Type</span>
                        <span className="font-bold text-slate-900">{selectedProperty.type}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs block">Carpet Area / Size</span>
                        <span className="font-bold text-slate-900">{selectedProperty.size}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 text-xs block">Location</span>
                        <span className="font-bold text-slate-900">{selectedProperty.location}</span>
                      </div>
                    </div>

                    {/* Financials terms */}
                    <div className="space-y-3 mt-6">
                      <h4 className="font-bold text-slate-900 text-base">Payment Terms</h4>
                      <p>
                        The total agreed consideration for the aforementioned property unit is finalised at 
                        <strong className="text-slate-900 ml-1 bg-amber-100 px-1">{selectedProperty.price}</strong> 
                        (excluding Govt. taxes, registration fees, and society maintenance).
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-700">Advance booking amount received: Rs.</span>
                        <input 
                          type="number" 
                          value={advanceAmount}
                          onChange={e => setAdvanceAmount(e.target.value)}
                          placeholder="00"
                          className="w-32 bg-slate-50 border-b border-slate-400 px-2 py-1 font-bold text-slate-900 text-center focus:outline-none print:hidden"
                        />
                        <span className="hidden print:inline-block w-32 border-b border-slate-400 border-dotted px-2 py-1 font-bold text-slate-900 text-center">
                          {advanceAmount || '00'}
                        </span>
                        <span className="font-medium text-slate-700">Lakhs</span>
                      </div>
                      <p className="text-xs text-slate-500 italic mt-2">
                        * The remaining balance is to be paid as per the milestone payment schedule outlined in Annexure-A before possession.
                      </p>
                    </div>

                    {/* Signature Block */}
                    <div className="flex justify-between items-end pt-20 pb-10">
                      <div className="text-center">
                        <div className="w-40 border-t border-slate-800 pt-2 mx-auto"></div>
                        <span className="text-xs font-bold block mt-1">Purchaser Signature</span>
                        <span className="text-[10px] text-slate-500">{buyerName || 'Name'}</span>
                      </div>
                      <div className="text-center relative">
                        {/* Stamp Placeholder */}
                        <div className="absolute -top-12 -left-6 w-24 h-24 border-2 border-red-200 rounded-full flex items-center justify-center opacity-30 transform -rotate-12 pointer-events-none">
                          <span className="text-[8px] font-black text-red-300 uppercase tracking-widest text-center leading-tight">
                            {profile.companyName}<br/>Official Seal
                          </span>
                        </div>
                        <div className="w-48 border-t border-slate-800 pt-2 mx-auto relative z-10"></div>
                        <span className="text-xs font-bold block mt-1">Authorized Signatory</span>
                        <span className="text-[10px] text-slate-500">For {profile.companyName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[500px]">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Select a Property</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                Choose a flat, plot, or villa from the left menu to draft and review its booking agreement. 
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
