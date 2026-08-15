import React, { useState } from 'react';
import { Invoice, Client, Project, CompanyProfile } from '../types';
import { i18n, Language } from '../i18n';
import { Plus, Search, FileText, CheckCircle2, AlertTriangle, FileUp, Download, Eye, X, Receipt, Sparkles, Printer } from 'lucide-react';

interface FinanceBillingProps {
  lang: Language;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  clients: Client[];
  projects: Project[];
  profile: CompanyProfile;
  onLogActivity: (action: string, details: string) => void;
}

export default function FinanceBilling({ lang, invoices, setInvoices, clients, projects, profile, onLogActivity }: FinanceBillingProps) {
  const t = i18n[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // New invoice state
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [baseAmount, setBaseAmount] = useState(500000); // ₹5 Lakhs
  const [dueDate, setDueDate] = useState('2026-06-15');
  const [gstNumber, setGstNumber] = useState('24AAAAB9912C1Z6'); // standard format

  // Details Modal
  const [activePdfInvoice, setActivePdfInvoice] = useState<Invoice | null>(null);

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    
    const client = clients.find(c => c.id === selectedClientId);
    const proj = projects.find(p => p.id === selectedProjectId);

    if (!client || !proj) {
      alert('Ensure you have registered clients and projects first.');
      return;
    }

    const cgst = Number((baseAmount * 0.09).toFixed(2));
    const sgst = Number((baseAmount * 0.09).toFixed(2));
    const totalAmount = Number((baseAmount + cgst + sgst).toFixed(2));

    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `GST-BUILD-2627-${Math.floor(100 + Math.random() * 900)}`,
      clientName: client.name,
      clientId: client.id,
      projectName: proj.name,
      amount: baseAmount,
      cgst: cgst,
      sgst: sgst,
      gstNumber: gstNumber || '24AAACH9231M1Z0',
      totalAmount: totalAmount,
      status: 'Pending',
      dueDate: dueDate,
      createdAt: new Date().toISOString().substring(0, 10)
    };

    setInvoices(prev => [newInv, ...prev]);
    onLogActivity('Generated GST Invoice', `Drafted ${newInv.invoiceNumber} for ${newInv.clientName} of ₹${totalAmount}.`);
    setShowAddForm(false);
    alert(`🎉 GST tax invoice ${newInv.invoiceNumber} generated!`);
  };

  const handleUpdateStatus = (invoiceId: string, status: 'Paid' | 'Pending' | 'Overdue') => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      return { ...inv, status: status };
    }));
    onLogActivity('Invoice Status Edited', `Updated invoice ${invoiceId} status to ${status}.`);
  };

  const filtered = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate Cumulative sums
  const aggregateTaxableAmount = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const aggregateGstCollected = invoices.reduce((acc, inv) => acc + (inv.cgst + inv.sgst), 0);
  const aggregatePaidCount = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.totalAmount, 0);
  const aggregateOutstanding = invoices.filter(i => i.status !== 'Paid').reduce((acc, i) => acc + i.totalAmount, 0);

  return (
    <div className="space-y-8 animate-fade-in text-slate-800" id="finance-billing">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-500" />
            Finance & GST Ledger
          </h2>
          <p className="text-slate-500 text-xs">Generate RERA guidelines compliant construction contract invoices under CGST (9%) + SGST (9%) categories.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-amber-550 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-slate-950" /> {showAddForm ? 'Close Draft Box' : 'Draft GST Bill'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleGenerateInvoice} className="bg-slate-50 border border-slate-205 p-6 rounded-2xl space-y-4 max-w-4xl mx-auto shadow-inner animate-fade-in">
          <h3 className="text-xs uppercase font-mono tracking-widest text-amber-600 font-extrabold">New construction GST tax invoice draft</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Select Client Developer</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-xs text-slate-800"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Select Construction Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-xs text-slate-805"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Taxable Base Amount (INR ₹)</label>
              <input
                type="number"
                value={baseAmount}
                onChange={(e) => setBaseAmount(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-xs text-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Receiver GSTIN Number</label>
              <input
                type="text"
                placeholder="24AAAAB9912C1Z6"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-xs text-slate-800 font-mono uppercase"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white p-4 border border-slate-200 rounded-xl text-xs space-y-1">
            <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Instant Tax Breakdown</span>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">CGST (9.0% Builder services):</span>
              <span className="font-mono text-slate-700 font-bold">₹{(baseAmount * 0.09).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-505 text-slate-500 font-semibold">SGST (9.0% State portion):</span>
              <span className="font-mono text-slate-700 font-bold">₹{(baseAmount * 0.09).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-amber-600 text-sm">
              <span>Total Invoice Amount:</span>
              <span className="font-mono font-black">₹{(baseAmount * 1.18).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs transition shadow-sm"
          >
            Issue Formal Invoice Voucher
          </button>
        </form>
      )}

      {/* Finance Metrics boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Taxable Sales', value: aggregateTaxableAmount },
          { label: 'Aggregate GST Collected', value: aggregateGstCollected },
          { label: 'Realized Earnings', value: aggregatePaidCount, textCls: 'text-emerald-600 bg-emerald-500/5 border-emerald-250' },
          { label: 'Escrow outstanding list', value: aggregateOutstanding, textCls: 'text-amber-700 bg-amber-500/5 border-amber-250' }
        ].map((met, idx) => (
          <div key={idx} className={`bg-white p-5 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition ${met.textCls || ''}`}>
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">{met.label}</span>
            <span className="text-base font-black font-mono block mt-2 text-slate-900">
              ₹{Math.round(met.value).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-450 text-slate-500 font-semibold">CGST (9%) + SGST (9%)</span>
          </div>
        ))}
      </div>

      {/* Invoices List Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Invoice number, Client, Project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:outline-none focus:border-amber-500 rounded-xl text-xs py-2.5 pl-10 pr-3 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 w-full md:w-auto overflow-x-auto">
            {['All', 'Paid', 'Pending', 'Overdue'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  filterStatus === st ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* GST INVOICE TABLE (RESPONSIVE VIEW CARDS) */}
        <div className="space-y-3">
          {filtered.map(inv => (
            <div 
              key={inv.id} 
              className={`bg-white border p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-amber-400 hover:shadow-sm ${
                inv.status === 'Paid' ? 'border-emerald-305 bg-emerald-500/5' : inv.status === 'Overdue' ? 'border-red-305 bg-red-500/5' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-500 shrink-0 font-bold">
                  <Receipt className="w-5 h-5 text-amber-550 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{inv.invoiceNumber}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Client: <strong className="text-slate-800">{inv.clientName}</strong> — <span className="font-semibold text-slate-700">{inv.projectName}</span></p>
                  <p className="text-[9px] font-mono text-slate-400">Receiver GSTIN: {inv.gstNumber}</p>
                </div>
              </div>

              {/* Status Update Block */}
              <div className="flex flex-wrap items-center gap-4 justify-between border-t border-slate-100 md:border-none pt-3 md:pt-0">
                <div className="text-left md:text-right">
                  <span className="text-[9px] uppercase font-mono block text-slate-400">Tax Invoice Value</span>
                  <span className="text-sm font-black font-mono text-amber-600">₹{inv.totalAmount.toLocaleString('en-IN')}</span>
                  <span className="block text-[8px] text-slate-400 font-mono">Due on {inv.dueDate}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 p-1 border border-slate-200 rounded-lg">
                  {(['Paid', 'Pending', 'Overdue'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(inv.id, status)}
                      className={`text-[9.5px] font-extrabold px-2.5 py-1.5 rounded-lg transition ${
                        inv.status === status 
                          ? status === 'Paid' 
                            ? 'bg-emerald-500 text-white font-black shadow-sm' 
                            : status === 'Overdue' 
                            ? 'bg-red-500 text-white font-black shadow-sm' 
                            : 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setActivePdfInvoice(inv)}
                  className="bg-white hover:bg-slate-50 text-amber-650 text-amber-600 font-black p-2.5 rounded-xl text-xs flex items-center gap-1.5 shrink-0 border border-slate-300 transition shadow-sm hover:border-amber-500/50"
                  title="Print Preview / Tax Invoice Voucher"
                >
                  <Eye className="w-4 h-4 text-amber-500" /> Preview Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RENDER DYNAMIC COMPLIANT COMMERCIAL TAX INVOICE PRINT-MODAL */}
      {activePdfInvoice && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 overflow-y-auto p-4 flex items-center justify-center animate-fade-in" id="pdf-invoice-modal">
          <div className="bg-white text-slate-950 rounded-3xl max-w-2xl w-full p-6 md:p-10 space-y-6 relative border border-slate-300 shadow-2xl">
            <button
              onClick={() => setActivePdfInvoice(null)}
              className="absolute top-6 right-6 text-slate-600 hover:text-slate-950 bg-slate-100 p-2 rounded-full border border-slate-300 transition hover:bg-slate-200"
            >
              <X className="w-5 h-5 text-slate-800" />
            </button>

            {/* Header Stamp */}
            <div className="flex justify-between items-start border-b border-slate-300 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-black text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-300 rounded-md">
                  Tax invoice of Builder & Developer Works (CGST+SGST Approved)
                </span>
                <div className="flex items-center gap-2 mt-2">
                  {profile.logoUrl ? (
                    <img src={profile.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded border border-slate-200" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10.5px]">HB</div>
                  )}
                  <h3 className="text-xl font-black font-serif text-slate-950 uppercase">{profile.companyName}</h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  {profile.address || 'Ahmedabad, Gujarat, India'}<br />
                  RERA Reg: {profile.state?.substring(0, 2).toUpperCase() || 'GJ'}-{profile.city?.substring(0, 6).toUpperCase() || 'SANAND'}-A1M | GSTIN: <span className="font-mono font-bold uppercase text-slate-800">{profile.gstNo}</span>
                </p>
              </div>
              
              <div className="text-right space-y-1">
                <Printer className="w-6 h-6 text-slate-700 ml-auto hidden md:block" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block font-bold">Tax Receipt</span>
                <span className="font-mono text-sm font-black text-slate-805">{activePdfInvoice.invoiceNumber}</span>
                <span className="block text-[11px] text-slate-500">Date: {activePdfInvoice.createdAt}</span>
              </div>
            </div>

            {/* Client address bill to */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold">Consignee Billing Details</span>
                <p className="font-extrabold text-slate-900 mt-1">{activePdfInvoice.clientName}</p>
                <p className="text-slate-500 mt-0.5">Assigned site: {activePdfInvoice.projectName}</p>
                <p className="font-mono text-[10px] text-amber-600 mt-1.5 font-bold">GSTIN: {activePdfInvoice.gstNumber}</p>
              </div>

              <div className="p-4 border border-slate-200 rounded-2xl">
                <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold">Payment Terms & Sac Reference</span>
                <p className="font-bold text-slate-800 mt-1">Due on: {activePdfInvoice.dueDate}</p>
                <p className="text-slate-500 mt-0.5">SAC Code: 9954 (Construction Services)</p>
                <p className="font-bold text-slate-705 mt-1.5">Payment State: <span className="uppercase text-[9px] font-mono tracking-widest bg-emerald-100 text-emerald-800 py-0.5 px-2 rounded font-black border border-emerald-200">{activePdfInvoice.status}</span></p>
              </div>
            </div>

            {/* Tax items breakdown */}
            <div className="border border-slate-300 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-250">
                    <th className="p-3">Reference description</th>
                    <th className="p-3 font-mono text-right">Taxable Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-3">
                      <strong className="text-slate-900 block">Superstructure civil casting & remodeling work contract</strong>
                      <span className="text-[10px] text-slate-400 font-semibold">{activePdfInvoice.projectName}</span>
                    </td>
                    <td className="p-3 font-mono text-right">₹{activePdfInvoice.amount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-500">Add CGST @ 9.0% (SAC Code 9954)</td>
                    <td className="p-3 font-mono text-right text-slate-700">₹{activePdfInvoice.cgst.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-500">Add SGST @ 9.0% (SAC Code 9954)</td>
                    <td className="p-3 font-mono text-right text-slate-700">₹{activePdfInvoice.sgst.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-sm">
                    <td className="p-3 text-slate-800 font-extrabold">Aggregate Payable Invoice Total</td>
                    <td className="p-3 font-mono text-right text-slate-900 text-base font-black">₹{activePdfInvoice.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Stamp signature bottom */}
            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-3">
              <p className="font-mono">Checked under standard Input Tax Credit regulations in India.</p>
              <div className="text-center w-40">
                <div className="h-10 border-b border-dashed border-slate-300 mb-1" />
                <span className="font-bold text-slate-800 uppercase block font-mono">Authorised Signatory</span>
                <span className="block text-[9px] text-slate-500 font-bold">({profile.directorName})</span>
                <span className="text-[8px] uppercase tracking-wide bg-amber-500/10 text-amber-700 py-0.5 px-2 rounded mt-1 font-bold block">RERA Approved Group</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Tax receipt printed successfully! A sandbox copy was saved locally.');
                setActivePdfInvoice(null);
              }}
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
            >
              <Download className="w-4 h-4 text-white" /> Download Certified PDF Bill
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
