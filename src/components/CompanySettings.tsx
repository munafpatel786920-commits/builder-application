import React, { useState, useRef } from 'react';
import { CompanyProfile } from '../types';
import { 
  Building2, User, MapPin, Phone, FileText, Upload, Save, 
  Check, Globe, ShieldAlert, Landmark
} from 'lucide-react';

interface CompanySettingsProps {
  profile: CompanyProfile;
  setProfile: React.Dispatch<React.SetStateAction<CompanyProfile>>;
  onLogActivity: (action: string, details: string) => void;
}

export default function CompanySettings({ 
  profile, 
  setProfile, 
  onLogActivity
}: CompanySettingsProps) {
  // Tabs: 'profile' or 'database'
  const [activeTab, setActiveTab] = useState<'profile' | 'database'>('profile');
  
  // Profile settings state
  const [formData, setFormData] = useState<CompanyProfile>({ ...profile });
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrorStatus(null);
    setSuccessStatus(false);
  };

  // Convert uploaded logo file to Base64 so it persists on local storage beautifully
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorStatus('Logo image size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({
        ...prev,
        logoUrl: base64String
      }));
      setSuccessStatus(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      setErrorStatus('Company Name is required.');
      return;
    }
    if (!formData.directorName.trim()) {
      setErrorStatus('Director / Owner name is required.');
      return;
    }
    if (!formData.phoneNo.trim()) {
      setErrorStatus('Corporate Phone number is required.');
      return;
    }

    // Save changes
    setProfile({ ...formData });

    setSuccessStatus(true);
    setErrorStatus(null);
    
    onLogActivity(
      'Updated Corporate Identity Details',
      `Modified company name to "${formData.companyName}", registered GST under "${formData.gstNo || 'N/A'}" and Director to "${formData.directorName}".`
    );

    // Dynamic banner alert simulation
    setTimeout(() => {
      setSuccessStatus(false);
    }, 5000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800" id="settings-view-panel">
      
      {/* Title Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            Corporate Settings & Cloud sync
          </h2>
          <p className="text-slate-500 text-xs font-semibold">
            Manage your company details and database cloud connections (कंपनी की सेटिंग्स और क्लाउड डेटाबेस सिंक).
          </p>
        </div>
        
        {/* Tab Selection Row */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-sm shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-white text-slate-950 shadow-sm`}
          >
            <Building2 className="w-4 h-4" />
            Company Profile Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Section */}
          <form onSubmit={handleFormSubmit} className="lg:col-span-8 bg-white border border-slate-200/85 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">Company & Director Details Form</h3>
              <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">RERA Compliant Panel</span>
            </div>

            {errorStatus && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorStatus}</span>
              </div>
            )}

            {successStatus && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-inner">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>🎉 Company Profile saved successfully! Changes are updated globally in the header & billing modules.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Company Name */}
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Company Name (कंपनी का नाम) *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="companyName"
                    required
                    placeholder="e.g. Global Construction Group"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:outline-none focus:border-amber-500 rounded-lg text-xs py-2.5 pl-9 pr-3 text-slate-800 font-bold placeholder-slate-400"
                  />
                </div>
              </div>

              {/* GST Number */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">GST Identification Number (GSTIN) *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="gstNo"
                    placeholder="e.g. 24AAACH9231M1Z0"
                    value={formData.gstNo}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:outline-none focus:border-amber-500 rounded-lg text-xs py-2.5 pl-9 pr-3 text-slate-800 font-mono font-bold uppercase placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Corporate Phone Number */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Corporate Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="phoneNo"
                    required
                    placeholder="e.g. +91 94280 11982"
                    value={formData.phoneNo}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:outline-none focus:border-amber-500 rounded-lg text-xs py-2.5 pl-9 pr-3 text-slate-800 font-mono font-bold placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Office Address */}
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Corporate Office Address (कंपनी का पता)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    name="address"
                    rows={2}
                    placeholder="e.g. 708 Empire State Hub, Ring Road, Ahmedabad, Gujarat"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:outline-none focus:border-amber-500 rounded-lg text-xs py-2.5 pl-9 pr-3 text-slate-800 font-semibold placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Director/Owner Name */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Managing Director / Owner Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="directorName"
                    required
                    placeholder="e.g. Munaf Patel"
                    value={formData.directorName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:outline-none focus:border-amber-500 rounded-lg text-xs py-2.5 pl-9 pr-3 text-slate-800 font-extrabold placeholder-slate-400"
                  />
                </div>
              </div>

              {/* State & City */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">State (राज्य)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="state"
                      placeholder="e.g. Gujarat"
                      value={formData.state || ''}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:outline-none focus:border-amber-500 rounded-lg text-xs py-2.5 pl-9 pr-3 text-slate-800 font-semibold placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">City (शहर)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Ahmedabad"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:outline-none focus:border-amber-500 rounded-lg text-xs py-2.5 pl-9 pr-3 text-slate-800 font-semibold placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Corporate Bank Details */}
              <div className="md:col-span-2 border-t border-slate-100 pt-5 mt-2">
                <h4 className="text-[10px] font-black uppercase text-slate-800 mb-4 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-emerald-600" /> Authorized Banking Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      placeholder="e.g. State Bank of India, HDFC Bank"
                      value={formData.bankName || ''}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:outline-none focus:border-amber-500 rounded-lg text-xs py-2.5 px-3 text-slate-800 font-bold placeholder-slate-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Account Number</label>
                    <input
                      type="text"
                      name="accountNo"
                      placeholder="e.g. 10002130324"
                      value={formData.accountNo || ''}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:outline-none focus:border-amber-500 rounded-lg text-xs py-2.5 px-3 text-slate-800 font-mono font-bold placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      name="ifscCode"
                      placeholder="e.g. SBIN000123"
                      value={formData.ifscCode || ''}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:outline-none focus:border-amber-500 rounded-lg text-xs py-2.5 px-3 text-slate-800 font-mono font-bold uppercase placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4 text-slate-950" /> Save Profile Details
              </button>
            </div>
          </form>

          {/* Right Column: Logo Upload & Dynamic Brand Card Preview */}
          <div className="lg:col-span-4 space-y-6">
            {/* Logo Attached Upload Card */}
            <div className="bg-white border border-slate-200/85 p-6 rounded-3xl shadow-sm space-y-4">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-black block tracking-wider">COMPANY LOGO SELECTION</span>
              
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 hover:border-amber-500 hover:bg-slate-100/50 p-6 rounded-2xl text-center transition flex flex-col items-center justify-center relative group min-h-[160px]">
                {formData.logoUrl ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img 
                        src={formData.logoUrl} 
                        alt="Logo Preview" 
                        className="w-20 h-20 object-contain rounded-xl bg-white border border-slate-200 shadow p-1.5"
                      />
                      <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold">Custom logo loaded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto animate-bounce" />
                    <p className="text-[11px] font-bold text-slate-700">Attach Custom Logo File</p>
                    <p className="text-[9px] text-slate-400">Drag & drop or click to upload JPG/PNG. Size &lt; 2MB</p>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Select Logo Image"
                />
              </div>

              {/* Hidden custom file trigger */}
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-center bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 border border-amber-500/20 py-2.5 rounded-xl text-[10px] font-mono font-black tracking-wide uppercase transition hover:scale-101 active:scale-99 cursor-pointer"
                >
                  📎 Attach Logo File
                </button>
              </div>
            </div>

            {/* Real-time Business Letterhead Preview Card */}
            <div className="bg-white border border-slate-200/85 p-6 rounded-3xl shadow-sm space-y-4">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-black block tracking-wider">Letterhead Identity Preview</span>
              
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 text-slate-800 font-sans text-xs space-y-3 relative overflow-hidden shadow-inner font-bold">
                {/* Header inside preview */}
                <div className="flex justify-between items-start gap-3 border-b border-slate-200 pb-2.5">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black uppercase text-slate-950 font-sans">
                      {formData.companyName || 'Global Builder Group'}
                    </h4>
                    <p className="text-[8.5px] text-slate-500 leading-tight font-medium">
                      📍 {formData.address || 'Ahmedabad, Gujarat'}
                    </p>
                    <p className="text-[8px] text-slate-500 font-mono font-semibold">
                      📞 Phone: {formData.phoneNo}
                    </p>
                  </div>
                  {formData.logoUrl ? (
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo preview small" 
                      className="w-8 h-8 object-contain rounded border border-slate-150 p-0.5 bg-white shrink-0" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0">
                      HB
                    </div>
                  )}
                </div>

                {/* Identity fields inside preview */}
                <div className="space-y-2 text-[9px] text-slate-600">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[7.5px] text-slate-500 block uppercase font-bold">MANAGING DIRECTOR</span>
                      <span className="text-slate-950 font-bold block">{formData.directorName}</span>
                    </div>
                    <div>
                      <span className="text-[7.5px] text-slate-500 block uppercase font-bold">STATE & CITY</span>
                      <span className="text-slate-800 font-semibold block leading-tight truncate">{formData.state || 'N/A'}, {formData.city || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-2 rounded-lg flex justify-between items-center text-[8.5px] font-mono shadow-sm">
                    <span className="font-bold text-slate-500">Corporate GSTIN:</span>
                    <strong className="text-slate-900 font-black uppercase">{formData.gstNo || 'UNREGISTERED'}</strong>
                  </div>

                  {/* Bank Preview */}
                  {(formData.bankName || formData.accountNo || formData.ifscCode) && (
                    <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-lg space-y-1.5 shadow-inner">
                      <span className="text-[7.5px] text-slate-500 font-bold uppercase block tracking-wider">A/C Payee Bank Details</span>
                      <div className="flex flex-col gap-0.5 col-span-2">
                        {formData.bankName && <span className="font-bold text-slate-900 font-sans text-[10px] leading-tight">{formData.bankName}</span>}
                        {formData.accountNo && <span className="font-mono text-slate-700 text-[9px]">A/C: <strong className="font-black text-slate-900">{formData.accountNo}</strong></span>}
                        {formData.ifscCode && <span className="font-mono text-slate-700 text-[9px]">IFSC: <strong className="font-black text-slate-900 uppercase">{formData.ifscCode}</strong></span>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-slate-200 pt-1.5 text-center">
                  <span className="text-[7.5px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-300" /> RERA REGISTERED INFRASTRUCTURE, INDIA
                  </span>
                </div>
              </div>
            </div>
          </div>
      </div>

    </div>
  );
}
