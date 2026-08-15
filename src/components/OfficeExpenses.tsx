import React, { useState, useEffect } from 'react';
import { OfficeExpense, CompanyProfile } from '../types';
import { 
  Plus, Search, Landmark, Receipt, FileText, Download, 
  Trash2, Filter, DollarSign, Wallet, Activity, ArrowDownRight, Coffee
} from 'lucide-react';

interface OfficeExpensesProps {
  expenses: OfficeExpense[];
  setExpenses: React.Dispatch<React.SetStateAction<OfficeExpense[]>>;
  profile: CompanyProfile;
  onLogActivity: (action: string, details: string) => void;
  pettyCashFund: number;
  setPettyCashFund: React.Dispatch<React.SetStateAction<number>>;
}

export default function OfficeExpenses({
  expenses,
  setExpenses,
  profile,
  onLogActivity,
  pettyCashFund,
  setPettyCashFund
}: OfficeExpensesProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Voucher registry form
  const [showAddForm, setShowAddForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [category, setCategory] = useState<OfficeExpense['category']>('Chai & Snacks');
  const [amount, setAmount] = useState<number>(350);
  const [paidTo, setPaidTo] = useState('');
  const [approvedBy, setApprovedBy] = useState(profile.directorName);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<OfficeExpense['paymentMethod']>('Cash');
  
  // Add Cash form
  const [showAddCashForm, setShowAddCashForm] = useState(false);
  const [addCashAmount, setAddCashAmount] = useState<number>(5000);

  useEffect(() => {
    setApprovedBy(profile.directorName);
  }, [profile.directorName]);

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paidTo.trim() || !description.trim() || amount <= 0) {
      alert('Please fill out Paid To, Description, and valid Amount (greater than 0) fields.');
      return;
    }

    if (paymentMethod === 'Cash') {
        const remaining = pettyCashFund - cashSpent;
        if (amount > remaining) {
            alert(`⚠️ Not enough balance in Petty Cash. Remaining: ₹${remaining}`);
            return;
        }
    }

    const newExpense: OfficeExpense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date,
      category,
      amount: Number(amount),
      paidTo,
      approvedBy,
      description,
      paymentMethod,
      receiptAttached: true
    };

    setExpenses(prev => [newExpense, ...prev]);
    onLogActivity('Office Expense Voucher Logged', `Logged ₹${Number(amount)} for "${newExpense.description}" under "${newExpense.category}" categorized list.`);
    
    // Reset Form
    setPaidTo('');
    setDescription('');
    setAmount(150);
    setShowAddForm(false);
    alert('🎉 Voucher saved. Ledger balance updated.');
  };

  const handleAddPettyCash = (e: React.FormEvent) => {
      e.preventDefault();
      if (addCashAmount <= 0) return;

      setPettyCashFund(prev => prev + Number(addCashAmount));
      onLogActivity('Petty Cash Funded', `Added ₹${Number(addCashAmount).toLocaleString('en-IN')} to Petty Cash fund.`);
      setShowAddCashForm(false);
      setAddCashAmount(5000);
      alert('💰 Petty cash fund successfully updated!');
  };

  const handleDeleteVoucher = (id: string, cost: number, desc: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    onLogActivity('Office Expense Voided', `Voided voucher entry: ₹${cost} for ${desc}.`);
  };

  const handleExportCSV = () => {
    const headers = 'Date,Category,Amount(INR),Paid To,Approved By,Description,Payment Method\n';
    const rows = expenses.map(e => 
      `"${e.date}","${e.category}",${e.amount},"${e.paidTo.replace(/"/g, '""')}","${e.approvedBy}","${e.description.replace(/"/g, '""')}","${e.paymentMethod}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Global_Office_Expenses_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    onLogActivity('Exported Expense Report', 'Downloaded CSV ledger sheet for auditing.');
  };

  // Filter rows
  const filtered = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // KPI Computations
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const upiSpent = expenses.filter(e => e.paymentMethod === 'UPI').reduce((sum, e) => sum + e.amount, 0);
  const cashSpent = expenses.filter(e => e.paymentMethod === 'Cash').reduce((sum, e) => sum + e.amount, 0);
  const remainingPettyCash = pettyCashFund - cashSpent;

  return (
    <div className="space-y-8 animate-fade-in text-slate-800" id="office-expenses">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-500" />
            Office Petty Cash & Expenses
          </h2>
          <p className="text-slate-500 text-xs">
            Log physical daily office outflows (chai & snacks bills, site transport petrol vouchers, stationery, contractor lunches).
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setShowAddCashForm(!showAddCashForm)}
            className="flex-1 md:flex-none border border-emerald-300 hover:border-emerald-400 bg-emerald-50 text-emerald-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Wallet className="w-3.5 h-3.5" /> {showAddCashForm ? 'Cancel' : 'Add Cash'}
          </button>
          
          <button 
            onClick={handleExportCSV}
            className="flex-1 md:flex-none border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" /> Export Ledger CSV
          </button>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 md:flex-none bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <Plus className="w-4 h-4 text-white" /> {showAddForm ? 'Close Drawer' : 'Record Chai/Expense Voucher'}
          </button>
        </div>
      </div>

      {/* Aggregate KPI boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-emerald-50 p-4.5 rounded-2xl border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10"><Wallet className="w-24 h-24 text-emerald-700"/></div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-800 block font-black">REMAINING PETTY CASH</span>
          <span className="text-xl font-black text-emerald-950 font-mono block mt-1.5">₹{remainingPettyCash.toLocaleString('en-IN')}</span>
          <span className="text-[9px] text-emerald-700 font-bold">Total funded: ₹{pettyCashFund.toLocaleString('en-IN')}</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block font-bold">CASH IN HAND SPENT</span>
          <span className="text-xl font-black text-orange-600 font-mono block mt-1.5">₹{cashSpent.toLocaleString('en-IN')}</span>
          <span className="text-[9px] text-slate-500">Hand-to-hand hard bills</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block font-bold">UPI / TRANSFERS</span>
          <span className="text-xl font-black text-indigo-600 font-mono block mt-1.5">₹{upiSpent.toLocaleString('en-IN')}</span>
          <span className="text-[9px] text-slate-500">Paid from GPay / PhonePe</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block font-bold">TOTAL OFFICE OUTFLOW</span>
          <span className="text-xl font-black text-slate-900 font-mono block mt-1.5">₹{totalSpent.toLocaleString('en-IN')}</span>
          <span className="text-[9px] text-slate-500">Recorded across all categories</span>
        </div>

      </div>

      {showAddCashForm && (
        <form onSubmit={handleAddPettyCash} className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl space-y-4 max-w-lg mx-auto shadow-inner animate-fade-in">
          <h3 className="text-xs uppercase font-mono tracking-widest text-emerald-800 font-extrabold flex items-center gap-1.5">
            <Wallet className="w-4.5 h-4.5 text-emerald-700" /> Add Funds to Petty Cash
          </h3>
          <div className="flex items-end gap-4">
             <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">Fund Amount (₹) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                  <input
                    type="number"
                    required
                    min="1"
                    value={addCashAmount}
                    onChange={(e) => setAddCashAmount(Number(e.target.value))}
                    className="w-full bg-white border border-emerald-300 focus:border-emerald-500 rounded-lg text-xs py-2 pl-9 pr-3 text-slate-800 font-bold focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2 rounded-xl text-xs transition shadow"
              >
                Inject Cash
              </button>
          </div>
        </form>
      )}

      {/* Register Voucher Box Toggle form */}
      {showAddForm && (
        <form onSubmit={handleCreateVoucher} className="bg-slate-50 border border-slate-200/80 p-6 rounded-3xl space-y-4 max-w-4xl mx-auto shadow-inner">
          <h3 className="text-xs uppercase font-mono tracking-widest text-amber-600 font-extrabold flex items-center gap-1.5">
            <Receipt className="w-4.5 h-4.5 text-amber-600 animate-pulse" /> Register New Office Petty Cash Voucher
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Voucher Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Expenditure Category *</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800"
              >
                <option value="Chai & Snacks">Chai, Water Bottle & Snacks (चाय पानी)</option>
                <option value="Transportation & Petrol">Fuel, Petrol & Auto Vouchers (गाड़ी पेट्रोल)</option>
                <option value="Staff Payroll">Office Staff Salaries & Wages (सैलरी)</option>
                <option value="Office Rent & Bills">Office Broadband, Rent & Electricity (बिजली बिल)</option>
                <option value="Construction Equipment Rental">Site Safety Equipment Rental</option>
                <option value="Stationery & Printing">Stationery, Ledger Books & Printing</option>
                <option value="Taxes & Municipal Fees">Registration, AMC Stamp & Corporation Fees</option>
                <option value="Others">Others Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Voucher Amount (INR ₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Who was paid? (Paid To) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Laxmi Fuel Pump, Patel Chai Point, Munsi Stationery"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Transaction Authorized Person</label>
              <input
                type="text"
                disabled
                value={approvedBy}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg text-xs p-2.5 text-slate-500 font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800 font-mono text-[11px] font-bold"
              >
                <option value="UPI">UPI Transfer (GPAY/BHIM)</option>
                <option value="Cash">Physical Cash</option>
                <option value="Bank Transfer">Direct Bank NEFT / RTGS</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Receipt/Voucher Note Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bought 25 packets of tea and biscuits for site floor supervisors"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800"
              />
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-6 py-2 rounded-xl text-xs transition animate-pulse"
            >
              Record Voucher & Subtract Daily Petty cash
            </button>
          </div>
        </form>
      )}

      {/* Main Ledger ledger layout */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Fiters & search bars */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search description, payee, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-500 focus:outline-none rounded-xl text-xs py-2.5 pl-10 pr-3 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl p-1 w-full md:w-auto overflow-x-auto">
            {['All', 'Chai & Snacks', 'Transportation & Petrol', 'Staff Payroll', 'Office Rent & Bills', 'Taxes & Municipal Fees'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  selectedCategory === cat ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat === 'All' ? 'View All' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* List render */}
        <div className="space-y-3">
          {filtered.map(exp => (
            <div 
              key={exp.id}
              className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition duration-150"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-600 shrink-0">
                  <Receipt className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900">{exp.description}</h4>
                    <span className="text-[8px] font-mono font-black uppercase bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded">
                      {exp.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Paid to: <strong className="text-slate-700 font-extrabold">{exp.paidTo}</strong> • Authorized: {exp.approvedBy} • Method: <strong>{exp.paymentMethod}</strong>
                  </p>
                  <p className="text-[9px] font-mono text-slate-400">Voucher date: {exp.date}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-slate-100/80 md:border-none pt-3 md:pt-0">
                <div className="text-left md:text-right">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">Transaction Value</span>
                  <span className="text-sm font-black font-mono text-amber-600">- ₹{exp.amount.toLocaleString('en-IN')}</span>
                </div>
                <button
                  onClick={() => handleDeleteVoucher(exp.id, exp.amount, exp.description)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Delete Voucher Ledger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-10">
              <FileText className="w-8 h-8 text-slate-300 mx-auto opacity-60" />
              <p className="text-xs text-slate-400 italic mt-2">No matching office voucher records found.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
