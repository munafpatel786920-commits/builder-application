import React, { useState } from 'react';
import { Client, Project } from '../types';
import { i18n, Language } from '../i18n';
import { Plus, Search, Mail, Phone, Calendar, User, Clock, Bell, CheckSquare, MessageSquare, ChevronRight, IndianRupee } from 'lucide-react';

interface ClientManagerProps {
  lang: Language;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  projects: Project[];
}

export default function ClientManager({ lang, clients, setClients, projects }: ClientManagerProps) {
  const t = i18n[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Add client form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [totalAgreed, setTotalAgreed] = useState(100);
  const [totalPaid, setTotalPaid] = useState(30);

  // Meeting states
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('2026-06-01');
  const [meetingTime, setMeetingTime] = useState('11:00 AM');
  const [meetingNotes, setMeetingNotes] = useState('');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Fill out Client Full Name and Mobile number.');
      return;
    }

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: name,
      phone: phone,
      email: email || 'contact@client.com',
      company: company || 'Independent Owner',
      projectHistory: [],
      totalAgreed: Number(totalAgreed),
      totalPaid: Number(totalPaid),
      meetings: []
    };

    setClients(prev => [newClient, ...prev]);
    setName('');
    setPhone('');
    setEmail('');
    setCompany('');
    setTotalAgreed(100);
    setTotalPaid(30);
    setShowAddForm(false);
    alert('🎉 Client contract profile saved successfully.');
  };

  const handleAddMeeting = (clientId: string) => {
    if (!meetingTitle.trim()) {
      alert('Please fill out a meeting title.');
      return;
    }

    const newMeeting = {
      id: `mt-${Date.now()}`,
      title: meetingTitle,
      date: meetingDate,
      time: meetingTime,
      notes: meetingNotes
    };

    setClients(prev => prev.map(c => {
      if (c.id !== clientId) return c;
      return {
        ...c,
        meetings: [newMeeting, ...c.meetings]
      };
    }));

    // Reset meeting form
    setMeetingTitle('');
    setMeetingNotes('');

    setSelectedClient(prev => {
      if (!prev || prev.id !== clientId) return prev;
      return {
        ...prev,
        meetings: [newMeeting, ...prev.meetings]
      };
    });
  };

  const handleUpdatePayment = (clientId: string, amountToAdd: number) => {
    setClients(prev => prev.map(c => {
      if (c.id !== clientId) return c;
      return {
        ...c,
        totalPaid: Math.min(c.totalAgreed, Number((c.totalPaid + amountToAdd).toFixed(2)))
      };
    }));

    setSelectedClient(prev => {
      if (!prev || prev.id !== clientId) return prev;
      return {
        ...prev,
        totalPaid: Math.min(prev.totalAgreed, Number((prev.totalPaid + amountToAdd).toFixed(2)))
      };
    });
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-fade-in text-slate-800" id="client-manager">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900">Clients & Partner Registry</h2>
          <p className="text-slate-500 text-xs">Track escrow budgets, milestones, schedule consultation meetings & ping via WhatsApp.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white border border-slate-300 hover:border-amber-500 hover:text-amber-600 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-amber-500" /> {showAddForm ? 'Close Directory' : 'Record Client Contract'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddClient} className="bg-slate-50 border border-slate-205 p-5 rounded-2xl space-y-4 max-w-4xl mx-auto shadow-inner animate-fade-in">
          <h3 className="text-xs uppercase font-mono tracking-widest text-amber-600 font-extrabold">New Client Onboarding form</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Client Full Name *</label>
              <input
                type="text"
                required
                placeholder="Rameshchandra Adani"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-550 block mb-1">WhatsApp / Cell Number *</label>
              <input
                type="text"
                required
                placeholder="+91 94280 11982"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Email ID</label>
              <input
                type="email"
                placeholder="ramesh@adani-infra.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Company / Promoter Firm</label>
              <input
                type="text"
                placeholder="Adani Port Logistics"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Agreed Value (INR Lakhs)</label>
              <input
                type="number"
                value={totalAgreed}
                onChange={(e) => setTotalAgreed(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Total Upfront Paid to Date (INR Lakhs)</label>
              <input
                type="number"
                value={totalPaid}
                onChange={(e) => setTotalPaid(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800 font-mono font-bold"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs transition shadow-sm"
          >
            Register Client & Initiate Escrow Ledger
          </button>
        </form>
      )}

      {/* Searching Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-205 flex items-center gap-3 shadow-sm">
        <Search className="h-4 w-4 text-slate-400 shrink-0 animate-pulse" />
        <input
          type="text"
          placeholder="Search by client name, firm company, mobile number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 rounded-lg text-xs py-2 px-3 text-slate-800 placeholder-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Clients List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center p-12 bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs shadow-inner">
              No registered client found.
            </div>
          ) : (
            filtered.map(c => {
              const remains = Number((c.totalAgreed - c.totalPaid).toFixed(2));
              const progressOfPayment = Math.round((c.totalPaid / c.totalAgreed) * 100) || 0;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClient(c)}
                  className={`bg-white border p-5 rounded-3xl cursor-pointer hover:border-slate-350 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                    selectedClient?.id === c.id 
                    ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/10' 
                    : 'border-slate-200'
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-black">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-905 text-sm flex items-center gap-2">
                        {c.name}
                        {c.company && (
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-500 py-0.5 px-2 border border-slate-200 rounded font-black">
                            {c.company}
                          </span>
                        )}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[10px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {c.phone}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400 shrink-0" /> {c.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:text-right space-y-1.5 md:min-w-44 border-t border-slate-100 md:border-0 pt-3 md:pt-0">
                    <div className="flex md:justify-end gap-2 text-[10px]">
                      <span className="text-slate-400">Escrow Value:</span>
                      <span className="font-bold text-slate-800">₹{c.totalAgreed} Lakhs</span>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${progressOfPayment}%` }} />
                    </div>

                    <div className="flex justify-between md:justify-end gap-4 text-[10px]">
                      <span className="text-emerald-600 font-extrabold">Paid: ₹{c.totalPaid}L</span>
                      <span className="text-amber-650 text-amber-600 font-black">Balance: ₹{remains}L</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Client Actions Sheet */}
        <div>
          {selectedClient ? (
            <div className="bg-white border border-slate-205 p-5 rounded-3xl space-y-6 shadow-md animate-fade-in text-slate-805">
              <div>
                <span className="text-[9px] uppercase font-mono bg-amber-500/10 text-amber-700 py-1 px-2.5 border border-amber-500/20 rounded-full font-bold">
                  Payment & Meeting Action Board
                </span>
                <h3 className="text-base font-black text-slate-900 mt-3 mb-1">{selectedClient.name}</h3>
                <p className="text-[11px] text-emerald-605 text-emerald-600 font-extrabold uppercase">{selectedClient.company}</p>
              </div>

              {/* Direct Instant Actions */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://api.whatsapp.com/send?phone=${selectedClient.phone.replace(/[\s+]/g, '')}&text=Namaste%2520${encodeURIComponent(selectedClient.name)},%2520this%2520is%2520Global%2520Constructions.%252520We%252520wanted%252520to%252520share%252520the%252520latest%252520civil%252520milestone%252520checks%252520with%252520you.`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-black py-2.5 rounded-xl text-[10px] text-center flex items-center justify-center gap-1.5 transition whitespace-nowrap shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Chat
                </a>

                <a
                  href={`tel:${selectedClient.phone}`}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-black py-2.5 rounded-xl text-[10px] text-center flex items-center justify-center gap-1.5 transition whitespace-nowrap shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" /> Direct Call
                </a>
              </div>

              {/* Installments Simulation */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-[9px] uppercase font-mono text-slate-450 text-slate-500 font-bold block">Simulate Token Received</span>
                <div className="flex gap-2">
                  {[5, 10, 25].map(amt => (
                    <button
                      key={amt}
                      onClick={() => handleUpdatePayment(selectedClient.id, amt)}
                      className="flex-1 bg-white border border-slate-250 hover:border-amber-500 text-slate-705 hover:text-amber-600 font-mono font-bold text-[10px] py-1.5 rounded transition shadow-sm"
                    >
                      +₹{amt}L
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400">Reflect token payments directly inside escrow ledger logs.</p>
              </div>

              {/* Meeting Scheduler */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-4 shadow-inner">
                <span className="text-[9px] uppercase font-mono text-amber-600 font-black block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-500" /> Schedule Onsite Consultation
                </span>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Joint Site Inspection / RCC check..."
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded p-2 text-[11px] text-slate-800"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="bg-white border border-slate-350 rounded p-2 text-[10px] text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="e.g., 04:00 PM"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="bg-white border border-slate-350 rounded p-2 text-[10px] text-slate-800"
                    />
                  </div>
                  <textarea
                    placeholder="Agenda details..."
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded p-2 text-[10px] text-slate-800"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => handleAddMeeting(selectedClient.id)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-2.5 rounded-lg text-[10px] transition shadow-sm"
                >
                  Confirm Meeting Schedule
                </button>
              </div>

              {/* Upcoming Scheduled Reminders */}
              <div className="space-y-2">
                <h4 className="text-[9px] uppercase font-mono font-bold text-slate-450">Scheduled Consultations ({selectedClient.meetings.length})</h4>
                {selectedClient.meetings.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">No scheduled meetings. Use form above to lock dates.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedClient.meetings.map(m => (
                      <div key={m.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-800">{m.title}</span>
                          <span className="text-[9px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold border border-amber-200">{m.date} - {m.time}</span>
                        </div>
                        {m.notes && <p className="text-[10px] text-slate-500 font-sans">{m.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 border-dashed p-8 text-center rounded-3xl h-64 flex flex-col items-center justify-center shadow-inner">
              <Clock className="w-10 h-10 text-slate-350 animate-pulse" />
              <h4 className="text-slate-550 text-xs font-black mt-3">Select Partner Directory Card</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                View meeting logs, record installment tokens, or ping directly via WhatsApp channel.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
