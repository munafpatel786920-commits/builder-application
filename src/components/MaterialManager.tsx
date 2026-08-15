import React, { useState } from 'react';
import { Material } from '../types';
import { i18n, Language } from '../i18n';
import { AlertTriangle, Plus, Search, HelpCircle, Phone, RefreshCw, ShoppingCart, Info, TrendingUp } from 'lucide-react';

interface MaterialManagerProps {
  lang: Language;
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  onLogActivity: (action: string, details: string) => void;
}

export default function MaterialManager({ lang, materials, setMaterials, onLogActivity }: MaterialManagerProps) {
  const t = i18n[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New stock form states
  const [name, setName] = useState('');
  const [stock, setStock] = useState(200);
  const [unit, setUnit] = useState('Bags');
  const [minimumStock, setMinimumStock] = useState(150);
  const [vendor, setVendor] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState(440);

  // Buy state simulator
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(materials[0]?.id || null);
  const selectedMaterial = materials.find(m => m.id === selectedMaterialId) || materials[0] || null;
  const [orderQuantity, setOrderQuantity] = useState(100);

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMat: Material = {
      id: `mat-${Date.now()}`,
      name: name,
      stock: Number(stock),
      unit: unit,
      minimumStock: Number(minimumStock),
      vendor: vendor || 'Direct Site Supplier',
      vendorPhone: vendorPhone || '+91 99000 11223',
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      pricePerUnit: Number(pricePerUnit)
    };

    setMaterials(prev => [newMat, ...prev]);
    onLogActivity('Added Inventory Stock line', `Logged ${name} (${stock} ${unit}) with supplier ${newMat.vendor}.`);

    setName('');
    setStock(200);
    setVendor('');
    setVendorPhone('');
    setShowAddForm(false);
    alert('🎉 Materials card added successfully to Global inventory roll.');
  };

  const handleReplenishStock = (materialId: string, quantity: number) => {
    setMaterials(prev => prev.map(m => {
      if (m.id !== materialId) return m;
      const nextStock = Number((m.stock + quantity).toFixed(1));
      return {
        ...m,
        stock: nextStock,
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
    }));

    const target = materials.find(m => m.id === materialId);
    if (target) {
      const orderCost = Math.round(quantity * target.pricePerUnit);
      alert(`🎉 Purchase Order Disbursed!\n\nAdded ${quantity} ${target.unit} to local ledger for ${target.name}.\nTotal invoice value: ₹${orderCost.toLocaleString('en-IN')} logged to project expense sheet.`);
      onLogActivity('Stock replenishment updated', `Ordered ${quantity} ${target.unit} of ${target.name} costing ₹${orderCost}.`);
    }
  };

  const filtered = materials.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Cumulative inventory asset value calculation
  const totalAssetValue = materials.reduce((acc, m) => acc + (m.stock * m.pricePerUnit), 0);

  return (
    <div className="space-y-8 animate-fade-in text-slate-800" id="material-manager">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-amber-500 animate-pulse" />
            Materials & Inventory Ledger
          </h2>
          <p className="text-slate-505 text-slate-500 text-xs text-xs font-semibold">Maintain real-time cement bags, TMT steel, bricks counting, and receive automatic threshold alerts.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white border border-slate-300 hover:border-amber-500 hover:text-amber-655 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-sm ml-auto md:ml-0"
        >
          <Plus className="w-4 h-4 text-amber-500" /> {showAddForm ? 'Close Entry Form' : 'Register New Resource'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateMaterial} className="bg-slate-50 border border-slate-205 p-6 rounded-2xl space-y-4 max-w-4xl mx-auto shadow-inner animate-fade-in">
          <h3 className="text-xs uppercase font-mono tracking-widest text-amber-600 font-extrabold">New Material Line entry</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Resource Name *</label>
              <input
                type="text"
                required
                placeholder="Ultratech High Portland Cement"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800"
              />
            </div>
            
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Standard Price (INR per unit)</label>
              <input
                type="number"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Current Stock Quantity</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-lg text-xs p-2.5 text-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Unit Type</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-slate-305 text-slate-800 p-2.5 rounded-lg text-xs focus:outline-none"
              >
                <option value="Bags">Bags (Cement/Plaster)</option>
                <option value="Tons">Tons (Reinforcement Steel)</option>
                <option value="Pieces">Pieces (Fly-ash Bricks/Blocks)</option>
                <option value="Boxes">Boxes (Ceramic Flooring)</option>
                <option value="Brass">Brass (Coarse Sand aggregates)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Low Stock Warning Threshold Limit</label>
              <input
                type="number"
                value={minimumStock}
                onChange={(e) => setMinimumStock(Number(e.target.value))}
                className="w-full bg-white border border-slate-305 text-slate-800 p-2.5 rounded-lg text-xs font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Authorized Vendor Contact</label>
              <input
                type="text"
                placeholder="Ultratech Authorized Agency Ahmedabad"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Vendor Telephone Number</label>
              <input
                type="text"
                placeholder="+91 91234 44321"
                value={vendorPhone}
                onChange={(e) => setVendorPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs transition shadow-sm"
          >
            Create Item & Track Critical Alert Rules
          </button>
        </form>
      )}

      {/* Live Financial Asset Bar indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex justify-between items-center shadow-sm">
          <div>
            <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Consolidated Site Asset Net Value</span>
            <span className="text-xl font-black text-amber-600 font-mono">₹{Math.round(totalAssetValue).toLocaleString('en-IN')}</span>
          </div>
          <TrendingUp className="w-8 h-8 text-amber-500/30" />
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex justify-between items-center text-xs shadow-sm">
          <div>
            <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Automatic low-stock checks status</span>
            <span className="font-black text-emerald-600 flex items-center gap-1.5 mt-1.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Standard threshold alerts online
            </span>
          </div>
          <Info className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Main Search Inventory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inventory list pane */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-205 flex items-center gap-3 shadow-sm">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search resource: cement, steel, bricks (Fly-ash)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 rounded-lg text-xs py-2 px-3 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="space-y-3">
            {filtered.map(m => {
              const isAlert = m.stock <= m.minimumStock;
              
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMaterialId(m.id)}
                  className={`bg-white border p-5 rounded-3xl cursor-pointer hover:border-amber-405 hover:shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                    selectedMaterial?.id === m.id 
                    ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/15 font-black' 
                    : isAlert 
                    ? 'border-red-300 bg-red-500/5' 
                    : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">{m.name}</h4>
                      {isAlert && (
                        <span className="bg-red-100 text-red-800 border border-red-200 font-mono text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-bounce">
                          <AlertTriangle className="w-3 h-3 text-red-700" /> LOW STOCK
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                      <span>Supplied by: <strong className="text-slate-700 font-bold">{m.vendor}</strong></span>
                      <span>Last updated: {m.lastUpdated}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t border-slate-100 md:border-0 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[9px] uppercase font-mono text-slate-450 text-slate-400 block">Standard Rate</span>
                      <span className="font-mono text-slate-700 text-xs font-black">₹{m.pricePerUnit}/{m.unit.substring(0, m.unit.length - 1)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] uppercase font-mono text-slate-450 text-slate-400 block">Ledger Count</span>
                      <span className={`font-mono text-sm font-black ${isAlert ? 'text-red-600' : 'text-emerald-605 text-emerald-600'}`}>
                        {m.stock} {m.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Inventory Actions details */}
        <div>
          {selectedMaterial ? (
            <div className="bg-white border border-slate-205 p-5 rounded-3xl space-y-6 shadow-md animate-fade-in text-slate-805">
              <div>
                <span className="text-[9px] uppercase font-mono bg-amber-500/10 text-amber-700 py-1 px-2.5 border border-amber-505 rounded-full font-black">
                  Stock Replenish Console
                </span>
                <h3 className="text-base font-black text-slate-900 mt-3 mb-1">{selectedMaterial.name}</h3>
                <p className="text-[11px] text-slate-500 font-mono">Unit Category: {selectedMaterial.unit} (Limit alert ceiling: {selectedMaterial.minimumStock})</p>
              </div>

              {/* Vendor Information Contact lines */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-2 shadow-inner">
                <span className="text-[9px] uppercase font-mono text-slate-400 font-black block">Assigned Supplier & Dispatch Agent</span>
                <p className="text-xs font-black text-slate-805">{selectedMaterial.vendor}</p>
                
                <a
                  href={`tel:${selectedMaterial.vendorPhone}`}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-605 text-amber-600 font-mono font-bold hover:underline mt-1"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-500" /> {selectedMaterial.vendorPhone}
                </a>
              </div>

              {/* Replenish dispatch simulator */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-4">
                <span className="text-[9px] uppercase font-mono text-amber-700 font-black block flex items-center gap-1">
                  <ShoppingCart className="w-4 h-4 text-amber-550 text-amber-500 animate-pulse" /> Fast Stock Replenishment
                </span>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 block font-black">Define replenishment quantity ({selectedMaterial.unit}):</label>
                  <input
                    type="number"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-mono font-bold text-center focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-slate-200 font-bold">
                  <span className="text-slate-500">Estimated Expense Value:</span>
                  <span className="font-extrabold text-amber-600 font-mono">₹{Math.round(orderQuantity * selectedMaterial.pricePerUnit).toLocaleString('en-IN')}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleReplenishStock(selectedMaterial.id, orderQuantity)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs transition shadow-sm"
                >
                  Approve Order & Dispatch Raw Materials
                </button>
              </div>

              {/* Important Ratios Help block */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-2.5 text-[10px] leading-relaxed text-slate-500 font-semibold shadow-inner">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Thumb Rule Warning:</strong> Standard Indian building casting needs approx 4.5 bags cement per cubic meter. Keep buffers high during moonsoons when regional logistics can face delays.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 border-dashed p-8 text-center rounded-3xl h-64 flex flex-col items-center justify-center shadow-inner animate-pulse">
              <ShoppingCart className="w-10 h-10 text-slate-350" />
              <h4 className="text-slate-550 text-xs font-black mt-3">Select logistics line</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Trigger purchase order sheets, modify minimum alert triggers, or check inventory trends.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
