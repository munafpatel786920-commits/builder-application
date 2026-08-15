import React, { useState, useEffect } from 'react';
import { Project, LandPurchase, Client, Material, Worker } from '../types';
import { i18n, Language } from '../i18n';
import { 
  Plus, Search, Calendar, Landmark, MapPin, CheckCircle, 
  HelpCircle, User, Phone, Image, ExternalLink, Sliders, 
  DollarSign, FileText, CheckSquare, Layers, Sparkles,
  Trash2, HardHat, Package, ListChecks, FileEdit, ShieldAlert, FileCode
} from 'lucide-react';

interface ProjectManagerProps {
  lang: Language;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  lands: LandPurchase[];
  setLands: React.Dispatch<React.SetStateAction<LandPurchase[]>>;
  clients: Client[];
  materials?: Material[];
  setMaterials?: React.Dispatch<React.SetStateAction<Material[]>>;
  workers?: Worker[];
  setWorkers?: React.Dispatch<React.SetStateAction<Worker[]>>;
  onLogActivity: (action: string, details: string) => void;
  initialTab?: 'lands' | 'contracts';
}

export default function ProjectManager({ 
  lang, 
  projects, 
  setProjects, 
  lands, 
  setLands, 
  clients, 
  materials = [],
  setMaterials,
  workers = [],
  setWorkers,
  onLogActivity,
  initialTab
}: ProjectManagerProps) {
  const t = i18n[lang];
  const [managerTab, setManagerTab] = useState<'lands' | 'contracts'>(initialTab || 'lands');
  
  // Update managerTab whenever initialTab changes from parent
  useEffect(() => {
    if (initialTab) {
      setManagerTab(initialTab);
    }
  }, [initialTab]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);
  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0] || null;

  // Form states - Buy New Land Plot
  const [showAddLandForm, setShowAddLandForm] = useState(false);
  const [landTitle, setLandTitle] = useState('');
  const [landLocation, setLandLocation] = useState('');
  const [landSize, setLandSize] = useState(1500);
  const [landCost, setLandCost] = useState(120); // in lakhs
  const [landSeller, setLandSeller] = useState('');
  const [landDocStatus, setLandDocStatus] = useState<'Pending' | 'Registered' | 'Clear Title'>('Clear Title');
  const [landDeed, setLandDeed] = useState(true);

  // Form states - Contract Builder (Theka)
  const [showAddContractForm, setShowAddContractForm] = useState(false);
  const [linkedLandId, setLinkedLandId] = useState(lands[0]?.id || '');
  const [buildingName, setBuildingName] = useState('');
  const [contractValue, setContractValue] = useState(250); // in lakhs
  const [builderName, setBuilderName] = useState('');
  const [builderPhone, setBuilderPhone] = useState('');
  const [contractType, setContractType] = useState<'Residential' | 'Commercial' | 'Villa' | 'Plot'>('Residential');
  const [startDate, setStartDate] = useState('2026-06-01');
  const [isSelfConstructedProject, setIsSelfConstructedProject] = useState(false);

  // Self-Construction right panel form states
  const [issueMaterialId, setIssueMaterialId] = useState('');
  const [issueQuantity, setIssueQuantity] = useState(1);
  const [logTitle, setLogTitle] = useState('');
  const [logCategory, setLogCategory] = useState('Slab Casting');
  const [logDescription, setLogDescription] = useState('');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [activeSubTab, setActiveSubTab] = useState<'details' | 'materials' | 'logs' | 'crew' | 'costing' | 'drawings' | 'safety'>('details');

  // Professional Features State
  const [drawingTitle, setDrawingTitle] = useState('');
  const [drawingType, setDrawingType] = useState<'Architectural' | 'Structural' | 'MEP' | 'Floor Plan'>('Architectural');
  const [drawingVersion, setDrawingVersion] = useState('v1.0');
  
  const [auditInspector, setAuditInspector] = useState('');
  const [auditScore, setAuditScore] = useState(100);
  const [auditNotes, setAuditNotes] = useState('');
  const [auditStatus, setAuditStatus] = useState<'Pass' | 'Needs Attention' | 'Critical Issue'>('Pass');

  // Enhanced Self-Construction State parameters
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [quickWorkerName, setQuickWorkerName] = useState('');
  const [quickWorkerRole, setQuickWorkerRole] = useState<'Mason' | 'Laborer' | 'Carpenter' | 'Plumber' | 'Electrician' | 'Supervisor' | 'Subcontractor'>('Mason');
  const [quickWorkerWage, setQuickWorkerWage] = useState(650);
  const [showQuickCrewForm, setShowQuickCrewForm] = useState(false);

  const [miscCategory, setMiscCategory] = useState('Water Tanker');
  const [miscAmount, setMiscAmount] = useState(4500); // In Rupees
  const [miscDescription, setMiscDescription] = useState('');

  // Submit Land Purchase (Zameen Kharidna)
  const handleBuyLand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landTitle.trim() || !landLocation.trim() || !landSeller.trim()) {
      alert('Please fill out all details!');
      return;
    }

    const newLand: LandPurchase = {
      id: `land-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: landTitle,
      location: landLocation,
      sizeSqYds: Number(landSize),
      costLakhs: Number(landCost),
      purchaseDate: new Date().toISOString().substring(0, 10),
      sellerName: landSeller,
      documentStatus: landDocStatus,
      courtDeedLinked: landDeed
    };

    setLands(prev => [newLand, ...prev]);
    onLogActivity('Purchased New Land Plot', `Acquired plot "${newLand.title}" in ${newLand.location} from ${newLand.sellerName} for ₹${newLand.costLakhs} Lakhs.`);
    
    // Reset Form
    setLandTitle('');
    setLandLocation('');
    setLandSeller('');
    setShowAddLandForm(false);
    alert('🎉 Land deal entry recorded successfully under Global Builder Group portfolio.');
  };

  // Submit Construction Contract (Zaamen par building ka contract dena)
  const handleAwardContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingName.trim() || !builderName.trim() || !linkedLandId) {
      alert('Please fill out Building Name, Contractor Name and choose a Land Plot!');
      return;
    }

    const matchingLand = lands.find(l => l.id === linkedLandId);
    const locationStr = matchingLand ? matchingLand.location : 'Sanand Hub, Gujarat';

    const newContract: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: buildingName,
      landPurchaseId: linkedLandId,
      location: locationStr,
      coords: { lat: 23.0225, lng: 72.5714 },
      status: 'Ongoing',
      budget: Number(contractValue),
      spent: isSelfConstructedProject ? 0 : 10, // 0 if self constructed, or 10 mobilization fee
      startDate: startDate,
      endDate: '2028-06-30',
      contractorName: isSelfConstructedProject ? 'Self-Executed (In-House Team)' : builderName,
      contractorPhone: isSelfConstructedProject ? '+91 94280 11982' : (builderPhone || '+91 99999 88888'),
      type: contractType,
      progress: 5,
      sitePhotos: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'],
      milestones: [
        { id: `m-1`, title: 'Excavation & Foundations', status: 'Pending', dueDate: '2026-09-01' },
        { id: `m-2`, title: 'Slab Casting Phase I & Pillars', status: 'Pending', dueDate: '2027-03-31' },
        { id: `m-3`, title: 'Plastering & Internal Bricks Work', status: 'Pending', dueDate: '2027-11-30' },
        { id: `m-4`, title: 'Plumbing, Flooring & Final Finishing', status: 'Pending', dueDate: '2028-05-15' }
      ],
      isSelfConstructed: isSelfConstructedProject,
      constructionLogs: [],
      materialIssues: []
    };

    // Update land reference
    setLands(prev => prev.map(l => {
      if (l.id === linkedLandId) {
        return { ...l, assignedBuildingName: buildingName };
      }
      return l;
    }));

    setProjects(prev => [newContract, ...prev]);
    onLogActivity(
      isSelfConstructedProject ? 'Initiated Self-Construction Project' : 'Awarded Building Contract',
      isSelfConstructedProject 
        ? `Authorized direct, self-constructed building site of "${newContract.name}" on plot size ${matchingLand?.sizeSqYds || 'unknown'} Sq Yds.`
        : `Gave building construction contract for "${newContract.name}" to contractor ${newContract.contractorName} for ₹${newContract.budget} Lakhs.`
    );
    
    // Reset Form
    setBuildingName('');
    setBuilderName('');
    setBuilderPhone('');
    setIsSelfConstructedProject(false);
    setShowAddContractForm(false);
    setSelectedProjectId(newContract.id);
    alert(isSelfConstructedProject 
      ? '🏗️ Self-construction project setup initialized! You can now track raw material consumption and daily site work logs directly.'
      : '🏗️ Modern Construction building contract award logic resolved successfully.'
    );
  };

  // Toggle milestone checkbox
  const handleToggleMilestone = (projectId: string, milestoneId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updatedMs = p.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        const nextStatus = m.status === 'Pending' ? 'In Progress' : m.status === 'In Progress' ? 'Done' : 'Pending';
        return { ...m, status: nextStatus };
      });

      // Recalculate progress based on milestones
      const doneCount = updatedMs.filter(m => m.status === 'Done').length;
      const inProgCount = updatedMs.filter(m => m.status === 'In Progress').length;
      const totalCount = updatedMs.length;
      const calcProgress = Math.round(((doneCount * 1.0 + inProgCount * 0.5) / totalCount) * 100);

      let pStatus = p.status;
      if (calcProgress === 100) {
        pStatus = 'Completed';
      } else if (calcProgress > 0) {
        pStatus = 'Ongoing';
      }

      return {
        ...p,
        milestones: updatedMs,
        progress: calcProgress,
        status: pStatus
      };
    }));
  };

  // Quick milestone payouts simulator
  const handleDisbursePayment = (projectId: string, amount: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newSpent = Math.min(p.budget, p.spent + amount);
      onLogActivity('Contractor Payment Disbursed', `Paid additional ₹${amount} Lakhs to contractor ${p.contractorName} under project ${p.name}.`);
      return { ...p, spent: newSpent };
    }));
    alert(`💳 Contractor Milestones Payment of ₹${amount} Lakhs Approved & Disbursed!`);
  };

  // Self-Construction handlers
  const handleIssueMaterialToProject = (projectId: string) => {
    if (!setMaterials) {
      alert("Inventory sync not configured.");
      return;
    }
    if (!issueMaterialId || issueQuantity <= 0) {
      alert("Please select a valid material and quantity to issue!");
      return;
    }
    const mat = materials.find(m => m.id === issueMaterialId);
    if (!mat) {
      alert("Selected material not registered.");
      return;
    }
    if (mat.stock < issueQuantity) {
      alert(`Insufficient stock! Currently only ${mat.stock} ${mat.unit} of ${mat.name} is available in main warehouse ledger.`);
      return;
    }

    // 1. Reduce main inventory
    setMaterials(prev => prev.map(m => {
      if (m.id === issueMaterialId) {
        return {
          ...m,
          stock: Number((m.stock - issueQuantity).toFixed(1)),
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return m;
    }));

    // 2. record issue under project
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const issues = p.materialIssues || [];
      const costInLakhs = Number(((issueQuantity * mat.pricePerUnit) / 100000).toFixed(2));
      const newIssue = {
        id: `issue-${Date.now()}`,
        date: new Date().toISOString().substring(0, 10),
        materialId: issueMaterialId,
        materialName: mat.name,
        quantity: issueQuantity,
        unit: mat.unit
      };
      
      const updatedSpent = Number((p.spent + costInLakhs).toFixed(2));

      onLogActivity(
        'Material Issued to Site',
        `Dispatched ${issueQuantity} ${mat.unit} of ${mat.name} to self-constructed project "${p.name}". Stock adjusted.`
      );

      return {
        ...p,
        spent: updatedSpent,
        materialIssues: [newIssue, ...issues]
      };
    }));

    setIssueQuantity(1);
    alert(`🏗️ Material Dispatched!\n\nSuccessfully issued ${issueQuantity} ${mat.unit} of ${mat.name} from warehouse directly to this site.`);
  };

  const handleAddConstructionLog = (projectId: string) => {
    if (!logTitle.trim() || !logDescription.trim()) {
      alert("Please enter both a title and description for daily construction logging.");
      return;
    }

    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const logs = p.constructionLogs || [];
      const newLog = {
        id: `site-log-${Date.now()}`,
        date: new Date().toISOString().substring(0, 10),
        title: logTitle,
        category: logCategory,
        description: logDescription
      };

      onLogActivity('Site Construction Logged', `Recorded daily work "${newLog.title}" under category "${newLog.category}" for project ${p.name}.`);
      return {
        ...p,
        constructionLogs: [newLog, ...logs]
      };
    }));

    setLogTitle('');
    setLogDescription('');
    alert("📝 Daily construction report logged to project timeline successfully.");
  };

  const handleAddNewMilestone = (projectId: string) => {
    if (!newMilestoneTitle.trim()) {
      alert("Please specify a milestone title.");
      return;
    }

    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updatedMilestones = [
        ...p.milestones,
        {
          id: `m-custom-${Date.now()}`,
          title: newMilestoneTitle,
          status: 'Pending' as const,
          dueDate: newMilestoneDueDate
        }
      ];

      // Re-run progress calculations
      const doneCount = updatedMilestones.filter(m => m.status === 'Done').length;
      const inProgCount = updatedMilestones.filter(m => m.status === 'In Progress').length;
      const calcProgress = Math.round(((doneCount * 1.0 + inProgCount * 0.5) / updatedMilestones.length) * 100);

      onLogActivity('Project Milestone Created', `Added customized stage "${newMilestoneTitle}" target due date ${newMilestoneDueDate}.`);
      return {
        ...p,
        milestones: updatedMilestones,
        progress: calcProgress
      };
    }));

    setNewMilestoneTitle('');
    alert("🚩 Custom construction milestone registered for in-house tracking.");
  };

  const handleDeleteMilestone = (projectId: string, milestoneId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updatedMilestones = p.milestones.filter(m => m.id !== milestoneId);
      if (updatedMilestones.length === 0) {
        alert("A project must maintain at least 1 milestone to track progress!");
        return p;
      }

      // Re-run progress calculations
      const doneCount = updatedMilestones.filter(m => m.status === 'Done').length;
      const inProgCount = updatedMilestones.filter(m => m.status === 'In Progress').length;
      const calcProgress = Math.round(((doneCount * 1.0 + inProgCount * 0.5) / updatedMilestones.length) * 100);

      onLogActivity('Project Milestone Deleted', `Deleted construction milestone in project ${p.name}.`);
      return {
        ...p,
        milestones: updatedMilestones,
        progress: calcProgress
      };
    }));
  };

  // Toggle worker attendance for self-construction
  const toggleWorkerAttendance = (workerId: string, date: string) => {
    if (!setWorkers) {
      alert("Worker configuration not fully initialized.");
      return;
    }
    setWorkers(prev => prev.map(w => {
      if (w.id !== workerId) return w;
      
      const currentStatus = w.attendance[date] || 'Absent';
      let nextStatus: 'Present' | 'Absent' | 'Half-Day' = 'Present';
      if (currentStatus === 'Present') nextStatus = 'Half-Day';
      else if (currentStatus === 'Half-Day') nextStatus = 'Absent';
      else nextStatus = 'Present';

      const nextAttendance = { ...w.attendance, [date]: nextStatus };
      
      // Re-sum total shifts
      let attendanceSum = 0;
      Object.entries(nextAttendance).forEach(([key, v]) => {
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

  // Reassign worker to self-construction project
  const handleReassignWorker = (workerId: string) => {
    if (!setWorkers) return;
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;
    setWorkers(prev => prev.map(w => {
      if (w.id === workerId) {
        return {
          ...w,
          assignedProjectId: selectedProject?.id || '',
          assignedProjectName: selectedProject?.name || ''
        };
      }
      return w;
    }));
    onLogActivity(
      'Crew Member Reassigned', 
      `Transferred worker "${worker.name}" to self-construction crew for project "${selectedProject?.name}".`
    );
    alert(`👷 Shifted ${worker.name} successfully to ${selectedProject?.name} site group!`);
  };

  // Register quick crew direct on site
  const handleCreateQuickCrew = () => {
    if (!quickWorkerName.trim() || !setWorkers || !selectedProject) return;
    const newW: Worker = {
      id: `worker-${Date.now()}`,
      name: quickWorkerName,
      role: quickWorkerRole,
      phone: '+91 91060 22114',
      dailyWage: Number(quickWorkerWage),
      assignedProjectId: selectedProject.id,
      assignedProjectName: selectedProject.name,
      completedTasks: 0,
      totalAttendance: 0,
      attendance: {}
    };
    setWorkers(prev => [newW, ...prev]);
    setQuickWorkerName('');
    setShowQuickCrewForm(false);
    onLogActivity(
      'Registered Project Crew Member', 
      `Added ${newW.name} (${newW.role}) directly on site for "${selectedProject.name}" in-house crew.`
    );
    alert(`🎉 Registered ${newW.name} directly on "${selectedProject.name}" labor roster at ₹${newW.dailyWage}/shift rate.`);
  };

  // Handle adding direct miscellaneous on-site cash cashbook transactions
  const handleAddMiscExpense = (projectId: string) => {
    if (!miscDescription.trim() || miscAmount <= 0) {
      alert("Please specify a description and valid expense cost!");
      return;
    }

    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const currentExpenses = p.miscExpenses || [];
      const newExp = {
        id: `misc-exp-${Date.now()}`,
        date: new Date().toISOString().substring(0, 10),
        amount: Number(miscAmount),
        description: miscDescription,
        category: miscCategory
      };

      const costInLakhs = Number((Number(miscAmount) / 100000).toFixed(2));
      const updatedSpent = Number((p.spent + costInLakhs).toFixed(2));

      onLogActivity(
        'Logged On-site Petty Cash Expense', 
        `Recorded ₹${Number(miscAmount).toLocaleString('en-IN')} spend for "${newExp.description}" under category "${newExp.category}" at "${p.name}".`
      );

      return {
        ...p,
        spent: updatedSpent,
        miscExpenses: [newExp, ...currentExpenses]
      };
    }));

    setMiscDescription('');
    alert(`💰 Recorded! On-site cash outflow of ₹${Number(miscAmount).toLocaleString('en-IN')} added into construction ledger.`);
  };

  const handleAddDrawing = (projectId: string) => {
    if (!drawingTitle.trim()) return;
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newDbg = {
        id: `dwg-${Date.now()}`,
        projectId,
        title: drawingTitle,
        type: drawingType,
        version: drawingVersion,
        uploadDate: new Date().toISOString().substring(0, 10),
        url: '#',
        status: 'Approved' as 'Approved'
      };
      onLogActivity('Blueprint Uploaded', `Added ${drawingType} drawing "${drawingTitle}" to ${p.name}.`);
      return { ...p, drawings: [newDbg, ...(p.drawings || [])] };
    }));
    setDrawingTitle('');
    alert('Blueprint added to library!');
  };

  const handleAddAudit = (projectId: string) => {
    if (!auditInspector.trim()) return;
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newAudit = {
        id: `audit-${Date.now()}`,
        projectId,
        date: new Date().toISOString().substring(0, 10),
        inspectorName: auditInspector,
        score: auditScore,
        notes: auditNotes,
        status: auditStatus
      };
      onLogActivity('Safety Audit Logged', `Recorded HSE audit by ${auditInspector} scoring ${auditScore}/100.`);
      return { ...p, safetyAudits: [newAudit, ...(p.safetyAudits || [])] };
    }));
    setAuditInspector('');
    setAuditNotes('');
    alert('Safety & Quality inspection added!');
  };

  // Aggregated Stats
  const totalLandCount = lands.length;
  const totalLandInvestment = lands.reduce((sum, l) => sum + l.costLakhs, 0);
  const totalContractCount = projects.length;
  const totalContractValue = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalContractSpent = projects.reduce((sum, p) => sum + p.spent, 0);

  return (
    <div className="space-y-8 animate-fade-in text-slate-800" id="project-manager">
      
      {/* Top Banner & Flow Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-205 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-500" />
            Land Acquisition & Building Contracts
          </h2>
          <p className="text-slate-500 text-xs font-semibold">
            Step 1: Buy Land plots. Step 2: Award construction contracts (Theka) to builders.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => { setManagerTab('lands'); setShowAddLandForm(true); setShowAddContractForm(false); }}
            className="bg-white text-amber-600 border border-slate-300 hover:border-amber-500 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-amber-500" /> Buy Land (Zameen)
          </button>
          
          <button
            onClick={() => { setManagerTab('contracts'); setShowAddContractForm(true); setShowAddLandForm(false); }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950" /> Award Theka
          </button>
        </div>
      </div>

      {/* Aggregate Workflow KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">1. LAND ACQUISITIONS</span>
          <span className="text-lg font-black text-slate-905 block mt-1">{totalLandCount} Plot Deals</span>
          <span className="text-[10px] text-amber-650 font-mono font-bold">₹{totalLandInvestment} Lakhs Invested</span>
        </div>
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">2. THEKA CONTRACTS</span>
          <span className="text-lg font-black text-slate-905 block mt-1">{totalContractCount} Active Buildings</span>
          <span className="text-[10px] text-orange-600 font-mono font-bold">₹{totalContractValue} Lakhs Awarded</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold font-black">PAID TO CONTRACTORS</span>
          <span className="text-lg font-black text-slate-905 block mt-0.5">₹{totalContractSpent} Lakhs Outflow</span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-200/30">
            <div className="bg-emerald-505 bg-emerald-500 h-full" style={{ width: `${totalContractValue > 0 ? (totalContractSpent / totalContractValue) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">FLAT SALE READINESS</span>
          <span className="text-lg font-black text-amber-600 block mt-1">
            {projects.filter(p => p.progress >= 50).length} Tower block Structure
          </span>
          <span className="text-[10px] text-emerald-600 font-mono font-bold">Progress &gt; 50% Marker</span>
        </div>
      </div>

      {/* Internal Tab Swapper (Zameen vs Theka Contractors) */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setManagerTab('lands')}
          className={`pb-2.5 text-xs font-black border-b-2 tracking-wide transition-all ${
            managerTab === 'lands' 
              ? 'border-amber-550 text-amber-600 bg-amber-500/5 px-4 rounded-t-xl font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📂 Zameen Ledger / Land Purchases ({lands.length})
        </button>
        <button
          onClick={() => setManagerTab('contracts')}
          className={`pb-2.5 text-xs font-black border-b-2 tracking-wide transition-all ${
            managerTab === 'contracts' 
              ? 'border-amber-550 text-amber-600 bg-amber-500/5 px-4 rounded-t-xl font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🧱 Theka Ledger / Building Contracts ({projects.length})
        </button>
      </div>

      {/* COLLAPSED ADD FORMS SECTION */}
      
      {/* 1. Register Land Purchase */}
      {showAddLandForm && (
        <form onSubmit={handleBuyLand} className="bg-slate-50 border border-amber-500/15 p-6 rounded-2xl space-y-4 max-w-4xl mx-auto shadow-inner animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs uppercase font-mono tracking-widest text-amber-600 font-black">Register New Purchased Land Plot</h3>
            <button type="button" onClick={() => setShowAddLandForm(false)} className="text-slate-500 hover:text-red-500 text-xs font-bold">✕ Close</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Land plot/Survey Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sanand Ext Plot C-98"
                value={landTitle}
                onChange={(e) => setLandTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800 focus:outline-none focus:border-amber-550"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Detailed Site Address / Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Near GIDC Outer Circle, Sanand, Gujarat"
                value={landLocation}
                onChange={(e) => setLandLocation(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800 focus:outline-none focus:border-amber-550"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Total Plot Area Size (Sq. Yards) *</label>
              <input
                type="number"
                required
                value={landSize}
                onChange={(e) => setLandSize(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800 focus:outline-none focus:border-amber-555 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Total Purchase Cost Price (₹ Lakhs) *</label>
              <input
                type="number"
                required
                value={landCost}
                onChange={(e) => setLandCost(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800 focus:outline-none focus:border-amber-555 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Registered Seller Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Devjibhai Kanji Patel"
                value={landSeller}
                onChange={(e) => setLandSeller(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800 focus:outline-none focus:border-amber-550"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Deed Verification & Documents Status</label>
              <select
                value={landDocStatus}
                onChange={(e: any) => setLandDocStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800 focus:outline-none focus:border-amber-550"
              >
                <option value="Clear Title">Clear Title / Direct Registry (NOC Clear)</option>
                <option value="Registered">Registered Sale Agreement (Bana-Khat Done)</option>
                <option value="Pending">Pending Validation Checks</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs transition shadow-sm"
          >
            Confirm Land Plot Acquisition Ledger Entry
          </button>
        </form>
      )}

      {/* 2. Award Construction Building Contract (Theka) */}
      {showAddContractForm && (
        <form onSubmit={handleAwardContract} className="bg-slate-50 border border-orange-500/15 p-6 rounded-2xl space-y-4 max-w-4xl mx-auto shadow-inner animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs uppercase font-mono tracking-widest text-orange-655 text-orange-600 font-extrabold">Award Building Construction Contract (Theka)</h3>
            <button type="button" onClick={() => setShowAddContractForm(false)} className="text-slate-500 hover:text-red-550 text-xs font-bold">✕ Close</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Apna Project / Self-Construction Toggle */}
            <div className="md:col-span-2 bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-amber-600" /> Apna Project? (Self-Construction Mode)
                </span>
                <p className="text-[10px] text-slate-500 font-semibold">
                  Enable this if you are constructing the building yourself in-house. This will unlock the raw materials dispatcher, custom milestones builder, and on-site daily construction logs.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isSelfConstructedProject} 
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsSelfConstructedProject(checked);
                    if (checked) {
                      setBuilderName('Self-Executed (In-House Team)');
                      setBuilderPhone('+91 94280 11982');
                    } else {
                      setBuilderName('');
                      setBuilderPhone('');
                    }
                  }} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Select Purchased Land Plot *</label>
              <select
                required
                value={linkedLandId}
                onChange={(e) => setLinkedLandId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800 focus:outline-none"
              >
                {lands.map(l => (
                  <option key={l.id} value={l.id}>{l.title} ({l.sizeSqYds} Sq Yds, {l.location})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Building/Tower Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Gokuldham Heights - Block B"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Contractor / General Builder Name *</label>
              <input
                type="text"
                required
                disabled={isSelfConstructedProject}
                placeholder="e.g. Shree Balaji Construction Engg"
                value={builderName}
                onChange={(e) => setBuilderName(e.target.value)}
                className="w-full bg-slate-50 disabled:bg-slate-100 border border-slate-300 rounded-lg text-xs p-2.5 text-slate-850 disabled:text-slate-500 focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Contractor Phone Number (Direct Line)</label>
              <input
                type="text"
                disabled={isSelfConstructedProject}
                placeholder="e.g. +91 98254 XXXXX"
                value={builderPhone}
                onChange={(e) => setBuilderPhone(e.target.value)}
                className="w-full bg-slate-50 disabled:bg-slate-100 border border-slate-300 rounded-lg text-xs p-2.5 text-slate-850 disabled:text-slate-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Total Fixed Contract Price (₹ Lakhs) *</label>
              <input
                type="number"
                required
                value={contractValue}
                onChange={(e) => setContractValue(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Building Structure Layout Type</label>
              <select
                value={contractType}
                onChange={(e: any) => setContractType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2.5 text-slate-800 focus:outline-none"
              >
                <option value="Residential">Residential Flats (Apartment Complex)</option>
                <option value="Commercial">Commercial Office Spaces</option>
                <option value="Villa">Standard Row-Houses / Gated Villas</option>
                <option value="Plot">Open Gated Farmlands Layout</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black py-2.5 rounded-xl text-xs transition shadow-sm"
          >
            Authorize Mobilization & Award Building Contract (ठेका देना)
          </button>
        </form>
      )}

      {/* CORE SEARCH & BODY RENDER */}

      {/* SECTION A: LAND PURCHASE LEDGER */}
      {managerTab === 'lands' && (
        <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search lands, bypass locations or seller name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-205 focus:outline-none focus:border-amber-550 rounded-xl text-xs p-2.5 pl-10 text-slate-805 placeholder-slate-400 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
            {lands
              .filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()) || l.location.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(land => (
                <div key={land.id} className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-amber-305 hover:shadow-md transition flex flex-col justify-between space-y-4 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-widest text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                          Zameen Plot Deal
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-2 flex items-center gap-1.5">
                          <Landmark className="w-4 h-4 text-amber-500 shrink-0" /> {land.title}
                        </h4>
                      </div>
                      <span className="text-xs font-black text-amber-600 font-mono">₹{land.costLakhs} Lakhs</span>
                    </div>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {land.location}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-205">
                      <div>
                        <span className="text-slate-400 block font-bold">PLOT SIZE</span>
                        <span className="text-slate-750 font-black">{land.sizeSqYds} Sq. Yards</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">KHARIDI SELLER</span>
                        <span className="text-slate-755 font-black truncate max-w-[120px] inline-block">{land.sellerName}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center text-[10px] pt-1">
                      <span className="text-slate-450 text-slate-500 font-semibold">Registry Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        land.documentStatus === 'Clear Title' 
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold' 
                          : land.documentStatus === 'Registered'
                          ? 'bg-blue-500/10 text-blue-700 border border-blue-500/10'
                          : 'bg-red-500/10 text-red-700'
                      }`}>
                        {land.documentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">Bought: {land.purchaseDate}</span>
                    
                    {land.assignedBuildingName ? (
                      <span className="text-emerald-700 font-black flex items-center gap-1 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10">
                        🔨 Contract active: {land.assignedBuildingName}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setLinkedLandId(land.id);
                          setManagerTab('contracts');
                          setShowAddContractForm(true);
                        }}
                        className="text-amber-700 hover:text-white font-extrabold bg-slate-50 hover:bg-amber-600 transition tracking-wide px-3 py-1.5 border border-amber-302 hover:border-amber-500 rounded-xl text-[10px] shadow-sm"
                      >
                        🏗️ Award Contract Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SECTION B: THEKA CONSTRUCTION CONTRACTS */}
      {managerTab === 'contracts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Contracts Main Grid */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search building names, contractor or bypass sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-205 focus:outline-none focus:border-amber-550 rounded-xl text-xs p-2.5 pl-10 text-slate-805 placeholder-slate-400 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.contractorName.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(contract => (
                  <div
                    key={contract.id}
                    onClick={() => setSelectedProjectId(contract.id)}
                    className={`bg-white p-5 rounded-3xl border transition duration-150 cursor-pointer flex flex-col justify-between space-y-4 shadow-sm ${
                      selectedProject?.id === contract.id 
                        ? 'border-amber-500 ring-1 ring-amber-500/30' 
                        : 'border-slate-200 hover:border-slate-350'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[9px] uppercase font-mono tracking-widest text-orange-700 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-500/20 font-black">
                            Contract (Theka) Awarded
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900 mt-2 truncate max-w-[170px]">{contract.name}</h4>
                        </div>
                        <span className="text-xs font-black text-amber-600 font-mono">₹{contract.budget} Lakers</span>
                      </div>

                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {contract.location}
                      </p>

                      <div className="text-[11px] text-slate-550 space-y-1 pt-1.5 border-t border-slate-100">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500">Contractor: <strong className="text-slate-700 font-black">{contract.contractorName}</strong></span>
                          <span className="font-mono text-amber-600 font-black">{contract.progress}% Done</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full" style={{ width: `${contract.progress}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Mobilized: {contract.startDate}</span>
                      <span className="text-slate-800 font-black">₹{contract.spent}L Paid</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Construction Contractor Details Drawer */}
          <div className="lg:col-span-4">
            {selectedProject ? (
              <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-6 sticky top-6 shadow-md animate-fade-in text-slate-800" id="project-details-card">
                
                {/* Header segment components */}
                <div>
                  {selectedProject.isSelfConstructed ? (
                    <span className="text-[9px] uppercase font-mono bg-emerald-500/10 text-emerald-700 py-1 px-2.5 border border-emerald-500/20 rounded-full font-black">
                      🛠️ IN-HOUSE SELF CONSTRUCTED
                    </span>
                  ) : (
                    <span className="text-[9px] uppercase font-mono bg-amber-500/10 text-amber-700 py-1 px-2.5 border border-amber-500/20 rounded-full font-black">
                      🏗️ Under-contract Building
                    </span>
                  )}
                  <h3 className="text-base font-black text-slate-900 mt-3">{selectedProject.name}</h3>
                  <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {selectedProject.location}
                  </p>
                </div>

                {/* Sub-Tabs Selector for Self-Constructed Projects */}
                {selectedProject.isSelfConstructed && (
                  <div className="flex flex-wrap gap-1 border-b border-slate-205 text-[10px] font-bold bg-slate-50 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('details')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                        activeSubTab === 'details' 
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      🚩 Status
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('materials')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                        activeSubTab === 'materials' 
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      🧱 Materials
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('crew')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                        activeSubTab === 'crew' 
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      👷 Labour
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('costing')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                        activeSubTab === 'costing' 
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      💰 Ledger
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('logs')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                        activeSubTab === 'logs' 
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      📋 Logs
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('drawings')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                        activeSubTab === 'drawings' 
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      📄 Drawings
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('safety')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                        activeSubTab === 'safety' 
                          ? 'bg-red-500 text-white font-black shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      🛡️ HSE
                    </button>
                  </div>
                )}

                {/* TAB 1: STATUS & MILESTONES (STANDARD OR DETAILS SUBTAB) */}
                {(!selectedProject.isSelfConstructed || activeSubTab === 'details') && (
                  <div className="space-y-6">
                    {/* Financial Overview Card */}
                    <div className="bg-slate-50 border border-slate-205 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 uppercase font-mono text-[9px] tracking-wider font-bold">
                          {selectedProject.isSelfConstructed ? 'PROJECT ESTIMATED VALUATION' : 'Theka Price Value'}
                        </span>
                        <span className="text-amber-700 font-black font-mono">₹{selectedProject.budget} Lakhs</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 uppercase font-mono text-[9px] tracking-wider font-extrabold">
                          {selectedProject.isSelfConstructed ? 'SITE RAW MATERIAL SPENT' : 'Paid to Builder'}
                        </span>
                        <span className="text-emerald-750 text-emerald-650 text-emerald-600 font-black font-mono">₹{selectedProject.spent} Lakhs</span>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-200">
                        <span className="text-slate-500 text-[9px] font-semibold">
                          {selectedProject.isSelfConstructed ? 'BUDGET MARGIN HEADROOM:' : 'Outstanding Balance:'}
                        </span>
                        <span className="text-slate-705 font-mono text-[10px] font-black">₹{selectedProject.budget - selectedProject.spent} Lakhs</span>
                      </div>

                      {/* Disburse payment buttons ONLY for contractor-style projects */}
                      {!selectedProject.isSelfConstructed && (
                        <div className="grid grid-cols-2 gap-1.5 pt-2">
                          <button
                            type="button"
                            onClick={() => handleDisbursePayment(selectedProject.id, 10)}
                            disabled={selectedProject.spent >= selectedProject.budget}
                            className="bg-white hover:bg-slate-100 border border-slate-300 text-[10px] font-black py-1.5 px-2 rounded-lg text-slate-700 transition"
                          >
                            💳 Disburse ₹10L
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDisbursePayment(selectedProject.id, 25)}
                            disabled={selectedProject.spent >= selectedProject.budget}
                            className="bg-amber-500 hover:bg-amber-600 text-[10px] font-black py-1.5 px-2 rounded-lg text-slate-950 transition shadow-sm"
                          >
                            💳 Disburse ₹25L
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Milestones list section */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider flex justify-between">
                        <span>CONSTRUCTION STAGE MILESTONES</span>
                        <span className="text-amber-600 font-black font-mono">{selectedProject.progress}% Done</span>
                      </h4>
                      
                      <div className="space-y-2">
                        {selectedProject.milestones.map((ms) => (
                          <div
                            key={ms.id}
                            onClick={() => handleToggleMilestone(selectedProject.id, ms.id)}
                            className={`flex justify-between items-center border p-3 rounded-xl cursor-pointer hover:border-amber-500/50 transition-all ${
                              ms.status === 'Done' ? 'border-emerald-300 bg-emerald-500/5' : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="space-y-0.5 max-w-[70%]">
                              <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-2">
                                <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${
                                  ms.status === 'Done' ? 'text-emerald-500' : ms.status === 'In Progress' ? 'text-blue-500' : 'text-slate-300'
                                }`} />
                                <span className={ms.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-850'}>{ms.title}</span>
                              </span>
                              <span className="block text-[8px] text-slate-400 font-mono">Target Due: {ms.dueDate}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                ms.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : ms.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {ms.status}
                              </span>
                              {selectedProject.isSelfConstructed && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMilestone(selectedProject.id, ms.id);
                                  }}
                                  className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Milestone Creator for Self-Constructed Projects only */}
                    {selectedProject.isSelfConstructed && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddNewMilestone(selectedProject.id);
                        }} 
                        className="p-4 bg-amber-50/40 border border-amber-500/10 rounded-2xl space-y-3 shadow-xs"
                      >
                        <h5 className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-amber-800 flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Add In-house Construction Milestone
                        </h5>
                        <div>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. 3rd Floor Slab Casting"
                            value={newMilestoneTitle}
                            onChange={(e) => setNewMilestoneTitle(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg text-[11px] p-2 text-slate-800 focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="date"
                            required
                            value={newMilestoneDueDate}
                            onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded-lg text-[11px] p-2 font-mono text-slate-800"
                          />
                          <button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 rounded-lg text-xs transition"
                          >
                            Create
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* TAB 2: RAW MATERIALS DISPATCHING & CONSUMPTION */}
                {selectedProject.isSelfConstructed && activeSubTab === 'materials' && (
                  <div className="space-y-6">
                    {/* Material Issue Form */}
                    <div className="p-4 bg-slate-50 border border-slate-205 rounded-2xl space-y-3.5">
                      <h4 className="text-[10px] uppercase font-mono font-extrabold text-slate-500 tracking-wider flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-amber-500 animate-pulse" /> Issue Inventory to Building Site
                      </h4>

                      {materials.length === 0 ? (
                        <div className="p-3 text-center text-slate-400 bg-white border border-dashed rounded-xl text-xs">
                          No materials available in warehouse registry. Add items in inventory tab first.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] uppercase font-extrabold text-slate-400 block mb-1">Select Resource</label>
                            <select
                              value={issueMaterialId}
                              onChange={(e) => setIssueMaterialId(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg text-[11px] p-2 text-slate-800"
                            >
                              <option value="">-- Choose Raw Material --</option>
                              {materials.map(m => (
                                <option key={m.id} value={m.id}>
                                  {m.name} ({m.stock} {m.unit} In Stock)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-[9px] uppercase font-extrabold text-slate-400 block mb-1">Quantity to Disburse</label>
                              <input
                                type="number"
                                min={1}
                                value={issueQuantity}
                                onChange={(e) => setIssueQuantity(Math.max(1, Number(e.target.value)))}
                                className="w-full bg-white border border-slate-300 rounded-lg text-[11px] p-2 font-mono text-slate-800"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleIssueMaterialToProject(selectedProject.id)}
                              className="align-bottom bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-4 rounded-lg text-xs mt-4 shrink-0 transition"
                            >
                              Issue Now
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Consumption Log Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-mono tracking-widest font-black text-slate-400">
                        SITE CONSUMPTION LOGS
                      </h4>

                      {(!selectedProject.materialIssues || selectedProject.materialIssues.length === 0) ? (
                        <div className="bg-slate-50 border border-slate-205 border-dashed rounded-xl p-6 text-center text-slate-400 text-xs">
                          <Package className="w-6 h-6 mx-auto text-slate-300" />
                          <p className="mt-2 text-[11px] font-semibold">No materials deployed yet</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Issue cement/steel using the tool above to log exact site cost.</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          {selectedProject.materialIssues.map((item) => (
                            <div key={item.id} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between shadow-xs">
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-extrabold text-slate-800 block font-bold">
                                  {item.materialName}
                                </span>
                                <span className="text-[9px] font-mono font-semibold text-slate-400 block">
                                  Issued: {item.date}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2.2: IN-HOUSE LABOUR CREW & ATTENDANCE */}
                {selectedProject.isSelfConstructed && activeSubTab === 'crew' && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
                        <h4 className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-500 flex items-center gap-1.5">
                          <HardHat className="w-4 h-4 text-amber-500 animate-pulse mt-0.5" /> Project Crew Attendance
                        </h4>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Date:</span>
                          <input
                            type="date"
                            value={selectedAttendanceDate}
                            onChange={(e) => setSelectedAttendanceDate(e.target.value)}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 font-mono text-[10px] text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      {workers.filter(w => w.assignedProjectId === selectedProject.id).length === 0 ? (
                        <div className="text-center p-6 bg-white border border-dashed rounded-xl text-xs text-slate-400">
                          No active crew assigned to this project yet. Use the quick registration form or transfers below to assign manpower!
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {workers
                            .filter(w => w.assignedProjectId === selectedProject.id)
                            .map((w) => {
                              const currentStatus = w.attendance[selectedAttendanceDate] || 'Absent';
                              let statusColor = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                              if (currentStatus === 'Present') statusColor = 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600/20';
                              if (currentStatus === 'Half-Day') statusColor = 'bg-sky-500 hover:bg-sky-600 text-white border-sky-600/20';

                              return (
                                <div key={w.id} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between shadow-xs">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] font-black text-slate-850">{w.name}</span>
                                      <span className="text-[8px] font-mono bg-slate-100 text-slate-550 px-1 py-0.2 rounded font-black uppercase">{w.role}</span>
                                    </div>
                                    <div className="text-[9px] font-semibold text-slate-400">
                                      Rate: ₹{w.dailyWage}/shift • Attendance: {w.totalAttendance || 0} shifts
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => toggleWorkerAttendance(w.id, selectedAttendanceDate)}
                                      className={`text-[9px] font-mono font-black px-2.5 py-1 rounded-lg border transition duration-155 shadow-xs uppercase tracking-wide cursor-pointer ${statusColor}`}
                                    >
                                      {currentStatus}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    {/* Quick Reassign Transfer Option */}
                    {workers.filter(w => w.assignedProjectId !== selectedProject.id).length > 0 && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <label className="text-[9px] uppercase font-black text-slate-405 block tracking-widest font-mono">Transfer Worker to Crew</label>
                        <div className="flex gap-2">
                          <select
                            id="quick-transfer-worker-select"
                            className="flex-1 bg-white border border-slate-300 rounded-lg text-[11px] p-2 text-slate-800"
                            defaultValue=""
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                handleReassignWorker(val);
                                e.target.value = ''; // Reset select option
                              }
                            }}
                          >
                            <option value="">-- Choose Worker to Transfer --</option>
                            {workers
                              .filter(w => w.assignedProjectId !== selectedProject.id)
                              .map(w => (
                                <option key={w.id} value={w.id}>
                                  {w.name} ({w.role} - currently on {w.assignedProjectName || 'No assignment'})
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Direct Register Labor Form */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <button
                        type="button"
                        onClick={() => setShowQuickCrewForm(!showQuickCrewForm)}
                        className="w-full text-left text-xs font-black text-slate-650 text-slate-600 flex items-center justify-between"
                      >
                        <span>{showQuickCrewForm ? '▼ Close Crew Registration' : '▶ Register Crew Member Directly Here'}</span>
                        <span className="text-[10px] bg-slate-200/60 font-mono text-slate-600 px-2 py-0.5 rounded font-bold">+ New Laborer</span>
                      </button>

                      {showQuickCrewForm && (
                        <div className="space-y-2.5 pt-2 border-t border-slate-200">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Name</label>
                              <input
                                type="text"
                                placeholder="FullName"
                                value={quickWorkerName}
                                onChange={(e) => setQuickWorkerName(e.target.value)}
                                className="w-full bg-white border border-slate-305 border-slate-300 rounded text-[10.5px] p-1.5 text-slate-800 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Role</label>
                              <select
                                value={quickWorkerRole}
                                onChange={(e) => setQuickWorkerRole(e.target.value as any)}
                                className="w-full bg-white border border-slate-305 border-slate-300 rounded text-[10.5px] p-1.5 text-slate-800"
                              >
                                <option value="Mason">Mason (Kadiyo)</option>
                                <option value="Laborer">Helper/Laborer (Majdoor)</option>
                                <option value="Carpenter">Carpenter</option>
                                <option value="Plumber">Plumber</option>
                                <option value="Electrician">Electrician</option>
                                <option value="Supervisor">Supervisor (Mukadam)</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Daily Wage Shift Rate (₹)</label>
                              <input
                                type="number"
                                min={100}
                                value={quickWorkerWage}
                                onChange={(e) => setQuickWorkerWage(Number(e.target.value))}
                                className="w-full bg-white border border-slate-305 border-slate-300 rounded text-[10.5px] p-1.5 text-slate-800 font-mono focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleCreateQuickCrew}
                              className="align-bottom bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 rounded text-xs mt-4 transition shadow-xs cursor-pointer"
                            >
                              Add To Crew
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2.3: FINANCIAL LEDGER & SELF COSTING SHEET */}
                {selectedProject.isSelfConstructed && activeSubTab === 'costing' && (() => {
                  const assignedWorkers = workers.filter(w => w.assignedProjectId === selectedProject.id);
                  const materialExpenses = (selectedProject.materialIssues || []).reduce((acc, issue) => {
                    const matInfo = materials.find(m => m.id === issue.materialId);
                    const unitPrice = matInfo ? matInfo.pricePerUnit : 450;
                    return acc + (issue.quantity * unitPrice);
                  }, 0);
                  const materialCostLakhs = Number((materialExpenses / 100000).toFixed(2));

                  const laborExpenses = assignedWorkers.reduce((acc, w) => {
                    return acc + ((w.totalAttendance || 0) * w.dailyWage);
                  }, 0);
                  const laborCostLakhs = Number((laborExpenses / 105000).toFixed(2)); // slight scaling factor to fit standard representation

                  const miscExpensesTotal = (selectedProject.miscExpenses || []).reduce((sum, item) => sum + item.amount, 0);
                  const miscCostLakhs = Number((miscExpensesTotal / 100000).toFixed(2));

                  const totalProjectOutlay = Number((materialCostLakhs + laborCostLakhs + miscCostLakhs).toFixed(2));
                  const estimatedSavings = Number((selectedProject.budget - totalProjectOutlay).toFixed(2));

                  return (
                    <div className="space-y-6">
                      {/* Cost Summary Visualizer Card */}
                      <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-3.5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl translate-x-4 -translate-y-4"></div>
                        <h4 className="text-[9px] uppercase font-mono tracking-widest text-amber-500 font-extrabold">
                          In-House Builder Cost Ledger Analysis
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3 pt-1 border-b border-white/10 pb-3">
                          <div>
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold">Contract Budget Tally</span>
                            <span className="text-sm font-black font-mono text-white">₹{selectedProject.budget} Lakhs</span>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase tracking-wider text-amber-500 block font-black">Actual Outlay Spent</span>
                            <span className="text-sm font-black font-mono text-amber-400">₹{totalProjectOutlay} Lakhs</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-white/5 border border-white/10 p-2.5 rounded-lg">
                          <div>
                            <span className="text-[8.5px] uppercase font-black tracking-wide text-emerald-400 block">Estimated Profit Savings</span>
                            <span className="text-xs text-slate-300 font-medium">In-House savings vs external builder margin</span>
                          </div>
                          <div className="text-right">
                            <span className="text-normal font-black text-emerald-400 font-mono block">
                              ₹{estimatedSavings} Lakhs
                            </span>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/20 uppercase font-mono font-bold">
                              Saved ({(estimatedSavings > 0 ? (estimatedSavings / selectedProject.budget * 100).toFixed(0) : 0)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cashbook expenses Form */}
                      <div className="p-4 bg-slate-50 border border-slate-205 rounded-xl space-y-3.5">
                        <h4 className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-500 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-500 animate-pulse" /> Add Site Expense (Petty Cash Flow)
                        </h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Expense Type</label>
                              <select
                                value={miscCategory}
                                onChange={(e) => setMiscCategory(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg text-[10.5px] p-2 text-slate-800 focus:outline-none"
                              >
                                <option value="Excavation & JCB">Excavation & JCB</option>
                                <option value="Water Tanker">Water Tanker Delivery</option>
                                <option value="Sand / Soil Filling">Sand / Soil Filling</option>
                                <option value="Labor Refreshments">Refreshments / Tea</option>
                                <option value="Conveyance & Petrol">Conveyance Fuel</option>
                                <option value="Consumable Tools">Consumables & Tools</option>
                                <option value="Govt Approvals">Govt Desk Fees</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Cost In Rupees *</label>
                              <input
                                type="number"
                                required
                                min={1}
                                value={miscAmount}
                                onChange={(e) => setMiscAmount(Math.max(1, Number(e.target.value)))}
                                className="w-full bg-white border border-slate-300 rounded-lg text-[10.5px] p-2 font-mono text-slate-800"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Short Description *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Paid JCB tractor rental for site excavation"
                              value={miscDescription}
                              onChange={(e) => setMiscDescription(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg text-[10.5px] p-2 text-slate-800 focus:outline-none"
                            />
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleAddMiscExpense(selectedProject.id)}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-1.5 rounded-lg text-xs transition shadow-sm cursor-pointer border-0"
                          >
                            💸 Record Site Cash Outlay
                          </button>
                        </div>
                      </div>

                      {/* Itemized cost sheets breakdown lists */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] uppercase font-mono tracking-widest font-black text-slate-400">
                          ACTUAL OUTLAYS EXPENSE DETAILS
                        </h4>

                        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-xs">
                          {/* Materials Segment */}
                          <div className="p-3.5 space-y-2">
                            <span className="text-[9px] uppercase font-black text-slate-404 tracking-wider flex justify-between">
                              <span className="text-slate-500 font-bold">🧱 BRICKS & MATERIALS (DISPATCH VALUATION)</span>
                              <span className="font-mono text-slate-900 font-extrabold font-bold">₹{materialCostLakhs} L</span>
                            </span>
                            {(selectedProject.materialIssues || []).length === 0 ? (
                              <span className="text-[10px] text-slate-400 italic block">No material issues logged for this site yet.</span>
                            ) : (
                              <div className="text-[10.5px] text-slate-650 space-y-1">
                                {(selectedProject.materialIssues || []).slice(0, 4).map((issue) => {
                                  const mInfo = materials.find(m => m.id === issue.materialId);
                                  const rate = mInfo ? mInfo.pricePerUnit : 450;
                                  const costRaw = issue.quantity * rate;
                                  return (
                                    <div key={issue.id} className="flex justify-between items-center text-slate-500 font-mono font-semibold">
                                      <span>• {issue.materialName} ({issue.quantity} {issue.unit})</span>
                                      <span>₹{(costRaw).toLocaleString('en-IN')}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Workers Segment */}
                          <div className="p-3.5 space-y-2">
                            <span className="text-[9px] uppercase font-black text-slate-404 tracking-wider flex justify-between">
                              <span className="text-slate-500 font-bold">👷 LABOUR SHIFTS ACCRUAL (WAGES PAID)</span>
                              <span className="font-mono text-slate-900 font-extrabold font-bold">₹{laborCostLakhs} L</span>
                            </span>
                            {assignedWorkers.length === 0 ? (
                              <span className="text-[10px] text-slate-400 italic block">No active crew workers assigned.</span>
                            ) : (
                              <div className="text-[10.5px] text-slate-650 space-y-1">
                                {assignedWorkers.slice(0, 4).map((w) => (
                                  <div key={w.id} className="flex justify-between items-center text-slate-500 font-mono font-semibold">
                                    <span>• {w.name} ({w.totalAttendance || 0} shifts @ ₹{w.dailyWage})</span>
                                    <span>₹{( (w.totalAttendance || 0) * w.dailyWage ).toLocaleString('en-IN')}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Petty cash Segment */}
                          <div className="p-3.5 space-y-2">
                            <span className="text-[9px] uppercase font-black text-slate-404 tracking-wider flex justify-between">
                              <span className="text-slate-500 font-bold">💸 GENERAL INCIDENTALS (SITE PETTY CASH)</span>
                              <span className="font-mono text-slate-900 font-extrabold font-bold">₹{miscCostLakhs} L</span>
                            </span>
                            {(!selectedProject.miscExpenses || selectedProject.miscExpenses.length === 0) ? (
                              <span className="text-[10px] text-slate-400 italic block">No miscellaneous cash spend recorded.</span>
                            ) : (
                              <div className="text-[10.5px] text-slate-650 space-y-1">
                                {selectedProject.miscExpenses.slice(0, 4).map((exp) => (
                                  <div key={exp.id} className="flex justify-between items-center text-slate-500 font-mono font-semibold">
                                    <span>• {exp.description} ({exp.category})</span>
                                    <span>₹{exp.amount.toLocaleString('en-IN')}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* TAB 3: DAILY SITE PROGRESS TIMELINE */}
                {selectedProject.isSelfConstructed && activeSubTab === 'logs' && (
                  <div className="space-y-6">
                    {/* Log Addition Form */}
                    <div className="p-4 bg-slate-50 border border-slate-205 rounded-2xl space-y-3">
                      <h4 className="text-[10px] uppercase font-mono font-black text-slate-500 tracking-wider flex items-center gap-1.5">
                        <ListChecks className="w-4 h-4 text-amber-500" /> Daily Supervisor Site Work Log
                      </h4>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Category</label>
                            <select
                              value={logCategory}
                              onChange={(e) => setLogCategory(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg text-[10.5px] p-2 text-slate-800"
                            >
                              <option value="Slab Casting">Slab Casting / Concrete</option>
                              <option value="Brickwork Masonry">Brickwork Masonry</option>
                              <option value="Plastering/Wiring">Plaster/Wiring</option>
                              <option value="Excavation">Excavation Foundation</option>
                              <option value="Flooring Tiling">Flooring Tiles</option>
                              <option value="Finishing Check">Final Finishing</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Work Log Title</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Columns checked"
                              value={logTitle}
                              onChange={(e) => setLogTitle(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg text-[10.5px] p-2 text-slate-800"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Detailed Site Work Description</label>
                          <textarea
                            rows={2}
                            placeholder="Masons force deployed, cement mix ratio, curing adjustments, etc."
                            value={logDescription}
                            onChange={(e) => setLogDescription(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg text-[10.5px] p-2 text-slate-800 focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddConstructionLog(selectedProject.id)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2 rounded-lg text-xs transition shadow-xs"
                        >
                          📋 Save Daily Site Log
                        </button>
                      </div>
                    </div>

                    {/* Site Progress Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-mono tracking-widest font-black text-slate-400">
                        HISTORIC PROGRESS ENTRIES ({selectedProject.constructionLogs?.length || 0})
                      </h4>

                      {(!selectedProject.constructionLogs || selectedProject.constructionLogs.length === 0) ? (
                        <div className="bg-slate-50 border border-slate-205 border-dashed rounded-xl p-6 text-center text-slate-400 text-xs">
                          <FileText className="w-6 h-6 mx-auto text-slate-300" />
                          <p className="mt-2 text-[11px] font-semibold">No progress entries yet</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Add status entries using the form above to record site progress history.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                          {selectedProject.constructionLogs.map((log) => (
                            <div key={log.id} className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs space-y-1.5 relative">
                              <span className="absolute top-3 right-3 text-[8.5px] font-mono font-semibold text-slate-400">
                                {log.date}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[8px] tracking-wide font-black uppercase font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                  {log.category}
                                </span>
                              </div>
                              <h6 className="text-[11px] font-black text-slate-900 leading-tight">
                                {log.title}
                              </h6>
                              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                {log.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: DRAWINGS & BLUEPRINTS */}
                {activeSubTab === 'drawings' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                      <h4 className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-500 flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-sky-500" /> Upload Architectural Drawing
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Drawing Title</label>
                          <input type="text" value={drawingTitle} onChange={e => setDrawingTitle(e.target.value)} placeholder="Main Floor Plan" className="w-full bg-white border border-slate-300 rounded-lg text-[10.5px] p-2" />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Type</label>
                          <select value={drawingType} onChange={e => setDrawingType(e.target.value as any)} className="w-full bg-white border border-slate-300 rounded-lg text-[10.5px] p-2">
                            <option value="Architectural">Architectural</option>
                            <option value="Structural">Structural</option>
                            <option value="MEP">MEP</option>
                            <option value="Floor Plan">Floor Plan</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Version</label>
                          <input type="text" value={drawingVersion} onChange={e => setDrawingVersion(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg text-[10.5px] p-2" />
                        </div>
                      </div>
                      <button type="button" onClick={() => handleAddDrawing(selectedProject.id)} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black py-2 rounded-lg text-xs transition shadow-sm">
                        📄 Add to Blueprint Library
                      </button>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-mono tracking-widest font-black text-slate-400">BLUEPRINT REPOSITORY ({selectedProject.drawings?.length || 0})</h4>
                      {(!selectedProject.drawings || selectedProject.drawings.length === 0) ? (
                        <div className="text-center p-6 bg-slate-50 border border-dashed rounded-xl text-xs text-slate-400">No blueprints saved for this project.</div>
                      ) : (
                        <div className="space-y-2">
                          {selectedProject.drawings.map(d => (
                            <div key={d.id} className="bg-white border p-3 rounded-lg flex justify-between items-center shadow-xs">
                              <div>
                                <h6 className="text-[11px] font-black">{d.title} <span className="text-[9px] font-mono bg-sky-100 text-sky-700 px-1 py-0.5 rounded ml-1">{d.version}</span></h6>
                                <p className="text-[10px] text-slate-500">{d.type} • Uploaded {d.uploadDate}</p>
                              </div>
                              <span className="text-[9px] uppercase font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded">{d.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: SAFETY & AUDITS */}
                {activeSubTab === 'safety' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                      <h4 className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-500 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-red-500" /> Log Quality & Safety Audit
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Inspector / Agency Name</label>
                          <input type="text" value={auditInspector} onChange={e => setAuditInspector(e.target.value)} placeholder="Suresh Quality Checkers" className="w-full bg-white border border-slate-300 rounded-lg text-[10.5px] p-2" />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Overall HSE Score (0-100)</label>
                          <input type="number" min={0} max={100} value={auditScore} onChange={e => setAuditScore(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-lg text-[10.5px] p-2 font-mono" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Status</label>
                          <select value={auditStatus} onChange={e => setAuditStatus(e.target.value as any)} className="w-full bg-white border border-slate-300 rounded-lg text-[10.5px] p-2">
                            <option value="Pass">Pass - No critical issues</option>
                            <option value="Needs Attention">Needs Attention - Fix within 7 days</option>
                            <option value="Critical Issue">Critical Issue - Immediate halt</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Inspection Notes</label>
                          <textarea value={auditNotes} onChange={e => setAuditNotes(e.target.value)} rows={2} className="w-full bg-white border border-slate-300 rounded-lg text-[10.5px] p-2" />
                        </div>
                      </div>
                      <button type="button" onClick={() => handleAddAudit(selectedProject.id)} className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-black py-2 rounded-lg text-xs transition shadow-sm">
                        🛡️ Log Inspection Result
                      </button>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-mono tracking-widest font-black text-slate-400">INSPECTION LOGS ({selectedProject.safetyAudits?.length || 0})</h4>
                      {(!selectedProject.safetyAudits || selectedProject.safetyAudits.length === 0) ? (
                        <div className="text-center p-6 bg-slate-50 border border-dashed rounded-xl text-xs text-slate-400">No safety audits registered for this site.</div>
                      ) : (
                        <div className="space-y-2">
                          {selectedProject.safetyAudits.map(a => (
                            <div key={a.id} className="bg-white border p-3 rounded-lg shadow-xs space-y-2">
                              <div className="flex justify-between items-center">
                                <h6 className="text-[11px] font-black">{a.inspectorName} <span className="font-mono text-slate-400 ml-1">({a.date})</span></h6>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                  a.status === 'Pass' ? 'bg-emerald-50 text-emerald-600' :
                                  a.status === 'Critical Issue' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                                }`}>{a.status} (Score: {a.score})</span>
                              </div>
                              <p className="text-[10px] text-slate-600 italic">" {a.notes} "</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contractor Details Coordinates */}
                {!selectedProject.isSelfConstructed && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                    <span className="text-[9px] uppercase font-mono text-slate-400 font-black block">Assigned Contractor Company</span>
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-slate-805 font-black">{selectedProject.contractorName}</span>
                      <a
                        href={`tel:${selectedProject.contractorPhone}`}
                        className="text-amber-605 text-amber-600 hover:underline font-mono text-[11px] flex items-center gap-1.5 font-bold"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {selectedProject.contractorPhone}
                      </a>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white border border-slate-200 border-dashed p-8 text-center rounded-3xl h-64 flex flex-col items-center justify-center shadow-inner">
                <Sliders className="w-10 h-10 text-slate-300 animate-pulse" />
                <h4 className="text-slate-600 text-xs font-black mt-3">Select a construction building contract</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Check contractor billing payments schedule, toggle plinth or brickwork milestones, and disburse installation payments.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
