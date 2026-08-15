import React, { useState } from 'react';
import { Equipment, Project } from '../types';
import { Truck, Wrench, Search, Plus, Calendar, Settings } from 'lucide-react';
import { Language, i18n } from '../i18n';

interface EquipmentManagerProps {
  lang: Language;
  equipment: Equipment[];
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  projects: Project[];
  onLogActivity: (action: string, details: string) => void;
}

export default function EquipmentManager({ lang, equipment, setEquipment, projects, onLogActivity }: EquipmentManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'Heavy Machinery' | 'Vehicle' | 'Hand Tool' | 'Scaffolding'>('Heavy Machinery');
  const [newStatus, setNewStatus] = useState<'Available' | 'In Use' | 'Maintenance'>('Available');
  const [newDailyRate, setNewDailyRate] = useState(1000);
  const [newLastService, setNewLastService] = useState(() => new Date().toISOString().substring(0, 10));

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newEq: Equipment = {
      id: `eq-${Date.now()}`,
      name: newName.trim(),
      type: newType,
      status: newStatus,
      dailyRate: Number(newDailyRate),
      lastServiceDate: newLastService
    };

    setEquipment(prev => [newEq, ...prev]);
    onLogActivity('Added Machinery', `Registered ${newEq.name} into company machinery list.`);
    
    setNewName('');
    setShowAddForm(false);
  };

  const updateStatus = (eqId: string, status: 'Available' | 'In Use' | 'Maintenance') => {
    setEquipment(prev => prev.map(e => e.id === eqId ? { ...e, status, assignedProjectId: status !== 'In Use' ? undefined : e.assignedProjectId, assignedProjectName: status !== 'In Use' ? undefined : e.assignedProjectName } : e));
    onLogActivity('Machinery Status Changed', `Marked machinery ID ${eqId} as ${status}.`);
  };

  const assignToProject = (eqId: string, projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setEquipment(prev => prev.map(e => e.id === eqId ? { 
      ...e, 
      status: 'In Use', 
      assignedProjectId: project.id,
      assignedProjectName: project.name
    } : e));
    onLogActivity('Machinery Deployed', `Deployed machinery ID ${eqId} to site ${project.name}.`);
  };

  const filteredEquipment = equipment.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || e.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-500" /> Machinery & Equipment Fleet
          </h2>
          <p className="text-slate-500 text-xs">Manage heavy construction machinery, scaffolding, and service dates.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-xl text-xs font-black tracking-wide shadow-sm transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {showAddForm ? 'Close Form' : 'Register Machinery'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 animate-fade-in">
          <h3 className="text-sm font-black uppercase text-slate-800 mb-4 border-b pb-2">Register New Equipment</h3>
          <form onSubmit={handleAddEquipment} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Equipment / Machine Name</label>
              <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-medium" placeholder="E.g. JCB 3DX" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Equipment Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800">
                <option value="Heavy Machinery">Heavy Machinery (JCB/Cranes)</option>
                <option value="Vehicle">Vehicle (Trucks/Tractors)</option>
                <option value="Hand Tool">Specialized Power Tools</option>
                <option value="Scaffolding">Scaffolding / Formwork</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Daily Depr/Rental Rate (₹)</label>
              <input type="number" required min={0} value={newDailyRate} onChange={e => setNewDailyRate(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Initial Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800">
                <option value="Available">Available</option>
                <option value="Maintenance">Under Maintenance</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Last Service Date</label>
              <input type="date" required value={newLastService} onChange={e => setNewLastService(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-mono" />
            </div>
            
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-xl text-xs font-bold transition">
                Save to Inventory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium text-slate-700"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 min-w-[200px]"
        >
          <option value="All">All Types</option>
          <option value="Heavy Machinery">Heavy Machinery</option>
          <option value="Vehicle">Vehicles</option>
          <option value="Scaffolding">Scaffolding</option>
        </select>
      </div>

      {/* Equipment List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEquipment.map(eq => (
          <div key={eq.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">{eq.name}</h3>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                    {eq.type}
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                    eq.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                    eq.status === 'Maintenance' ? 'bg-red-50 text-red-600 border-red-200' : 
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {eq.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
                   <Settings className="w-3.5 h-3.5" /> ₹{eq.dailyRate}/day
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
                   <Calendar className="w-3.5 h-3.5" /> Srvc: {eq.lastServiceDate}
                </div>
              </div>
              
              {eq.assignedProjectName && eq.status === 'In Use' && (
                <div className="bg-slate-800 text-slate-200 p-2 text-[10px] rounded-lg mt-2 font-mono flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div> Active at: {eq.assignedProjectName}
                </div>
              )}
            </div>
            
            <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between">
              <div className="flex gap-2">
                {eq.status !== 'Available' && (
                  <button onClick={() => updateStatus(eq.id, 'Available')} className="text-[9px] uppercase font-bold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-2 py-1 rounded border border-slate-200 transition">
                    Mark Available
                  </button>
                )}
                {eq.status !== 'Maintenance' && (
                  <button onClick={() => updateStatus(eq.id, 'Maintenance')} className="text-[9px] uppercase font-bold text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 px-2 py-1 rounded border border-slate-200 transition">
                    Send to Repair
                  </button>
                )}
              </div>
              
              {eq.status === 'Available' && (
                <select 
                  className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-bold p-1 rounded outline-none"
                  onChange={(e) => {
                    if (e.target.value) {
                      assignToProject(eq.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">+ Deploy Site</option>
                  {projects.filter(p => p.status === 'Ongoing' || p.status === 'Planning').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}

        {filteredEquipment.length === 0 && (
          <div className="col-span-full py-10 text-center bg-white border border-slate-200 border-dashed rounded-2xl">
            <Wrench className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500 text-sm font-medium">No machinery match your filters.</p>
          </div>
        )}
      </div>

    </div>
  );
}
