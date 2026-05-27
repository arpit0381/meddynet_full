export interface Technician {
  id: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  assignedLab: string;
  status: "Active" | "On Leave" | "Inactive";
  rating: number;
  totalCollections: number;
  joinedAt: string;
  specialization: string;
}

export const mockTechnicians: Technician[] = [
  { id: "TECH-001", name: "Raju Yadav", phone: "+91 98765 10001", city: "Delhi", state: "Delhi", assignedLab: "Apex Diagnostics", status: "Active", rating: 4.7, totalCollections: 1240, joinedAt: "2024-06-15T09:00:00Z", specialization: "Phlebotomy" },
  { id: "TECH-002", name: "Sita Kumari", phone: "+91 87654 20002", city: "Mumbai", state: "Maharashtra", assignedLab: "CityLab Diagnostics", status: "Active", rating: 4.5, totalCollections: 985, joinedAt: "2024-08-20T09:00:00Z", specialization: "Phlebotomy" },
  { id: "TECH-003", name: "Mohan Das", phone: "+91 76543 30003", city: "Bangalore", state: "Karnataka", assignedLab: "HealthPlus Diagnostics", status: "Active", rating: 4.9, totalCollections: 2100, joinedAt: "2024-04-10T09:00:00Z", specialization: "Home Collection" },
  { id: "TECH-004", name: "Geeta Naik", phone: "+91 65432 40004", city: "Chennai", state: "Tamil Nadu", assignedLab: "MediScan Labs", status: "On Leave", rating: 4.1, totalCollections: 430, joinedAt: "2024-11-05T09:00:00Z", specialization: "Phlebotomy" },
  { id: "TECH-005", name: "Ramesh Nair", phone: "+91 54321 50005", city: "Hyderabad", state: "Telangana", assignedLab: "Precision Pathology", status: "Active", rating: 4.6, totalCollections: 760, joinedAt: "2024-09-12T09:00:00Z", specialization: "Sample Processing" },
  { id: "TECH-006", name: "Padma Patel", phone: "+91 43210 60006", city: "Pune", state: "Maharashtra", assignedLab: "QuickTest Diagnostics", status: "Active", rating: 3.9, totalCollections: 215, joinedAt: "2025-01-22T09:00:00Z", specialization: "Phlebotomy" },
  { id: "TECH-007", name: "Suresh Rajan", phone: "+91 32109 70007", city: "Ahmedabad", state: "Gujarat", assignedLab: "Acme Labs", status: "Active", rating: 4.8, totalCollections: 1890, joinedAt: "2024-03-18T09:00:00Z", specialization: "Home Collection" },
  { id: "TECH-008", name: "Anita Sharma", phone: "+91 21098 80008", city: "Jaipur", state: "Rajasthan", assignedLab: "SureScan Diagnostics", status: "Active", rating: 4.2, totalCollections: 180, joinedAt: "2025-02-08T09:00:00Z", specialization: "Phlebotomy" },
  { id: "TECH-009", name: "Vinod Kumar", phone: "+91 90987 90009", city: "Kochi", state: "Kerala", assignedLab: "TrueHealth Labs", status: "Active", rating: 4.6, totalCollections: 640, joinedAt: "2024-10-25T09:00:00Z", specialization: "Sample Processing" },
  { id: "TECH-010", name: "Priya Menon", phone: "+91 89876 00010", city: "Kolkata", state: "West Bengal", assignedLab: "Acme Labs", status: "Inactive", rating: 3.7, totalCollections: 320, joinedAt: "2024-07-14T09:00:00Z", specialization: "Phlebotomy" },
  { id: "TECH-011", name: "Harish Pillai", phone: "+91 78765 11011", city: "Lucknow", state: "Uttar Pradesh", assignedLab: "MetroScan Labs", status: "Active", rating: 4.4, totalCollections: 580, joinedAt: "2024-12-01T09:00:00Z", specialization: "Home Collection" },
  { id: "TECH-012", name: "Lakshmi Rao", phone: "+91 67654 22012", city: "Bhopal", state: "Madhya Pradesh", assignedLab: "MetroScan Labs", status: "Active", rating: 4.3, totalCollections: 410, joinedAt: "2025-01-15T09:00:00Z", specialization: "Phlebotomy" },
  { id: "TECH-013", name: "Rajiv Shetty", phone: "+91 56543 33013", city: "Chandigarh", state: "Punjab", assignedLab: "VitaLab Diagnostics", status: "Active", rating: 4.7, totalCollections: 510, joinedAt: "2024-11-30T09:00:00Z", specialization: "Home Collection" },
  { id: "TECH-014", name: "Kavitha Reddy", phone: "+91 45432 44014", city: "Nagpur", state: "Maharashtra", assignedLab: "BioTest Diagnostics", status: "Active", rating: 4.0, totalCollections: 295, joinedAt: "2025-02-20T09:00:00Z", specialization: "Phlebotomy" },
  { id: "TECH-015", name: "Sandeep Verma", phone: "+91 34321 55015", city: "Amritsar", state: "Punjab", assignedLab: "LifeCare Diagnostics", status: "Active", rating: 4.8, totalCollections: 1650, joinedAt: "2024-05-10T09:00:00Z", specialization: "Home Collection" },
];
