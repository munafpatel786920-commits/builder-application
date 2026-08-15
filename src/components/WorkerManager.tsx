import React, { useState } from 'react';
import { Worker, Project } from '../types';
import { i18n, Language } from '../i18n';
import { Plus, Search, Calendar, User, HardHat, Phone, CheckCircle2, AlertTriangle, Check, DollarSign, Wallet } from 'lucide-react';

interface WorkerManagerProps {
  lang: Language;
  workers: Worker[];
  setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
  projects: Project[];
  onLogActivity: (action: string, details: string) => void;
}

export default function WorkerManager({ lang, workers, setWorkers, projects, onLogActivity }: WorkerManagerProps) {
  const t = i18n[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().substring(0, 10));
  
  // New Worker States
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Mason' | 'Laborer' | 'Carpenter' | 'Plumber' | 'Electrician' | 'Supervisor' | 'Subcontractor'>('Mason');
  const [phone, setPhone] = useState('');
  const [dailyWage, setDailyWage] = useState(650);
  const [assignedProjectId, setAssignedProjectId] = useState(projects[0]?.id || '');

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Fill out Worker Roster Name and phone details.');
      return;
    }

    const matchedProject = projects.find(p => p.id === assignedProjectId);

    const newWorker: Worker = {
      id: `worker-${Date.now()}`,
      name: name,
      role: role,
      phone: phone,
      dailyWage: Number(dailyWage),
      assignedProjectId: assignedProjectId,
      assignedProjectName: matchedProject ? matchedProject.name : 'Unassigned Site',
      completedTasks: 0,
      totalAttendance: 1,
      attendance: {
        [attendanceDate]: 'Present'
      }
    };

    setWorkers(prev => [newWorker, ...prev]);
    onLogActivity('Added Worker to Roster', `Registered ${name} (${role}) assigned to ${newWorker.assignedProjectName}.`);

    setName('');
    setPhone('');
    setDailyWage(650);
    setShowAddForm(false);
    alert('🎉 Registered successfully under Global Builder Group labor roster.');
  };

  const handleMarkAttendance = (workerId: string, status: 'Present' | 'Absent' | 'Half-Day') => {
    setWorkers(prev => prev.map(w => {
      if (w.id !== workerId) return w;
      
      const nextAttendance = { ...w.attendance, [attendanceDate]: status };

      // Re-sum total attendance count
      let attendanceSum = 0;
      Object.values(nextAttendance).forEach(v => {
        if (v === 'Present') attendanceSum += 1;
        if (v === 'Half-Day') attendanceSum += 0.5;
      });

      return {
        ...w,
        attendance: nextAttendance,
        totalAttendance: attendanceSum
      };
    }));
  };

  const handleDisburseWages = () => {
    let totalsDisbursed = 0;
    let counts = 0;
    
    workers.forEach(w => {
      const dayStatus = w.attendance[attendanceDate];
      if (dayStatus === 'Present') {
        totalsDisbursed += w.dailyWage;
        counts++;
      } else if (dayStatus === 'Half-Day') {
        totalsDisbursed += (w.dailyWage / 2);
        counts++;
      }
    });

    if (totalsDisbursed === 0) {
      alert('No active wages found. Confirm attendance has been marked "Present" or "Half-Day" for the selected date.');
      return;
    }

    // Fire simulated UPI direct batch transfer to Indian banks
    alert(`⚡ UPI Batch Transfer Successful!\n\nDisbursed ₹${totalsDisbursed.toLocaleString('en-IN')} total wages to ${counts} site workers/subcontractors verified on ${attendanceDate} via IMPS sandbox.`);
    onLogActivity('Disbursed Worker Daily Wages', `Paid ₹${totalsDisbursed} to ${counts} labor accounts for date ${attendanceDate}.`);
  };

  const filtered = workers.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.phone.includes(searchTerm);
    const matchesRole = selectedRole === 'All' || w.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-fade-in text-slate-800" id="worker-manager">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <HardHat className="w-6 h-6 text-amber-500" />
            Labor & Subcontractor Roster
          </h2>
          <p className="text-slate-500 text-xs">Verify daily muster roll, log attendance, and compute wages based on skill tiers.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white border border-slate-300 hover:border-amber-500 hover:text-amber-600 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-amber-500" /> {showAddForm ? 'Close Roster Form' : 'Register Onsite Labor'}
        </button>
      </div>

      {/* Roster form - styled with elegant light slate layout */}
      {showAddForm && (
        <form onSubmit={handleAddWorker} className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-4 max-w-4xl mx-auto shadow-inner animate-fade-in">
          <h3 className="text-xs uppercase font-mono tracking-widest text-amber-600 font-black">Register site worker profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Worker / Subcontractor Name *</label>
              <input
                type="text"
                required
                placeholder="Gangaram Chaudhary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-505 block mb-1">Verified Mobile (UPI Linked) *</label>
              <input
                type="text"
                required
                placeholder="+91 88990 11223"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Skill Tier Role</label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-850"
              >
                <option value="Laborer">Unskilled Laborer (Beldaar)</option>
                <option value="Mason">Skilled Mason (Rajmistri)</option>
                <option value="Carpenter">Carpenter (Suthar)</option>
                <option value="Plumber">Plumber (Nal Saaz)</option>
                <option value="Electrician">Electrician (Bijlikaam)</option>
                <option value="Supervisor">Onsite Supervisor</option>
                <option value="Subcontractor">Subcontractor Admin</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Daily Wages Rate (INR Per Shift)</label>
              <input
                type="number"
                value={dailyWage}
                onChange={(e) => setDailyWage(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800 font-mono font-bold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Assigned Active Construction Site</label>
              <select
                value={assignedProjectId}
                onChange={(e) => setAssignedProjectId(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.location}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs transition shadow-sm"
          >
            Issue ID & Log Worker profile
          </button>
        </form>
      )}

      {/* Attendance Date Controller Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Muster Roll Controller</span>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="bg-transparent text-slate-800 font-black focus:outline-none text-sm font-mono border-b border-dashed border-amber-500 pb-0.5 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          <button
            onClick={handleDisburseWages}
            className="flex-1 md:flex-initial bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Wallet className="w-4 h-4 text-slate-950" /> Disburse Day Wages (UPI Sandbox)
          </button>
        </div>
      </div>

      {/* Roster Controls & Roster Search */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search active labor, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:outline-none focus:border-amber-500 rounded-xl text-xs py-2.5 pl-10 pr-3 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto max-w-full p-1 bg-slate-50 border border-slate-200 rounded-xl">
          {['All', 'Laborer', 'Mason', 'Carpenter', 'Plumber', 'Electrician', 'Supervisor'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedRole(tier)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                selectedRole === tier ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-550 hover:text-slate-800'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Grid containing Workers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="text-center p-12 bg-white border border-dashed border-slate-200 text-slate-400 text-xs col-span-3 rounded-3xl">
            No active labor fits search parameter tier.
          </div>
        ) : (
          filtered.map(w => {
            const currentDayAttendance = w.attendance[attendanceDate] || 'Absent';
            const totalWagesAccrued = Math.round(w.totalAttendance * w.dailyWage);

            return (
              <div
                key={w.id}
                className={`bg-white border p-5 rounded-2xl flex flex-col justify-between gap-4 transition shadow-sm hover:border-amber-200 ${
                  currentDayAttendance === 'Present' 
                    ? 'border-emerald-300 bg-emerald-500/5' 
                    : currentDayAttendance === 'Half-Day' 
                    ? 'border-amber-300 bg-amber-500/5' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
                        <HardHat className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{w.name}</h4>
                        <span className="text-[10px] uppercase font-mono font-black text-amber-600">{w.role}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-black text-slate-705">₹{w.dailyWage}/shift</span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-500 border-t border-b border-slate-100 py-2">
                    <p className="truncate">🏢 <span className="font-bold text-slate-700">{w.assignedProjectName}</span></p>
                    <p>📞 <span className="font-mono text-slate-600">{w.phone}</span></p>
                  </div>
                </div>

                {/* Day Attendance Marker */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 uppercase tracking-wider font-mono">Status for {attendanceDate}:</span>
                    <span className={`font-black font-mono uppercase text-[9px] px-2 py-0.5 rounded ${
                      currentDayAttendance === 'Present' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : currentDayAttendance === 'Half-Day' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {currentDayAttendance}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {(['Present', 'Absent', 'Half-Day'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleMarkAttendance(w.id, status)}
                        className={`text-[9px] font-extrabold py-1.5 px-1 rounded-lg transition-all ${
                          currentDayAttendance === status 
                          ? status === 'Present' 
                            ? 'bg-emerald-500 text-white font-black shadow-sm' 
                            : status === 'Half-Day' 
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                            : 'bg-red-500 text-white font-black shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                        }`}
                      >
                        {status === 'Half-Day' ? 'Half' : status}
                      </button>
                    ))}
                  </div>

                  {/* Wage Statistics bottom label */}
                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-slate-400">Muster Attendance:</span>
                    <span className="font-bold text-slate-700">{w.totalAttendance} Days Check</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-100">
                    <span className="text-emerald-700 font-bold">Accrued Wage (Total):</span>
                    <span className="font-black text-emerald-600 font-mono">₹{totalWagesAccrued.toLocaleString('en-IN')}</span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
