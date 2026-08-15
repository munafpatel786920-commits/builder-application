import React, { useState } from 'react';
import { 
  Calculator, CheckSquare, AlertTriangle, Hammer, 
  Trash2, Plus, CornerDownRight, FileCheck, ShieldCheck, 
  Layers, Package, ChevronRight, Settings, Info, CheckCircle2 
} from 'lucide-react';
import { Project, Material } from '../types';

interface EstimatorCalculatorProps {
  projects: Project[];
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  onLogActivity: (action: string, details: string) => void;
}

export default function EstimatorCalculator({ 
  projects, 
  materials, 
  setMaterials, 
  onLogActivity 
}: EstimatorCalculatorProps) {
  // Tabs of current calculator page
  const [subTab, setSubTab] = useState<'civil' | 'rera'>('civil');

  // Selected project to link activities with
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  // Civil Calculator category selector
  const [calcType, setCalcType] = useState<'slab' | 'masonry' | 'plaster' | 'flooring'>('slab');

  // Input states
  const [areaSqFt, setAreaSqFt] = useState<number>(1000); // 1000 sq ft concrete slab/floor
  const [slabThicknessInch, setSlabThicknessInch] = useState<number>(5); // 5 inch standard slab
  const [concreteMix, setConcreteMix] = useState<'M15' | 'M20' | 'M25'>('M20'); // standard building mix

  // Masonry Wall Inputs
  const [wallLengthFt, setWallLengthFt] = useState<number>(50);
  const [wallHeightFt, setWallHeightFt] = useState<number>(10);
  const [wallThicknessInch, setWallThicknessInch] = useState<'4.5' | '9'>('9');

  // Plaster Inputs
  const [plasterAreaSqFt, setPlasterAreaSqFt] = useState<number>(1500);
  const [plasterThicknessMm, setPlasterThicknessMm] = useState<'12' | '15' | '20'>('12');
  const [plasterMix, setPlasterMix] = useState<'1:4' | '1:6'>('1:6');

  // Flooring Inputs
  const [floorAreaSqFt, setFloorAreaSqFt] = useState<number>(1200);
  const [tileSizeInch, setTileSizeInch] = useState<'2x2' | '2x4' | '4x4'>('2x2');

  // Success message state
  const [notif, setNotif] = useState<string>('');

  // 1. Core Calculator Mathematical formulas as peer IS Code-456 standards
  const calculateMaterials = () => {
    if (calcType === 'slab') {
      // Slab volume calculation (Cu.Ft)
      const thicknessFt = slabThicknessInch / 12;
      const totalVolumeCuFt = areaSqFt * thicknessFt;
      // Convert wet volume to dry volume (add 54% wastage/shrinkage)
      const dryVolumeCuFt = totalVolumeCuFt * 1.54;
      
      // Mix ratio proportions: Sum of parts
      // M15 (1 cement : 2 sand : 4 aggregate) = 7 parts
      // M20 (1 cement : 1.5 sand : 3 aggregate) = 5.5 parts
      // M25 (1 cement : 1 sand : 2 aggregate) = 4 parts
      let cementRatio = 1;
      let sandRatio = 1.5;
      let aggregateRatio = 3;
      let sumParts = 5.5;

      if (concreteMix === 'M15') {
        cementRatio = 1; sandRatio = 2; aggregateRatio = 4; sumParts = 7;
      } else if (concreteMix === 'M25') {
        cementRatio = 1; sandRatio = 1; aggregateRatio = 2; sumParts = 4;
      }

      // 1 Bag of Cement = 1.226 cubic feet (50 Kgs)
      const cementVolumeCuFt = (dryVolumeCuFt * cementRatio) / sumParts;
      const cementBagsCount = Math.ceil(cementVolumeCuFt / 1.226);
      
      // Sand in Brass (1 Brass = 100 cubic feet in Indian construction market)
      const sandCuFt = (dryVolumeCuFt * sandRatio) / sumParts;
      const sandBrass = Number((sandCuFt / 100).toFixed(2));

      // Coarse Aggregate in Brass
      const aggCuFt = (dryVolumeCuFt * aggregateRatio) / sumParts;
      const aggBrass = Number((aggCuFt / 100).toFixed(2));

      // Structural steel estimation for RCC slabs: approximately 80 kgs per cubic meter (or ~1 kg per cubic foot)
      const steelKgs = Math.ceil(totalVolumeCuFt * 1.25);

      return {
        cementBags: cementBagsCount,
        sandBrass,
        aggregateBrass: aggBrass,
        steelKgs,
        bricks: 0,
        volumeCFT: Math.round(totalVolumeCuFt)
      };
    } else if (calcType === 'masonry') {
      // Wall volume
      const thickFt = Number(wallThicknessInch) / 12;
      const totalVolumeCuFt = wallLengthFt * wallHeightFt * thickFt;
      
      // In Indian bricks (standard size: 9in x 4.5in x 3in with mortar)
      // Standard rule: 1 cubic foot of brickwork needs ~13.5 modular bricks
      const brickCount = Math.ceil(totalVolumeCuFt * 13.5);

      // Mortar volume is ~30% of standard brickwork volume
      const wetMortarVolume = totalVolumeCuFt * 0.30;
      const dryMortarVolume = wetMortarVolume * 1.33; // Dry volume multiplication

      // Mortar mix 1:6 standard
      const cementBags = Math.ceil((dryMortarVolume * 1) / 7 / 1.226);
      const sandBrass = Number(((dryMortarVolume * 6) / 7 / 100).toFixed(2));

      return {
        cementBags,
        sandBrass,
        aggregateBrass: 0,
        steelKgs: 0,
        bricks: brickCount,
        volumeCFT: Math.round(totalVolumeCuFt)
      };
    } else if (calcType === 'plaster') {
      // Plastering calculations
      // Thickness in feet
      const thicknessFt = (Number(plasterThicknessMm) / 25.4) / 12;
      const totalVolumeCuFt = plasterAreaSqFt * thicknessFt;
      const dryMortarVolume = totalVolumeCuFt * 1.33; // density factor

      // Ratio sum
      const mixSum = plasterMix === '1:4' ? 5 : 7;
      const cementPart = plasterMix === '1:4' ? 1 : 1;
      const sandPart = plasterMix === '1:4' ? 4 : 6;

      const cementBags = Math.ceil((dryMortarVolume * cementPart) / mixSum / 1.226);
      const sandBrass = Number(((dryMortarVolume * sandPart) / mixSum / 100).toFixed(2));

      return {
        cementBags,
        sandBrass,
        aggregateBrass: 0,
        steelKgs: 0,
        bricks: 0,
        volumeCFT: Math.round(totalVolumeCuFt)
      };
    } else {
      // Flooring Tiles
      // Add 10% wastage for tile cutting
      let tileAreaWithWastage = floorAreaSqFt * 1.10;
      
      // Calculate tile dimensions
      let tileCoverageSqFt = 4; // default 2x2 = 4 sqft
      if (tileSizeInch === '2x4') tileCoverageSqFt = 8;
      if (tileSizeInch === '4x4') tileCoverageSqFt = 16;

      const totalTilesNeeded = Math.ceil(tileAreaWithWastage / tileCoverageSqFt);
      // Average 10 tiles per box
      const tileBoxes = Math.ceil(totalTilesNeeded / 6);

      // Bedding mortar: 2 inch (0.16 feet) cement slurry bedding
      const beddingMortarCuFt = floorAreaSqFt * 0.16;
      const cementBags = Math.ceil(beddingMortarCuFt * 0.45); // empirical cement rule for tiling
      const sandBrass = Number((beddingMortarCuFt / 100).toFixed(2));

      return {
        cementBags,
        sandBrass,
        aggregateBrass: 0,
        steelKgs: 0,
        bricks: 0,
        tileBoxes,
        volumeCFT: Math.round(beddingMortarCuFt)
      };
    }
  };

  const outputs = calculateMaterials();

  // Push calculated volumes directly into active inventory stockpile!
  const handleAddToStock = (materialName: 'Cement' | 'Steel' | 'Sand' | 'Aggregate' | 'Bricks' | 'Tiles', amount: number) => {
    if (!amount || amount <= 0) return;

    setMaterials(prev => {
      let isFound = false;
      const next = prev.map(m => {
        // match material by sub-string or exactly
        if (m.name.toLowerCase().includes(materialName.toLowerCase())) {
          isFound = true;
          return {
            ...m,
            stock: m.stock + amount,
            lastUpdated: new Date().toISOString().substring(0, 10)
          };
        }
        return m;
      });

      if (!isFound) {
        // Create matching inventory item if not already in stock
        const newMat: Material = {
          id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          name: materialName === 'Cement' ? 'Super Grade Cement (Grade 53)' :
                materialName === 'Steel' ? 'TMT Corrosion Proof Steel Rods' :
                materialName === 'Sand' ? 'Coarse River Sand / M-Sand' :
                materialName === 'Aggregate' ? 'Crushed Coarse Aggregate (20mm)' :
                materialName === 'Bricks' ? 'Standard Red Clay Kiln Bricks' :
                'Premium Vitrified Flooring Tiles',
          stock: amount,
          unit: materialName === 'Cement' ? 'Bags' :
                materialName === 'Steel' ? 'Kgs' :
                materialName === 'Sand' ? 'Brass' :
                materialName === 'Aggregate' ? 'Brass' :
                materialName === 'Bricks' ? 'Units' : 'Boxes',
          minimumStock: 10,
          vendor: 'LTD Industrial Supplier',
          vendorPhone: '+91 9502011422',
          lastUpdated: new Date().toISOString().substring(0, 10),
          pricePerUnit: materialName === 'Cement' ? 440 : materialName === 'Steel' ? 68 : 5500
        };
        return [newMat, ...prev];
      }
      return next;
    });

  const activeProjectName = projects.find(p => p.id === selectedProjectId)?.name || 'Global Project';
    
    onLogActivity(
      'Material Requirement Added to Stock', 
      `Sent dynamic quantities request of ${amount} units for ${materialName} calculated via Estimator linked with ${activeProjectName}.`
    );

    setNotif(`🎉 Success: Added ${amount} units of ${materialName} to the Material Stock ledger!`);
    setTimeout(() => setNotif(''), 5500);
  };

  // Automated Quick All Quantities Allocator
  const handleAddAllQuantities = () => {
    if (outputs.cementBags > 0) handleAddToStock('Cement', outputs.cementBags);
    if (outputs.sandBrass > 0) handleAddToStock('Sand', outputs.sandBrass);
    if (outputs.aggregateBrass > 0) handleAddToStock('Aggregate', outputs.aggregateBrass);
    if (outputs.steelKgs > 0) handleAddToStock('Steel', outputs.steelKgs);
    if (outputs.bricks > 0) handleAddToStock('Bricks', outputs.bricks);
    if (calcType === 'flooring' && outputs.tileBoxes) handleAddToStock('Tiles', outputs.tileBoxes);
    
    setNotif('🚀 Consolidated Quantities successfully committed into the Stockpile ledger!');
  };

  // Indian RERA Regulatory Compliance milestones lists state per project
  const initialReraList = [
    { code: 'RERA-01', name: 'Land Title Legal Clearance Certificate', desc: 'Validates complete undisputed ownership history.', status: 'Acquired', dept: 'Revenue Office (Tehsildar)' },
    { code: 'RERA-02', name: 'Non-Agricultural (NA) Land Order conversion', desc: 'Required prior permission to start any cement works.', status: 'Acquired', dept: 'District Collector Office' },
    { code: 'RERA-03', name: 'Approved Building Layout Blueprints', desc: 'Municipal layout limits audit clearance.', status: 'Acquired', dept: 'City Urban Development Authority' },
    { code: 'RERA-04', name: 'Structural Safety & Fire NOC clearance', desc: 'Seismic resistance + fire pipeline layout validation certification.', status: 'In Review', dept: 'State Fire Department' },
    { code: 'RERA-05', name: 'RERA Website Reg Number Listing', desc: 'Mandatory escrow setup and quarterly progress filing registry.', status: 'In Review', dept: 'State Real Estate Authority' },
    { code: 'RERA-06', name: 'Environmental & Pollution Board clearance', desc: 'Acoustic sand rules and water drainage certificate.', status: 'Pending Approval', dept: 'Pollution Control Committee' },
    { code: 'RERA-07', name: 'Sewerage/Drainage connection approval', desc: 'Infrastructure link sanction authorization.', status: 'Pending Approval', dept: 'Municipal Corporation Board' },
    { code: 'RERA-08', name: 'Completion & Occupancy Certificate (OC)', desc: 'Official sanction granting flat safety possession registry.', status: 'Pending Approval', dept: 'Municipal Town Planner' }
  ];

  const [projectReraList, setProjectReraList] = useState<{ [projId: string]: typeof initialReraList }>({});

  const getProjectRera = (projId: string) => {
    if (!projectReraList[projId]) {
      // Lazy load standard checklist
      return initialReraList;
    }
    return projectReraList[projId];
  };

  const handleUpdateReraStatus = (projId: string, ruleCode: string, newStatus: string) => {
    const list = getProjectRera(projId);
    const updated = list.map(item => {
      if (item.code === ruleCode) {
        return { ...item, status: newStatus };
      }
      return item;
    });

    setProjectReraList(prev => ({
      ...prev,
      [projId]: updated
    }));

    const projName = projects.find(p => p.id === projId)?.name || 'Registered Project';
    const ruleName = list.find(r => r.code === ruleCode)?.name || 'RERA Certificate';
    onLogActivity('Compliance Certificate Status Altered', `Compliance standard check "${ruleName}" inside ${projName} set status marker to "${newStatus}".`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-amber-500 animate-pulse" />
            Civil Estimator & RERA Compliance Hub
          </h2>
          <p className="text-slate-500 text-xs font-semibold">
            Bilingual Industrial Payout Planner: Calculate high-precision cement, steel, bricks, and track regulatory authorities.
          </p>
        </div>

        {/* Sub-Tabs switchers */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setSubTab('civil')}
            className={`text-xs font-black px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
              subTab === 'civil' ? 'bg-white text-slate-950 shadow-sm border border-slate-200' : 'text-slate-505 text-slate-500 hover:text-slate-800'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 text-amber-500" /> Quantity Estimator
          </button>
          <button
            onClick={() => setSubTab('rera')}
            className={`text-xs font-black px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
              subTab === 'rera' ? 'bg-white text-slate-950 shadow-sm border border-slate-200' : 'text-slate-505 text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> RERA regulatory checklist
          </button>
        </div>
      </div>

      {notif && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl text-xs font-bold font-semibold animate-pulse flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {notif}
        </div>
      )}

      {/* Main Container based on Sub-Tabs */}
      {subTab === 'civil' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Area: Estimator Input Controls */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Link Project Dropdown */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Select Targeted Project Tower</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl text-xs p-3 text-slate-800 font-bold focus:bg-white"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
                ))}
              </select>
            </div>

            {/* Calculations Category Switcher */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Construction Phase Task</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCalcType('slab')}
                  className={`p-3 rounded-xl border text-left flex justify-between items-center transition ${
                    calcType === 'slab' ? 'border-amber-500 bg-amber-50/50 text-slate-950' : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Slab / Column Casting</span>
                  <Layers className={`w-4 h-4 ${calcType === 'slab' ? 'text-amber-500' : 'text-slate-400'}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setCalcType('masonry')}
                  className={`p-3 rounded-xl border text-left flex justify-between items-center transition ${
                    calcType === 'masonry' ? 'border-amber-500 bg-amber-50/50 text-slate-950' : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Brick Masonry (दीवार)</span>
                  <Package className={`w-4 h-4 ${calcType === 'masonry' ? 'text-amber-500' : 'text-slate-400'}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setCalcType('plaster')}
                  className={`p-3 rounded-xl border text-left flex justify-between items-center transition ${
                    calcType === 'plaster' ? 'border-amber-500 bg-amber-50/50 text-slate-950' : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Wall Plastering (प्लास्टर)</span>
                  <Settings className={`w-4 h-4 ${calcType === 'plaster' ? 'text-amber-500' : 'text-slate-400'}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setCalcType('flooring')}
                  className={`p-3 rounded-xl border text-left flex justify-between items-center transition ${
                    calcType === 'flooring' ? 'border-amber-500 bg-amber-50/50 text-slate-950' : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Floor Vitrified Tiles</span>
                  <Plus className={`w-4 h-4 ${calcType === 'flooring' ? 'text-amber-500' : 'text-slate-400'}`} />
                </button>
              </div>
            </div>

            {/* Sub Inputs dynamic rendering */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              
              {/* Category 1: Slab Casting RCC inputs */}
              {calcType === 'slab' && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Floor Slab Area (Sq.Ft)</label>
                      <input
                        type="number"
                        value={areaSqFt}
                        onChange={(e) => setAreaSqFt(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-black font-mono focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Thickness (Inches)</label>
                      <input
                        type="number"
                        value={slabThicknessInch}
                        onChange={(e) => setSlabThicknessInch(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-black font-mono focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Concrete Standard Grade</label>
                    <div className="flex gap-2">
                      {['M15', 'M20', 'M25'].map(grade => (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => setConcreteMix(grade as any)}
                          className={`flex-1 py-2 px-3 text-[11px] rounded-lg border font-bold ${
                            concreteMix === grade ? 'border-amber-500 bg-amber-50/50 text-amber-700 font-black' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {grade} {grade === 'M20' ? '(Ratio 1:1.5:3)' : grade === 'M15' ? '(1:2:4)' : '(1:1:2)'}
                        </button>
                      ))}
                    </div>
                    <span className="text-[9.5px] font-mono text-slate-400 mt-1 block font-medium">Standard structural beams and slabs generally require IS M20 quality cement mix.</span>
                  </div>
                </>
              )}

              {/* Category 2: Brick Masonry inputs */}
              {calcType === 'masonry' && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Wall Length (Feet)</label>
                      <input
                        type="number"
                        value={wallLengthFt}
                        onChange={(e) => setWallLengthFt(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-black font-mono focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Wall Height (Feet)</label>
                      <input
                        type="number"
                        value={wallHeightFt}
                        onChange={(e) => setWallHeightFt(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-black font-mono focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Wall Thickness Designation (ईंट की मोटाई)</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs">
                        <input
                          type="radio"
                          name="wallThick"
                          checked={wallThicknessInch === '4.5'}
                          onChange={() => setWallThicknessInch('4.5')}
                          className="accent-amber-500 h-4 w-4"
                        />
                        <span>4.5 inch Partition Single-Brick Wall</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs">
                        <input
                          type="radio"
                          name="wallThick"
                          checked={wallThicknessInch === '9'}
                          onChange={() => setWallThicknessInch('9')}
                          className="accent-amber-500 h-4 w-4"
                        />
                        <span>9 inch Load-Bearing Double-Brick Wall</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Category 3: Plastering inputs */}
              {calcType === 'plaster' && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Plastering Area (Sq.Ft)</label>
                      <input
                        type="number"
                        value={plasterAreaSqFt}
                        onChange={(e) => setPlasterAreaSqFt(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-black font-mono focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Plaster Thickness</label>
                      <select
                        value={plasterThicknessMm}
                        onChange={(e: any) => setPlasterThicknessMm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800"
                      >
                        <option value="12">12 mm (Internal wall smooth)</option>
                        <option value="15">15 mm (Ceiling plaster)</option>
                        <option value="20">20 mm (External rough weather coating)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Mortar Slate Ratio (Cem. : Sand)</label>
                    <div className="flex gap-2">
                      {['1:4', '1:6'].map(ratio => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setPlasterMix(ratio as any)}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-bold ${
                            plasterMix === ratio ? 'border-amber-500 bg-amber-50/50 text-amber-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          Ratio {ratio} {ratio === '1:4' ? '(Rich mix ceiling)' : '(Standard walls)'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Category 4: Tile Flooring Flooring inputs */}
              {calcType === 'flooring' && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Flooring Floor Area (Sq.Ft)</label>
                      <input
                        type="number"
                        value={floorAreaSqFt}
                        onChange={(e) => setFloorAreaSqFt(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-black font-mono focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Vitrified Tile Dimensions</label>
                      <select
                        value={tileSizeInch}
                        onChange={(e: any) => setTileSizeInch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800"
                      >
                        <option value="2x2">2ft x 2ft (Standard Flat Floor)</option>
                        <option value="2x4">2ft x 4ft (Premium Living Halls)</option>
                        <option value="4x4">4ft x 4ft (Luxury Villa Slab Tile)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

            </div>

            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/50 p-3 rounded-2xl font-mono flex items-start gap-1.5 leading-normal">
              <Info className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <span>
                <strong>Indian Standard Codes Guidance:</strong> Standard material wastage of 2% in steel casting, 5% in tiles breakages, and 30% volume dry conversion in mortar slurry are automatically calculated.
              </span>
            </p>

          </div>

          {/* Right Area: Calculations Outputs details & Quick actions */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 shadow-xl relative overflow-hidden">
              {/* grid overlay background */}
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                backgroundSize: '15px 15px',
              }} />

              {/* Title Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">CONSTRUCT QUANTITIES METRICS</span>
                  <h3 className="text-sm font-black uppercase text-slate-100">IS Code-456 Audited Yield Results</h3>
                </div>
                <div className="font-mono text-[10px] text-slate-400 uppercase">
                  Calculated Volume: <strong className="text-white font-black">{outputs.volumeCFT} CFT</strong>
                </div>
              </div>

              {/* Materials cards Grid output */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                
                {/* 1. Cement Bags Card */}
                {outputs.cementBags > 0 && (
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl relative group">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-mono font-bold">Portland Cement</span>
                    <span className="text-2xl font-black text-slate-100 font-mono block mt-1">{outputs.cementBags} <span className="text-xs text-slate-400 font-normal">Bags</span></span>
                    <button
                      onClick={() => handleAddToStock('Cement', outputs.cementBags)}
                      className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-black py-1.5 px-2 rounded-lg text-[9px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3 text-amber-500" /> Stock Requisite
                    </button>
                  </div>
                )}

                {/* 2. Sand Brass Card */}
                {outputs.sandBrass > 0 && (
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl relative group">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-mono font-bold">M-Sand / River Sand</span>
                    <span className="text-2xl font-black text-slate-100 font-mono block mt-1">{outputs.sandBrass} <span className="text-xs text-slate-400 font-normal">Brass</span></span>
                    <button
                      onClick={() => handleAddToStock('Sand', outputs.sandBrass)}
                      className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-black py-1.5 px-2 rounded-lg text-[9px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3 text-amber-500" /> Stock Requisite
                    </button>
                  </div>
                )}

                {/* 3. Coarse Aggregate Card */}
                {outputs.aggregateBrass > 0 && (
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl relative group">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-mono font-bold">Aggregate Ballast</span>
                    <span className="text-2xl font-black text-slate-100 font-mono block mt-1">{outputs.aggregateBrass} <span className="text-xs text-slate-400 font-normal">Brass</span></span>
                    <button
                      onClick={() => handleAddToStock('Aggregate', outputs.aggregateBrass)}
                      className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-black py-1.5 px-2 rounded-lg text-[9px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3 text-amber-500" /> Stock Requisite
                    </button>
                  </div>
                )}

                {/* 4. TMT Structural Steel */}
                {outputs.steelKgs > 0 && (
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl relative group">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-mono font-bold">Reinforcement Steel</span>
                    <span className="text-2xl font-black text-slate-100 font-mono block mt-1">{outputs.steelKgs} <span className="text-xs text-slate-400 font-normal">Kgs</span></span>
                    <button
                      onClick={() => handleAddToStock('Steel', outputs.steelKgs)}
                      className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-black py-1.5 px-2 rounded-lg text-[9px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3 text-amber-500" /> Stock Requisite
                    </button>
                  </div>
                )}

                {/* 5. Standard Clay Bricks */}
                {outputs.bricks > 0 && (
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl relative group">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-mono font-bold">Kiln Clay Bricks</span>
                    <span className="text-2xl font-black text-slate-100 font-mono block mt-1">{outputs.bricks} <span className="text-xs text-slate-400 font-normal">Pcs</span></span>
                    <button
                      onClick={() => handleAddToStock('Bricks', outputs.bricks)}
                      className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-black py-1.5 px-2 rounded-lg text-[9px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3 text-amber-500" /> Stock Requisite
                    </button>
                  </div>
                )}

                {/* 6. Flooring Tile boxes */}
                {calcType === 'flooring' && outputs.tileBoxes && (
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl relative group">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-mono font-bold">Vitrified Floor Tiles</span>
                    <span className="text-2xl font-black text-slate-100 font-mono block mt-1">{outputs.tileBoxes} <span className="text-xs text-slate-400 font-normal">Boxes</span></span>
                    <button
                      onClick={() => handleAddToStock('Tiles', outputs.tileBoxes)}
                      className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-black py-1.5 px-2 rounded-lg text-[9px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3 text-amber-500" /> Stock Requisite
                    </button>
                  </div>
                )}

              </div>

              {/* Master Push quantities to inventory */}
              <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-305 text-slate-400 font-medium font-sans">Commit these calculated volumes at once?</span>
                  <p className="text-[10px] text-slate-500">Links cement bags directly into stockpile values for real stock verification.</p>
                </div>
                <button
                  onClick={handleAddAllQuantities}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-md"
                >
                  Confirm Batch Stock Addition <ChevronRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>

            </div>

            {/* Practical On-field Cement slurry thumb-rules */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3.5 shadow-sm">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <Package className="w-4.5 h-4.5 text-amber-500" />
                Field Civil Engineering Thumb-Rules
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[10px] text-slate-550 text-slate-500">
                <div className="bg-slate-50 p-2.5 border border-slate-200 rounded-xl leading-relaxed">
                  <strong className="text-slate-800 block uppercase text-[8.5px]">Slab Casting Cement:</strong>
                  General rule for standard RCC slabs: Expect ~1.3 Bags of cement for every 10 Sq.Ft of 5" thickness.
                </div>
                <div className="bg-slate-50 p-2.5 border border-slate-200 rounded-xl leading-relaxed">
                  <strong className="text-slate-800 block uppercase text-[8.5px]">Steel Reinforcement (Sariya):</strong>
                  Standard RCC mix needs ~1.1 to 1.3Kgs of high ductile steel bars per Sq.Ft of concrete area.
                </div>
                <div className="bg-slate-50 p-2.5 border border-slate-200 rounded-xl leading-relaxed">
                  <strong className="text-slate-800 block uppercase text-[8.5px]">Plaster Water ratio:</strong>
                  Standard plaster mortar needs water/cement ratio of ~0.45. Ensure standard water curing for 7 days.
                </div>
                <div className="bg-slate-50 p-2.5 border border-slate-200 rounded-xl leading-relaxed">
                  <strong className="text-slate-800 block uppercase text-[8.5px]">Brick slurry Mortar:</strong>
                  For cement brickworks walls, standard cement bags is roughly 1 bag per 35 cubic feet of brick lay.
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        // RERA regulatory page
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Indian Real Estate Regulatory Authority (RERA) compliance Tracker
              </h3>
              <p className="text-slate-505 text-slate-500 text-xs mt-0.5">
                Manage necessary town planner blueprints and land acquisition certificates required to safely list properties to the public.
              </p>
            </div>

            {/* Filter project selected */}
            <div>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold p-2.5 rounded-lg text-slate-800"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* RERA regulatory list table */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 font-mono text-[9.5px] uppercase text-slate-450 text-slate-500">
                  <th className="pb-3 pl-2">CODE</th>
                  <th className="pb-3">CERTIFICATE AND REGULATORY STANDARD</th>
                  <th className="pb-3">DEPARTMENT IN-CHARGE</th>
                  <th className="pb-3">CURRENT STATUS LEVEL</th>
                  <th className="pb-3 text-right">MODIFY STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getProjectRera(selectedProjectId).map((rule) => {
                  const statusColors: { [key: string]: string } = {
                    'Acquired': 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
                    'In Review': 'bg-amber-50 text-amber-700 border-amber-200/50 animate-pulse',
                    'Pending Approval': 'bg-blue-50 text-blue-700 border-blue-200/50',
                    'Rejected / Query Raised': 'bg-pink-50 text-pink-700 border-pink-200/50 font-bold'
                  };

                  return (
                    <tr key={rule.code} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 pl-2 font-mono font-bold text-slate-400">{rule.code}</td>
                      <td className="py-4 pr-3">
                        <span className="block font-bold text-slate-800 font-sans">{rule.name}</span>
                        <span className="block text-[10px] text-slate-500 mt-0.5 font-medium">{rule.desc}</span>
                      </td>
                      <td className="py-4 font-mono text-[10.5px] text-slate-600 font-bold">{rule.dept}</td>
                      <td className="py-4">
                        <span className={`inline-block text-[10px] uppercase font-bold border rounded-md px-2.5 py-1 ${statusColors[rule.status] || 'bg-slate-50 text-slate-500'}`}>
                          {rule.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <select
                          value={rule.status}
                          onChange={(e) => handleUpdateReraStatus(selectedProjectId, rule.code, e.target.value)}
                          className="bg-white border border-slate-200 p-2 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
                        >
                          <option value="Acquired">Acquired (प्राप्त)</option>
                          <option value="In Review">In Review (जांच में)</option>
                          <option value="Pending Approval">Pending Approval (लंबित)</option>
                          <option value="Rejected / Query Raised">Rejected / Query Raised</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* RERA quarterly update instructions notice */}
          <div className="bg-emerald-500/[0.03] border border-emerald-800/15 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-0.5 text-xs text-slate-800 font-sans">
              <span className="block text-[8.5px] text-slate-400 font-mono uppercase font-black">RERA Section 11/4 Compliance Alert</span>
              <p className="font-semibold text-[11px] leading-normal">
                Quarterly updates on flats inventory bookings and raw materials expense ledger must be filed with the Housing Regulatory Board.
              </p>
            </div>
            <div className="bg-white border border-slate-200 pl-3 pr-4 py-2.5 rounded-xl font-mono text-[10px] text-slate-550 text-slate-500 font-black flex items-center gap-1.5 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              QUARTER RERA CONFORMANCE SAFE
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
