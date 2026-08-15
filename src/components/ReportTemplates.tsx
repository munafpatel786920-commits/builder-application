import React, { useRef, useState } from 'react';
import { Building2, FileText, Landmark, LineChart, Printer } from 'lucide-react';
import { CompanyProfile, Project, Property, OfficeExpense, LandPurchase } from '../types';

interface ReportTemplatesProps {
  profile: CompanyProfile;
  projects: Project[];
  properties: Property[];
  expenses: OfficeExpense[];
  lands: LandPurchase[];
  pettyCashFund: number;
}

type ReportType = 'none' | 'financial' | 'sales' | 'project';

export default function ReportTemplates({ profile, projects, properties, expenses, lands, pettyCashFund }: ReportTemplatesProps) {
  const [activeReport, setActiveReport] = useState<ReportType>('none');

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to use the print feature.");
      return;
    }

    const printContent = printRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Report</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page { size: portrait; margin: 10mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .print\\:hidden { display: none !important; }
              .print\\:block { display: block !important; }
            }
            body { 
              background: white; 
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
              padding: 20px;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          <div class="max-w-4xl mx-auto">
            ${printContent}
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 1000);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
  const totalRevenue = properties.filter(p => ['Booked', 'Sold Out'].includes(p.status)).reduce((a, b) => a + b.amountReceived, 0);

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Report Templates</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Generate and print standardized reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <button 
          onClick={() => setActiveReport('financial')}
          className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${activeReport === 'financial' ? 'border-amber-600 bg-amber-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <LineChart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800">Financial Ledger</h3>
          <p className="text-xs text-slate-500 mt-2 text-center">Summary of petty cash, expenses, and revenue limit.</p>
        </button>

        <button 
          onClick={() => setActiveReport('sales')}
          className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${activeReport === 'sales' ? 'border-amber-600 bg-amber-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
            <Landmark className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800">Sales & Revenue</h3>
          <p className="text-xs text-slate-500 mt-2 text-center">Properties sold, booked flats, and cash collection.</p>
        </button>

        <button 
          onClick={() => setActiveReport('project')}
          className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${activeReport === 'project' ? 'border-amber-600 bg-amber-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
        >
          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800">Project Status</h3>
          <p className="text-xs text-slate-500 mt-2 text-center">RERA compliant construction progress report.</p>
        </button>
      </div>

      {activeReport !== 'none' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
          <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100 print:hidden">
            <span className="font-bold text-slate-700 capitalize">{activeReport} Report Preview</span>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-700 transition"
            >
              <Printer className="w-4 h-4" /> Print A4 PDF
            </button>
          </div>

          <div ref={printRef} className="p-8 md:p-12 print:p-0">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-widest">{profile.companyName || 'Global Construction'}</h1>
              <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">
                {activeReport} SUMMARY REPORT
              </p>
              <div className="mt-4 text-xs font-bold text-slate-500 flex justify-center gap-4">
                <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
                <span>GST: {profile.gstNo || 'Not Provided'}</span>
              </div>
            </div>

            {/* Content Switcher */}
            {activeReport === 'financial' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                    <p className="text-xs font-bold text-slate-500 uppercase">Available Petty Cash</p>
                    <p className="text-2xl font-black text-slate-800">₹{pettyCashFund.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Expenses</p>
                    <p className="text-2xl font-black text-rose-600">₹{totalExpenses.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Latest Expenses</h3>
                <div className="w-full">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-xs">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenses.slice(0, 15).map(exp => (
                        <tr key={exp.id}>
                          <td className="p-3">{new Date(exp.date).toLocaleDateString('en-IN')}</td>
                          <td className="p-3">{exp.category}</td>
                          <td className="p-3">{exp.description}</td>
                          <td className="p-3 text-right font-bold text-slate-800">{exp.amount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {expenses.length === 0 && <p className="text-sm text-slate-500 mt-4 text-center">No expenses recorded yet.</p>}
                </div>
              </div>
            )}

            {activeReport === 'sales' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Revenue Collected</p>
                    <p className="text-2xl font-black text-emerald-600">₹{totalRevenue.toLocaleString('en-IN')} Lakhs</p>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                    <p className="text-xs font-bold text-slate-500 uppercase">Booked & Sold Flats</p>
                    <p className="text-2xl font-black text-slate-800">
                      {properties.filter(p => p.status === 'Booked' || p.status === 'Sold Out').length}
                    </p>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                    <p className="text-xs font-bold text-slate-500 uppercase">Properties Available</p>
                    <p className="text-2xl font-black text-slate-800">
                      {properties.filter(p => p.status === 'Available').length}
                    </p>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Booked & Sold Inventory</h3>
                <div className="w-full">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-xs">
                      <tr>
                        <th className="p-3">Property</th>
                        <th className="p-3">Project</th>
                        <th className="p-3">Buyer Name</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Received (₹ Lakhs)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {properties.filter(p => p.status !== 'Available').map(p => (
                        <tr key={p.id}>
                          <td className="p-3 font-medium text-slate-800">{p.flatNumber}</td>
                          <td className="p-3">{p.title}</td>
                          <td className="p-3">{p.buyerName || 'N/A'}</td>
                          <td className="p-3">{p.status}</td>
                          <td className="p-3 text-right font-bold text-emerald-600">{p.amountReceived.toLocaleString('en-IN')} Lakhs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeReport === 'project' && (
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="border border-slate-200 p-5 rounded-xl bg-slate-50">
                    <p className="text-[10px] tracking-widest font-bold text-slate-500 uppercase mb-1">Total Active Projects</p>
                    <p className="text-3xl font-black text-blue-600">{projects.length}</p>
                  </div>
                  <div className="border border-slate-200 p-5 rounded-xl bg-slate-50">
                    <p className="text-[10px] tracking-widest font-bold text-slate-500 uppercase mb-1">Aggregate Budget (Lakhs)</p>
                    <p className="text-3xl font-black text-slate-800">₹{projects.reduce((a, b) => a + b.budget, 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="border border-slate-200 p-5 rounded-xl bg-slate-50">
                    <p className="text-[10px] tracking-widest font-bold text-slate-500 uppercase mb-1">Capital Deployed (Lakhs)</p>
                    <p className="text-3xl font-black text-emerald-600">₹{projects.reduce((a, b) => a + (b.spent || 0), 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 border-b-2 border-slate-800 pb-2 mb-6 uppercase tracking-widest text-sm text-left">Detailed Project Manifest</h3>
                  <div className="overflow-hidden border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-100 text-slate-800 uppercase font-black text-[10px] tracking-wider">
                        <tr>
                          <th className="p-4">Project / Location</th>
                          <th className="p-4">Contractor</th>
                          <th className="p-4">Timeline</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-center">Progress</th>
                          <th className="p-4 text-right">Budget vs Spent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {projects.map(proj => {
                           const isOverBudget = proj.spent > proj.budget;
                           return (
                          <tr key={proj.id} className="bg-white">
                            <td className="p-4">
                              <div className="font-bold text-slate-900 text-base">{proj.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{proj.type} • {proj.location}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-800">{proj.contractorName}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{proj.contractorPhone}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-xs font-bold text-slate-600 border border-slate-200 rounded px-2 py-1 inline-block bg-slate-50">
                                {new Date(proj.startDate).toLocaleDateString('en-IN')} - {new Date(proj.endDate).toLocaleDateString('en-IN')}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : proj.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                {proj.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex flex-col items-center gap-1.5">
                                <span className="font-black text-slate-800 text-xs">{proj.progress}%</span>
                                <div className="w-16 bg-slate-200 rounded-full h-1.5 flex-shrink-0">
                                  <div className={`h-1.5 rounded-full ${proj.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${proj.progress}%` }}></div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="font-black text-slate-900 text-base">₹{proj.budget} L</div>
                              <div className={`text-[11px] font-bold mt-0.5 ${isOverBudget ? 'text-rose-600' : 'text-slate-500'}`}>Spent: ₹{proj.spent || 0} L</div>
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                    {projects.length === 0 && <div className="p-8 text-center text-slate-500 text-sm font-medium">No projects allocated.</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-slate-200 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              <p>Generated by {profile.companyName || 'Global Construction'} ERP System</p>
              <p className="mt-1">For Internal Compliance & Accounting Verification</p>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
