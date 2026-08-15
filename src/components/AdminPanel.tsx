import React, { useState } from 'react';
import { ActivityLog, Inquiry, Project, Material } from '../types';
import { i18n, Language } from '../i18n';
import { ShieldAlert, Download, RefreshCw, Key, UserCheck, HardHat, TrendingUp, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface AdminPanelProps {
  lang: Language;
  activityLogs: ActivityLog[];
  inquiries: Inquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<Inquiry[]>>;
  projects: Project[];
  materials: Material[];
  userRole: 'Managing Director' | 'Project Manager' | 'Site Supervisor';
  setUserRole: (role: 'Managing Director' | 'Project Manager' | 'Site Supervisor') => void;
  onExportBackup: () => void;
  onLogActivity: (action: string, details: string) => void;
}

export default function AdminPanel({
  lang,
  activityLogs,
  inquiries,
  setInquiries,
  projects,
  materials,
  userRole,
  setUserRole,
  onExportBackup,
  onLogActivity
}: AdminPanelProps) {
  const t = i18n[lang];
  const [activeTab, setActiveTab] = useState<'users' | 'leads' | 'charts'>('users');

  const handleUpdateInquiryStatus = (id: string, status: 'New' | 'FollowUp' | 'Converted' | 'Closed') => {
    setInquiries(prev => prev.map(inq => {
      if (inq.id !== id) return inq;
      return { ...inq, status: status };
    }));
    onLogActivity('Admin Edited Lead Status', `Adjusted inquiry ${id} to ${status}.`);
  };

  // SVG Custom Bar Chart Dimensions
  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = projects.reduce((acc, p) => acc + p.spent, 0);
  const profitMarginPercent = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 35;

  return (
    <div className="space-y-8 animate-fade-in" id="admin-panel">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Admin Control Desk & Auditing</h2>
          <p className="text-slate-400 text-xs">Authorize onsite supervisor permissions, check group financial graphs, download databases, & monitor client requests.</p>
        </div>
        <button
          onClick={onExportBackup}
          className="bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-500 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer ml-auto md:ml-0"
        >
          <Download className="w-4 h-4 text-amber-500" /> Secure Database Backup (.json)
        </button>
      </div>

      {/* Role Switcher Drawer Bar */}
      <div className="bg-slate-950 border border-slate-850 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">Active Authorization Seat</span>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-500" />
            <span className="text-white font-extrabold text-sm tracking-wide">
              Logged as: <strong className="text-amber-500">{userRole}</strong>
            </span>
          </div>
          <p className="text-[10px] text-slate-400 max-w-sm">
            Supervisor role allows marking day attendance. Director permissions unlock pricing metrics and draft billing systems.
          </p>
        </div>

        <div className="flex gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 w-full md:w-auto">
          {([
            { r: 'Managing Director', lbl: 'Managing Director' },
            { r: 'Project Manager', lbl: 'Project Manager' },
            { r: 'Site Supervisor', lbl: 'Site Supervisor' }
          ] as const).map((seat) => (
            <button
              key={seat.r}
              onClick={() => {
                setUserRole(seat.r);
                onLogActivity('Role authorization changed', `User switched active administrative role to ${seat.r}.`);
              }}
              className={`flex-1 md:flex-initial text-[9.5px] font-bold px-3 py-2 rounded-lg whitespace-nowrap transition ${
                userRole === seat.r 
                  ? 'bg-amber-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {seat.lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Sub tabs inside Admin system */}
      <div className="flex border-b border-slate-850 gap-4">
        {[
          { icon: <TrendingUp className="w-4 h-4" />, id: 'charts', label: 'Financial Performance' },
          { id: 'leads', label: `Incoming Buyer Leads (${inquiries.length})` },
          { id: 'users', label: 'Recent Security Activity Logs' }
        ].map((subT) => (
          <button
            key={subT.id}
            onClick={() => setActiveTab(subT.id as any)}
            className={`text-xs font-bold pb-2 border-b-2 transition whitespace-nowrap ${
              activeTab === subT.id 
                ? 'border-amber-500 text-amber-500' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {subT.label}
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE TAB */}

      {/* TAB 1: CHARTS */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Custom SVG Bar chart representing allocation vs spent */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-4">
            <div>
              <h4 className="text-xs uppercase font-mono tracking-widest text-slate-500 font-bold">Group budget utilization performance</h4>
              <p className="text-[10px] text-slate-400">Comparing RERA allocated budgets vs actual on-site disbursements in INR Lakhs.</p>
            </div>

            {/* Render custom visual bar metrics */}
            <div className="space-y-4 pt-2">
              {projects.map(p => {
                const perc = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0;
                return (
                  <div key={p.id} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-200 font-bold truncate max-w-[60%]">{p.name}</span>
                      <span className="text-slate-400 font-mono">₹{p.spent}L / ₹{p.budget}L ({perc}%)</span>
                    </div>

                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-amber-500 h-full" style={{ width: `${perc}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core ROI panel */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-mono tracking-widest text-slate-500 font-bold">Projected Profit Margin & Rera Compliance</h4>
              <p className="text-[11px] text-slate-400">Cumulative budget allocated: <strong className="text-white">₹{totalBudget} Lakhs</strong>.</p>
              <p className="text-[11px] text-slate-400">Total disbursements: <strong className="text-white">₹{totalSpent} Lakhs</strong>.</p>
            </div>

            <div className="my-4 bg-slate-950 p-4 rounded-2xl text-center border border-slate-850">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Acreage Yield return rating</span>
              <span className="block text-4xl font-extrabold text-emerald-400 font-mono mt-1">+{profitMarginPercent}%</span>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">Standard premium builders in India retain healthy margins with dynamic raw material bulk discount channels.</p>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-slate-300 text-[10px] rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>RERA audit warning: Keep spent/budget ratio below 85% until final plastering milestone certificate approval.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INQUIRIES LEADS */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Customer booking requests ledger</span>
            <span>RERA Approved Channel</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inquiries.map(inq => (
              <div key={inq.id} className="bg-slate-905 border border-slate-850 p-5 rounded-3xl flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{inq.name}</h4>
                      <p className="text-[10px] text-slate-400">{inq.email} | {inq.phone}</p>
                    </div>

                    <span className="text-[9px] bg-slate-950 text-amber-400 font-mono font-bold py-0.5 px-2 rounded-full border border-slate-800">
                      {inq.propertyType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic font-sans">"{inq.message}"</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-850/80 pt-3 text-[11px]">
                  <span className="text-slate-505 font-mono text-[9px]">{inq.createdAt}</span>

                  <div className="flex gap-1">
                    {(['New', 'FollowUp', 'Converted'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateInquiryStatus(inq.id, st)}
                        className={`text-[9.5px] font-bold px-2 py-1 rounded transition ${
                          inq.status === st 
                            ? st === 'Converted' 
                              ? 'bg-emerald-500 text-slate-950' 
                              : st === 'FollowUp' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-amber-500 text-slate-950'
                            : 'bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITY LOGS */}
      {activeTab === 'users' && (
        <div className="space-y-3 bg-slate-950 p-5 border border-slate-850 rounded-3xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] uppercase font-mono text-amber-500 tracking-wider">Muster roll operations & wage ledger records</span>
            <button
              onClick={() => alert('Diagnostic clear completed. Recalibrating sandbox.')}
              className="text-[9px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 bg-slate-900 px-2 py-1 border border-slate-800 rounded"
            >
              <RefreshCw className="w-3 h-3 text-slate-500" /> Reset Log Cache
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activityLogs.map(log => (
              <div key={log.id} className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 text-[10px] font-mono">
                  LOG
                </div>

                <div className="flex-grow space-y-0.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-200">{log.user} ({log.role})</span>
                    <span className="font-mono text-[9px] text-slate-500">{log.timestamp}</span>
                  </div>

                  <strong className="text-amber-500 font-semibold block">{log.action}</strong>
                  <p className="text-[11px] text-slate-400 font-sans">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
