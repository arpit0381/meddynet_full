export interface Booking {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  labId: string;
  labName: string;
  city: string;
  tests: string[];
  dateTime: string;
  type: "Home" | "Lab";
  amount: number;
  commission: number;
  status: "Pending" | "Confirmed" | "Sample Collected" | "Processing" | "Completed" | "Cancelled" | "Refunded";
  technicianId: string | null;
}

const testNames = ["Complete Blood Count", "Lipid Profile", "Thyroid Profile (T3,T4,TSH)", "HbA1c", "Vitamin D3", "Vitamin B12", "Liver Function Test", "Kidney Function Test", "Urine Routine", "Blood Sugar Fasting", "Dengue NS1 Antigen", "COVID-19 RT-PCR", "Iron Studies", "Calcium", "Uric Acid"];
const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Kochi", "Lucknow", "Bhopal", "Nagpur", "Surat", "Chandigarh"];
const labNames = ["Apex Diagnostics", "CityLab Diagnostics", "HealthPlus Diagnostics", "MediScan Labs", "Precision Pathology", "QuickTest Diagnostics", "Acme Labs", "TrueHealth Labs", "MetroScan Labs", "VitaLab Diagnostics", "LifeCare Diagnostics"];
const patientNames = ["Ramesh Kumar", "Priya Sharma", "Arun Patel", "Sunita Devi", "Mohan Reddy", "Kavita Singh", "Deepak Verma", "Anita Nair", "Suresh Menon", "Pooja Ghosh", "Rajiv Malhotra", "Meena Iyer", "Vikram Joshi", "Lakshmi Rao", "Amit Tiwari", "Radha Krishnan", "Ganesh Pillai", "Sonal Bhatia", "Harish Gupta", "Nikita Choudhary"];
const statuses: Booking["status"][] = ["Pending", "Confirmed", "Sample Collected", "Processing", "Completed", "Completed", "Completed", "Cancelled", "Refunded"];

export const mockBookings: Booking[] = Array.from({ length: 200 }, (_, i) => {
  const d = new Date(2025, 11, 23);
  d.setDate(d.getDate() - (i * 0.45 | 0));
  const amount = [650, 850, 1200, 1450, 1800, 2100, 2500, 500, 750, 950][i % 10];
  return {
    id: `BKG-${20000 + i}`,
    patientId: `USR-${String((i % 30) + 1).padStart(3, "0")}`,
    patientName: patientNames[i % 20],
    patientPhone: `+91 ${90000 + i * 123} ${10000 + i * 47}`,
    labId: `LAB-${String((i % 22) + 1).padStart(3, "0")}`,
    labName: labNames[i % 11],
    city: cities[i % 15],
    tests: [testNames[i % 15], ...(i % 3 === 0 ? [testNames[(i + 2) % 15]] : []), ...(i % 5 === 0 ? [testNames[(i + 4) % 15]] : [])],
    dateTime: d.toISOString(),
    type: i % 3 === 0 ? "Lab" : "Home",
    amount,
    commission: Math.round(amount * 0.12),
    status: statuses[(i * 7 + 3) % statuses.length],
    technicianId: i % 3 === 0 ? null : `TECH-${String((i % 15) + 1).padStart(3, "0")}`,
  };
});
