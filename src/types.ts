export interface CompanyProfile {
  id?: string;
  userId?: string;
  companyName: string;
  address: string;
  directorName: string;
  state: string;
  city: string;
  phoneNo: string;
  gstNo: string;
  logoUrl?: string;
  pettyCashFund?: number;
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;
}

export interface LandPurchase {
  id: string;
  title: string;
  location: string;
  sizeSqYds: number;
  costLakhs: number;
  purchaseDate: string;
  sellerName: string;
  documentStatus: 'Pending' | 'Registered' | 'Clear Title';
  courtDeedLinked: boolean;
  assignedBuildingName?: string;
}

export interface Project {
  id: string;
  name: string;
  landPurchaseId: string; // Linked purchased land plot
  location: string;
  coords: { lat: number; lng: number };
  status: 'Planning' | 'Ongoing' | 'Completed';
  budget: number; // In Lakhs (INR) - Contract price
  spent: number; // In Lakhs (INR) - Paid to Contractor so far
  startDate: string;
  endDate: string;
  contractorName: string; // Builder given the contract
  contractorPhone: string;
  type: 'Residential' | 'Commercial' | 'Villa' | 'Plot';
  progress: number; // percentage
  sitePhotos: string[];
  milestones: {
    id: string;
    title: string;
    status: 'Pending' | 'In Progress' | 'Done';
    dueDate: string;
  }[];
  isSelfConstructed?: boolean;
  constructionLogs?: { id: string; date: string; title: string; category: string; description: string; notes?: string }[];
  materialIssues?: { id: string; date: string; materialId: string; materialName: string; quantity: number; unit: string }[];
  miscExpenses?: { id: string; date: string; amount: number; description: string; category: string }[];
  drawings?: Drawing[];
  safetyAudits?: SafetyAudit[];
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  projectHistory: string[]; // project names or IDs
  totalAgreed: number; // in INR (Lakhs)
  totalPaid: number; // in INR (Lakhs)
  meetings: {
    id: string;
    title: string;
    date: string;
    time: string;
    notes: string;
  }[];
}

export interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Half-Day';
}

export interface Worker {
  id: string;
  name: string;
  role: 'Mason' | 'Laborer' | 'Carpenter' | 'Plumber' | 'Electrician' | 'Supervisor' | 'Subcontractor';
  phone: string;
  dailyWage: number; // in INR
  assignedProjectId: string;
  assignedProjectName: string;
  completedTasks: number;
  totalAttendance: number;
  attendance: { [date: string]: 'Present' | 'Absent' | 'Half-Day' };
}

export interface Equipment {
  id: string;
  name: string;
  type: 'Heavy Machinery' | 'Vehicle' | 'Hand Tool' | 'Scaffolding';
  status: 'Available' | 'In Use' | 'Maintenance';
  assignedProjectId?: string;
  assignedProjectName?: string;
  dailyRate: number; // Cost per day for renting/depreciation
  lastServiceDate: string;
}

export interface Drawing {
  id: string;
  projectId: string;
  title: string;
  type: 'Architectural' | 'Structural' | 'MEP' | 'Floor Plan';
  version: string;
  uploadDate: string;
  url: string;
  status: 'Approved' | 'Draft' | 'Deprecated';
}

export interface SafetyAudit {
  id: string;
  projectId: string;
  date: string;
  inspectorName: string;
  score: number;
  notes: string;
  status: 'Pass' | 'Needs Attention' | 'Critical Issue';
}

export interface Material {
  id: string;
  name: string; // Cement, Steel (Tons), Bricks, Tiles (Boxes), Sand (Brass)
  stock: number;
  unit: string;
  minimumStock: number;
  vendor: string;
  vendorPhone: string;
  lastUpdated: string;
  pricePerUnit: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientId: string;
  projectName: string;
  amount: number; // taxable value
  cgst: number; // 9%
  sgst: number; // 9%
  gstNumber: string;
  totalAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyType: 'Flat' | 'Villa' | 'Plot' | 'Shop';
  message: string;
  status: 'New' | 'FollowUp' | 'Converted' | 'Closed';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  role: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface Property {
  id: string;
  projectId: string; // Links to construction building contract
  title: string; // Building Project Name associated
  flatNumber: string; // e.g. "Flat A-102"
  location: string;
  type: 'Residential' | 'Premium Villa' | 'Plot' | 'Retail Shop';
  price: string; // e.g. "₹85 Lakhs"
  priceLakhs: number; // Numerical price in Lakhs
  size: string; // e.g. "1200 - 1800 sq.ft."
  bedroomCount?: number;
  amenities: string[];
  status: 'Available' | 'Booked' | 'Sold Out';
  buyerName?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  amountReceived: number; // payment collected from customer
  imageUrl: string;
}

export interface OfficeExpense {
  id: string;
  date: string;
  category: 'Staff Payroll' | 'Transportation & Petrol' | 'Chai & Snacks' | 'Office Rent & Bills' | 'Construction Equipment Rental' | 'Stationery & Printing' | 'Taxes & Municipal Fees' | 'Others';
  amount: number; // in INR
  paidTo: string;
  approvedBy: string;
  description: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
  receiptAttached?: boolean;
}
