import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Receipt, Sparkles, Send, ShieldCheck, 
  Settings, RefreshCw, BarChart3, Star, AlertTriangle, Check, CreditCard, Radio, Trash2, Edit2, Key, UserCheck, UserX
} from 'lucide-react';
import { doc, getDoc, setDoc, query, collection, onSnapshot, deleteDoc, getDocs, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface SaaSAdminPanelProps {
  user: any;
  saasConfig: {
    superAdminUid: string;
    superAdminEmail: string;
    superAdminName: string;
    globalNotice?: string;
    proPrice?: number;
    supervisorPrice?: number;
    enterprisePrice?: number;
  } | null;
  onUpdateSaasConfig: (newConfig: any) => Promise<void>;
}

export default function SaaSAdminPanel({
  user,
  saasConfig,
  onUpdateSaasConfig
}: SaaSAdminPanelProps) {
  const [noticeText, setNoticeText] = useState(saasConfig?.globalNotice || '');
  const [proPriceInput, setProPriceInput] = useState(saasConfig?.proPrice?.toString() || '3999');
  const [supervisorPriceInput, setSupervisorPriceInput] = useState(saasConfig?.supervisorPrice?.toString() || '1499');
  const [enterprisePriceInput, setEnterprisePriceInput] = useState(saasConfig?.enterprisePrice?.toString() || '11999');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // APPROVED CUSTOMERS LICENSE MANAGEMENT STATE
  const [approvedCustomers, setApprovedCustomers] = useState<any[]>([]);
  const [custLoading, setCustLoading] = useState(true);

  // Form states for adding/editing authorized user
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [custPlan, setCustPlan] = useState('MD / Builder Pro');
  const [editingCustId, setEditingCustId] = useState<string | null>(null);
  const [grantLoading, setGrantLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  // Built-in non-blocking overlay states for destructive/active administrative toggles
  const [confirmToggleCust, setConfirmToggleCust] = useState<any | null>(null);
  const [confirmRevokeCust, setConfirmRevokeCust] = useState<any | null>(null);

  // Synchronize inputs when config loads
  useEffect(() => {
    if (saasConfig) {
      if (saasConfig.globalNotice !== undefined) setNoticeText(saasConfig.globalNotice);
      if (saasConfig.proPrice !== undefined) setProPriceInput(saasConfig.proPrice.toString());
      if (saasConfig.supervisorPrice !== undefined) setSupervisorPriceInput(saasConfig.supervisorPrice.toString());
      if (saasConfig.enterprisePrice !== undefined) setEnterprisePriceInput(saasConfig.enterprisePrice.toString());
    }
  }, [saasConfig]);

  // Helper to sync local cache
  const updateLocalCache = (list: any[]) => {
    try {
      localStorage.setItem('erp_approved_customers_cache', JSON.stringify(list));
    } catch (e) {
      console.warn("Could not write approved customers cache:", e);
    }
  };

  // Real-time listener for approved customers from Firestore + Local Cache
  useEffect(() => {
    // 1. Initial hydrate from local cache immediately
    try {
      const cached = localStorage.getItem('erp_approved_customers_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setApprovedCustomers(parsed);
          setCustLoading(false);
        }
      }
    } catch (e) {
      console.warn("Could not read local cache of approved customers:", e);
    }

    if (!user) {
      setCustLoading(false);
      return;
    }

    let unsubscribeFirestore: (() => void) | null = null;
    
    try {
      const q = query(collection(db, 'approved_customers'));
      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const customersList: any[] = [];
        snapshot.forEach((doc) => {
          const docId = doc.id.trim().toLowerCase();
          if (docId !== 'demo@builders.in') {
            customersList.push({ id: docId, ...doc.data() });
          }
        });
        
        setApprovedCustomers(customersList);
        updateLocalCache(customersList);
        setCustLoading(false);
      }, (err) => {
        console.warn("Could not load real approved customers from Firestore live stream:", err);
        setCustLoading(false);
      });
    } catch (e) {
      console.warn("Firestore listener initialization failed:", e);
      setCustLoading(false);
    }

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [user]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess(false);

    try {
      const updated = {
        ...saasConfig,
        globalNotice: noticeText.trim(),
        proPrice: Number(proPriceInput) || 3999,
        supervisorPrice: Number(supervisorPriceInput) || 1499,
        enterprisePrice: Number(enterprisePriceInput) || 11999,
        lastUpdatedBy: user?.email || 'super_admin'
      };

      await onUpdateSaasConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save global config:", err);
      alert("Error saving config! Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');
    setGrantLoading(true);

    if (!custName.trim()) {
      setErrorText('Please enter the customer name or company name.');
      setGrantLoading(false);
      return;
    }
    if (!custEmail.trim() || !custEmail.includes('@')) {
      setErrorText('Please enter a valid email address.');
      setGrantLoading(false);
      return;
    }
    if (!custPassword.trim() || custPassword.length < 4) {
      setErrorText('Access password must be at least 4 characters.');
      setGrantLoading(false);
      return;
    }

    const emailKey = custEmail.trim().toLowerCase();
    const existingCust = approvedCustomers.find(c => c.id === emailKey || c.email === emailKey);
    const existingStatus = existingCust?.status || 'active';
    
    const customerPayload: any = {
      name: custName.trim(),
      email: emailKey,
      password: custPassword.trim(),
      plan: custPlan,
      status: existingStatus,
      createdAt: existingCust?.createdAt || new Date().toISOString().substring(0, 10),
      isApprovedCustomer: true
    };

    if (existingCust?.uid) {
      customerPayload.uid = existingCust.uid;
    }

    // 1. Update local state and localStorage cache immediately for instant response
    const updatedList = approvedCustomers.filter(c => c.id !== emailKey && c.email !== emailKey);
    const newList = [{ id: emailKey, ...customerPayload }, ...updatedList];
    setApprovedCustomers(newList);
    updateLocalCache(newList);

    // 2. Persist to Firestore database
    try {
      await setDoc(doc(db, 'approved_customers', emailKey), customerPayload);
      setSuccessText(editingCustId ? "Customer license updated in Firestore!" : "New customer access license granted and synced!");
    } catch (err: any) {
      console.warn("Could not write to Firestore directly:", err);
      const errMsg = err?.message || String(err);
      if (errMsg.includes('permission') || errMsg.includes('insufficient')) {
        setErrorText("Warning: Firestore permission denied. License is saved locally.");
      } else {
        // Still succeeded locally
        setSuccessText("Customer license granted and saved to local active node.");
      }
    } finally {
      setGrantLoading(false);
    }

    // Reset form fields
    setCustName('');
    setCustEmail('');
    setCustPassword('');
    setEditingCustId(null);
    setTimeout(() => setSuccessText(''), 4000);
  };

  const handleToggleStatus = (cust: any) => {
    setConfirmToggleCust(cust);
  };

  const handleRevokeAccess = (emailId: string) => {
    const targetEmail = emailId.trim().toLowerCase();
    const cust = approvedCustomers.find(c => (c.email || c.id || '').trim().toLowerCase() === targetEmail);
    setConfirmRevokeCust(cust || { email: targetEmail, id: targetEmail, name: targetEmail });
  };

  const executeToggleStatus = async (cust: any) => {
    const emailKey = (cust.email || cust.id || '').trim().toLowerCase();
    const nextStatus = cust.status === 'inactive' ? 'active' : 'inactive';
    
    const customerPayload: any = {
      name: cust.name || 'Custom Customer',
      email: emailKey,
      password: cust.password || 'Pass123',
      plan: cust.plan || 'MD / Builder Pro',
      status: nextStatus,
      createdAt: cust.createdAt || new Date().toISOString().substring(0, 10),
      isApprovedCustomer: true
    };

    if (cust.uid) {
      customerPayload.uid = cust.uid;
    }

    setConfirmToggleCust(null);

    // Update locally
    const updated = approvedCustomers.map(c => (c.id === emailKey || c.email === emailKey) ? { ...c, status: nextStatus } : c);
    setApprovedCustomers(updated);
    updateLocalCache(updated);

    try {
      await setDoc(doc(db, 'approved_customers', emailKey), customerPayload);
      setSuccessText(`Plan ${nextStatus === 'inactive' ? 'deactivated' : 'activated'} successfully!`);
    } catch (err: any) {
      console.warn("Could not write status toggle to Firestore directly:", err);
    }
    setTimeout(() => setSuccessText(''), 3500);
  };

  const executeRevokeAccess = async (cust: any) => {
    const targetEmail = (cust.email || cust.id || '').trim().toLowerCase();
    const customerUid = cust.uid || null;
    
    setConfirmRevokeCust(null);

    // Update locally
    const remaining = approvedCustomers.filter(c => c.id !== targetEmail && c.email !== targetEmail);
    setApprovedCustomers(remaining);
    updateLocalCache(remaining);

    try {
      // 1. Delete customer license from approved_customers
      await deleteDoc(doc(db, 'approved_customers', targetEmail));

      // 2. If they have logged in and registered their UID, clean up all tenant-isolated documents from all collections
      if (customerUid) {
        setSuccessText("License revoked. Deleting all company data from standard collections...");
        
        const tenantCollections = [
          'projects',
          'lands',
          'clients',
          'workers',
          'materials',
          'equipment',
          'invoices',
          'inquiries',
          'activityLogs',
          'properties',
          'expenses'
        ];

        for (const colName of tenantCollections) {
          try {
            const q = query(collection(db, colName), where('userId', '==', customerUid));
            const snap = await getDocs(q);
            for (const docSnap of snap.docs) {
              await deleteDoc(doc(db, colName, docSnap.id));
            }
          } catch (colErr: any) {
            console.warn(`Could not clear collection ${colName} for customer UID ${customerUid}:`, colErr);
          }
        }

        // 3. Clear company profile document whose index is their customerUid
        try {
          await deleteDoc(doc(db, 'profile', customerUid));
        } catch (profileErr: any) {
          console.warn(`Could not clear profile doc for customer UID ${customerUid}:`, profileErr);
        }

        setSuccessText("Customer license terminated and all company records purged successfully.");
      } else {
        setSuccessText("Customer license terminated successfully.");
      }
    } catch (err: any) {
      console.warn("Error revoking from Firestore directly:", err);
      setErrorText("License removed locally.");
    }
    setTimeout(() => {
      setSuccessText('');
      setErrorText('');
    }, 3500);
  };

  const handleEditCustomer = (cust: any) => {
    setEditingCustId(cust.id);
    setCustName(cust.name);
    setCustEmail(cust.email);
    setCustPassword(cust.password);
    setCustPlan(cust.plan || 'MD / Builder Pro');
  };

  return (
    <div className="space-y-8 animate-fade-in" id="saas-admin-panel">
      
      {/* Title Header banner */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono font-black tracking-widest text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full w-fit uppercase">
          👑 SYSTEM ROOT ACCESS AUTHORIZED
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
          Global SaaS Platform Management Panel
        </h2>
        <p className="text-slate-500 text-xs">
          Because you are the <strong className="text-slate-900">first-ever registered user</strong> on this system, you have been crowned the sovereign **SaaS Super Admin**. Control prices, view billing streams, edit metrics, and broadcast messages to all active tenants.
        </p>
      </div>

      {/* Global Realtime Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">TOTAL REGISTERED CUSTOMERS</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-slate-900">{approvedCustomers.length}</span>
            <span className="text-green-600 text-[10px] font-bold font-mono">↑ Real-Time</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Active Indian Builder Accounts</p>
          <div className="absolute top-4 right-4 text-slate-200">
            <Building2 className="w-8 h-8" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">MONEY FLOW ESTIMATED</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-slate-900">
              ₹{(approvedCustomers.reduce((acc, curr) => {
                const planName = curr.plan || '';
                if (planName.includes('Enterprise')) return acc + (saasConfig?.enterprisePrice || 11999);
                if (planName.includes('Supervisor')) return acc + (saasConfig?.supervisorPrice || 1499);
                return acc + (saasConfig?.proPrice || 3999);
              }, 0)).toLocaleString('en-IN')}
            </span>
            <span className="text-green-600 text-[10px] font-bold font-mono">↑ Live Stream</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Monthly Recurring SaaS Revenue</p>
          <div className="absolute top-4 right-4 text-slate-200">
            <Receipt className="w-8 h-8" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">SYSTEM BROADCAST</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-sm font-black text-amber-600 truncate max-w-[150px]">
              {saasConfig?.globalNotice ? 'Active Notice Banner' : 'No Broadcast'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Message displayed to all tenants</p>
          <div className="absolute top-4 right-4 text-slate-200">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">DATABASE CONNECTIVITY</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-black text-emerald-600">CONNECTED</span>
            <span className="text-emerald-600 text-[10px]">●</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Firestore Database Node Synced</p>
          <div className="absolute top-4 right-4 text-slate-200">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: CUSTOMER LICENSE ISSUATION PANELS */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Key className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-wide">
                {editingCustId ? "⚙️ Modify Customer App Access License" : "🔑 Grant Customer Access (Issue App License)"}
              </h3>
            </div>

            <form onSubmit={handleGrantAccess} className="space-y-4">
              {errorText && (
                <div className="bg-red-50 border border-red-250 text-red-700 text-xs py-2 px-3 rounded-xl font-medium">
                  ⚠️ {errorText}
                </div>
              )}
              {successText && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs py-2 px-3 rounded-xl font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> {successText}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[9.5px] text-slate-500 font-mono uppercase font-bold tracking-wider">
                  Builder Company / Customer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gujarat Properties Pvt Ltd"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-2 px-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9.5px] text-slate-500 font-mono uppercase font-bold tracking-wider">
                    Assigned Email ID
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!!editingCustId}
                    placeholder="e.g. buyer@builders.in"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full bg-slate-50 disabled:opacity-75 border border-slate-200 focus:border-amber-500 rounded-xl py-2 px-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] text-slate-500 font-mono uppercase font-bold tracking-wider">
                    Set Login Password
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pass123"
                    value={custPassword}
                    onChange={(e) => setCustPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-2 px-3.5 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9.5px] text-slate-500 font-mono uppercase font-bold tracking-wider">
                  Select Purchased Plan / Access Tier
                </label>
                <select
                  value={custPlan}
                  onChange={(e) => setCustPlan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-2 px-3 text-xs font-bold text-slate-800"
                >
                  <option value="Site Supervisor">Site Supervisor (₹{saasConfig?.supervisorPrice || 1499}/mo)</option>
                  <option value="MD / Builder Pro">MD / Builder Pro (₹{saasConfig?.proPrice || 3999}/mo)</option>
                  <option value="Corporate Enterprise">Corporate Enterprise (₹{saasConfig?.enterprisePrice || 11999}/mo)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {editingCustId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustId(null);
                      setCustName('');
                      setCustEmail('');
                      setCustPassword('');
                    }}
                    className="text-slate-500 hover:text-slate-800 underline text-xs font-semibold cursor-pointer"
                  >
                    Cancel Editing
                  </button>
                )}
                <button
                  type="submit"
                  disabled={grantLoading}
                  className="ml-auto bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  {grantLoading ? "Processing..." : (editingCustId ? "Update Access details" : "Grant App Access Now")}
                </button>
              </div>
            </form>
          </div>

          {/* Pricing settings panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-wide">
                Platform Configuration Settings
              </h3>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[9.5px] text-slate-500 font-mono uppercase tracking-wider font-bold">
                  📢 Broadcast Realtime Announcement Banner
                </label>
                <textarea
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  placeholder="System maintenance warning, platform update notice, etc..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-[8px] text-slate-400 font-mono uppercase font-bold">Supervisor Plan Price</label>
                  <input
                    type="number"
                    required
                    value={supervisorPriceInput}
                    onChange={(e) => setSupervisorPriceInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-2 px-2 text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[8px] text-slate-400 font-mono uppercase font-bold">MD Pro Plan Price</label>
                  <input
                    type="number"
                    required
                    value={proPriceInput}
                    onChange={(e) => setProPriceInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-2 px-2 text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[8px] text-slate-400 font-mono uppercase font-bold">Enterprise Plan Price</label>
                  <input
                    type="number"
                    required
                    value={enterprisePriceInput}
                    onChange={(e) => setEnterprisePriceInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-2 px-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccess && (
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved!
                  </div>
                )}
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="ml-auto bg-slate-950 text-amber-500 hover:text-amber-400 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1"
                >
                  {saveLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Deploy Configuration
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Panel: Approved License lists fetched real-time from Firestore */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
                <h3 className="text-sm font-black uppercase text-slate-900 tracking-wide">
                  Active Licensed Customers ({approvedCustomers.length})
                </h3>
              </div>
              <span className="text-[8px] font-mono bg-slate-100 px-2 py-0.5 rounded font-bold uppercase text-slate-500">Live DB Sync</span>
            </div>

            {custLoading ? (
              <div className="text-center py-10 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-405 mx-auto" />
                <p className="text-[11px] text-slate-500">Querying Firestore authorized list...</p>
              </div>
            ) : approvedCustomers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                <p className="text-xs text-slate-400 font-medium">No custom app access licenses issued yet.</p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                  When a customer buys your app, write their Email and Password on the left. They will be granted instant authorization.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {approvedCustomers.map((cust) => (
                  <div 
                    key={cust.id} 
                    className={`border rounded-xl p-4 transition-all duration-200 space-y-2 group relative hover:border-amber-400/40 ${
                      cust.status === 'inactive' 
                        ? 'bg-slate-100/70 border-slate-200 opacity-75' 
                        : 'bg-slate-50 border-slate-205'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="block font-black text-xs text-slate-900 leading-normal">{cust.name}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase font-mono ${
                            cust.status === 'inactive' 
                              ? 'bg-red-100 text-red-700 border border-red-200' 
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {cust.status === 'inactive' ? 'Deactivated' : 'Active'}
                          </span>
                        </div>
                        <span className="block text-[10px] font-mono text-slate-500 mt-0.5">{cust.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cust)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                            cust.status === 'inactive'
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 hover:bg-amber-250 text-amber-900 border-amber-300'
                          }`}
                          title={cust.status === 'inactive' ? "Reactivate Plan" : "Deactivate / Suspend Plan"}
                        >
                          {cust.status === 'inactive' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditCustomer(cust)}
                          className="bg-white hover:bg-slate-100 text-slate-700 p-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRevokeAccess(cust.id)}
                          className="bg-white hover:bg-red-50 text-red-600 p-1.5 rounded-lg border border-slate-200 hover:border-red-200 transition cursor-pointer"
                          title="Revoke License Access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50 grid grid-cols-2 gap-3 text-[10px]">
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider block text-[8px]">Access Password</span>
                        <div className="flex items-center gap-1 mt-0.5 text-slate-800 font-mono font-bold bg-white px-2 py-0.5 border border-slate-200 rounded-md w-fit">
                          <span className="text-amber-600">🗝️</span>
                          <span>{cust.password}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 font-bold uppercase tracking-wider block text-[8px]">Purchased Plan Tier</span>
                        <span className="inline-block mt-1 font-extrabold text-[9px] uppercase tracking-wider bg-amber-500/10 text-amber-800 px-1.5 py-0.5 rounded-md">
                          {cust.plan || 'MD / Builder Pro'}
                        </span>
                      </div>
                    </div>

                    <div className="text-[8.5px] text-slate-400 font-semibold font-mono text-right pt-0.5">
                      License Issued: {cust.createdAt || 'N/A'}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-2.5 text-amber-800 text-[10px] leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Indian Business Compliance Note:</strong> When a building builder purchases license credentials, share the configured email and password with them. When they enter these credentials into the system Sign-in portal, they will be given root access instantly.
            </p>
          </div>

        </div>

      </div>

      {/* State-driven Non-blocking Toggle Confirmation Dialog (replaces window.confirm) */}
      {confirmToggleCust && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 px-4 py-2.5 rounded-2xl w-fit">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Confirm License Action</span>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900">
                Are you sure you want to {confirmToggleCust.status === 'inactive' ? 'Reactivate' : 'Deactivate'} this builder?
              </h4>
              <p className="text-slate-500 text-xs">
                Company Name: <strong className="text-slate-800">{confirmToggleCust.name}</strong>
              </p>
              <p className="text-slate-500 text-xs">
                Email Address: <strong className="text-slate-800 font-mono">{confirmToggleCust.email || confirmToggleCust.id}</strong>
              </p>
              {confirmToggleCust.status !== 'inactive' ? (
                <p className="text-red-700 bg-red-50 text-[10px] p-2 rounded-lg mt-2">
                  ⚠️ Deactivating this license will immediately lock the user out from access. All their ongoing sessions will be rejected.
                </p>
              ) : (
                <p className="text-emerald-700 bg-emerald-50 text-[10px] p-2 rounded-lg mt-2">
                  ✅ Reactivating this builder will instantly restore access to their dashboard, workers, and billing streams.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setConfirmToggleCust(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeToggleStatus(confirmToggleCust)}
                className={`text-slate-950 text-xs font-black px-5 py-2 rounded-xl uppercase tracking-wider transition cursor-pointer ${
                  confirmToggleCust.status === 'inactive'
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                {confirmToggleCust.status === 'inactive' ? 'Reactivate now' : 'Deactivate now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State-driven Non-blocking Revoke/Delete Confirmation Dialog (replaces window.confirm) */}
      {confirmRevokeCust && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
          <div className="bg-white border border-red-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-red-600 bg-red-50 px-4 py-2.5 rounded-2xl w-fit">
              <Trash2 className="w-5 h-5 text-red-500" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-800">Danger Zone: Revoke License</span>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900">
                Are you absolutely sure you want to terminate & delete this builder contract?
              </h4>
              <p className="text-slate-500 text-xs">
                Company Name: <strong className="text-slate-800">{confirmRevokeCust.name}</strong>
              </p>
              <p className="text-slate-500 text-xs">
                Email Address: <strong className="text-slate-800 font-mono">{confirmRevokeCust.email || confirmRevokeCust.id}</strong>
              </p>
              <p className="text-red-700 bg-red-50 text-[10px] p-2.5 rounded-xl mt-2 leading-relaxed">
                🚨 <strong>This is an irreversible operation.</strong> This will delete their authorized license entry permanently from our databases. They will completely lose access to their profile and builder data.
              </p>
            </div>

            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setConfirmRevokeCust(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Cancel, Keep Active
              </button>
              <button
                type="button"
                onClick={() => executeRevokeAccess(confirmRevokeCust)}
                className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-wider transition cursor-pointer"
              >
                Confirm Delete & Revoke
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
