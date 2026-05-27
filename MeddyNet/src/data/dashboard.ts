// ─── Interfaces ─────────────────────────────────────────────────

export interface Booking {
  id: string;
  labName: string;
  labInitials: string;
  labColor: string;
  labSlug: string;
  tests: string[];
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled" | "In-Progress";
  type: "Home Collection" | "Lab Visit";
  totalAmount: number;
  technician?: string;
  address?: string;
  commission?: number;
}

export interface TrackingStep {
  id: string;
  label: string;
  description: string;
  timestamp?: string;
  status: "completed" | "active" | "pending";
}

export interface Report {
  id: string;
  testName: string;
  labName: string;
  date: string;
  status: "Ready" | "Processing";
  fileUrl?: string;
  abnormal: boolean;
  parameters?: ReportParameter[];
  doctorNote?: string;
}

export interface ReportParameter {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low";
}

export interface VaultFile {
  id: string;
  name: string;
  category: "Prescription" | "Lab Report" | "Scan" | "Invoice";
  uploadDate: string;
  size: string;
  doctorName?: string;
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  date: string;
  amount: number;
  method: "UPI" | "Card" | "NetBanking" | "Wallet";
  status: "Successful" | "Pending" | "Failed";
}

export interface Notification {
  id: string;
  type: "booking" | "report" | "reminder" | "offer";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
  icon?: string;
}

export interface HealthRecord {
  id: string;
  type: "test" | "prescription" | "report" | "scan";
  title: string;
  date: string;
  details: string;
  doctor?: string;
  fileAvailable?: boolean;
  labName?: string;
  status?: string;
  tags?: string[];
}

export interface Prescription {
  id: string;
  fileName: string;
  uploadDate: string;
  doctor: string;
  hospital: string;
  suggestedTests: SuggestedTest[];
  fileType: "image" | "pdf";
  size: string;
}

export interface SuggestedTest {
  name: string;
  reason: string;
  category: string;
  estimatedPrice: number;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  period: "morning" | "afternoon" | "evening";
}

// ─── Sample Data ─────────────────────────────────────────────────

export const recentBookings: Booking[] = [
  {
    id: "MN892341",
    labName: "HealthPlus Diagnostics",
    labInitials: "H+",
    labColor: "from-blue-500 to-blue-600",
    labSlug: "healthplus-diagnostics",
    tests: ["Complete Blood Count (CBC)", "Vitamin D"],
    date: "2024-03-20",
    time: "09:00 AM",
    status: "Upcoming",
    type: "Home Collection",
    totalAmount: 1098,
    technician: "Ramesh Kumar",
    address: "14B, Green Park Extension, New Delhi",
    commission: 55,
  },
  {
    id: "MN891102",
    labName: "DiagCare Labs",
    labInitials: "DC",
    labColor: "from-orange-500 to-orange-600",
    labSlug: "diagcare-labs",
    tests: ["Thyroid Profile"],
    date: "2024-02-15",
    time: "10:30 AM",
    status: "Completed",
    type: "Lab Visit",
    totalAmount: 649,
    commission: 32,
  },
  {
    id: "MN889054",
    labName: "Apollo Path Labs",
    labInitials: "AP",
    labColor: "from-teal-500 to-teal-600",
    labSlug: "apollo-path-labs",
    tests: ["Lipid Profile", "Liver Function Test"],
    date: "2023-11-05",
    time: "08:00 AM",
    status: "Completed",
    type: "Home Collection",
    totalAmount: 1148,
    technician: "Sonia Rao",
    commission: 57,
  },
  {
    id: "MN887203",
    labName: "MedLife Pathology",
    labInitials: "ML",
    labColor: "from-emerald-500 to-emerald-600",
    labSlug: "medlife-pathology",
    tests: ["HbA1c", "Blood Glucose Fasting"],
    date: "2023-09-12",
    time: "07:30 AM",
    status: "Completed",
    type: "Lab Visit",
    totalAmount: 798,
    commission: 40,
  },
  {
    id: "MN884501",
    labName: "LifeCare Diagnostics",
    labInitials: "LC",
    labColor: "from-rose-500 to-rose-600",
    labSlug: "lifecare-diagnostics",
    tests: ["Vitamin B12"],
    date: "2023-07-22",
    time: "11:00 AM",
    status: "Cancelled",
    type: "Home Collection",
    totalAmount: 549,
    commission: 27,
  },
];

export const bookingTrackingSteps: Record<string, TrackingStep[]> = {
  "MN892341": [
    { id: "1", label: "Booking Confirmed", description: "Your booking has been confirmed and payment received.", timestamp: "Mar 18, 2024 • 11:32 AM", status: "completed" },
    { id: "2", label: "Technician Assigned", description: "Ramesh Kumar has been assigned to collect your sample.", timestamp: "Mar 19, 2024 • 09:15 AM", status: "completed" },
    { id: "3", label: "Technician En Route", description: "Your technician is on the way to your location.", timestamp: "Estimated: Mar 20, 2024 • 08:45 AM", status: "active" },
    { id: "4", label: "Sample Collected", description: "Blood sample collected and sent to the lab.", timestamp: "Pending", status: "pending" },
    { id: "5", label: "Lab Processing", description: "Sample is being analyzed by our experts.", timestamp: "Pending", status: "pending" },
    { id: "6", label: "Report Ready", description: "Your digital report is ready to view and download.", timestamp: "Pending", status: "pending" },
  ],
  "MN891102": [
    { id: "1", label: "Booking Confirmed", description: "Your booking has been confirmed.", timestamp: "Feb 14, 2024 • 03:10 PM", status: "completed" },
    { id: "2", label: "Technician Assigned", description: "Lab visit — no technician dispatch needed.", timestamp: "Feb 14, 2024 • 03:10 PM", status: "completed" },
    { id: "3", label: "Sample Collected", description: "Sample collected at the lab during your visit.", timestamp: "Feb 15, 2024 • 10:45 AM", status: "completed" },
    { id: "4", label: "Lab Processing", description: "Sample analyzed successfully.", timestamp: "Feb 15, 2024 • 12:30 PM", status: "completed" },
    { id: "5", label: "Report Ready", description: "Your digital report is ready.", timestamp: "Feb 15, 2024 • 05:00 PM", status: "completed" },
    { id: "6", label: "Report Delivered", description: "Report sent to your email and dashboard.", timestamp: "Feb 15, 2024 • 05:05 PM", status: "completed" },
  ],
  "MN889054": [
    { id: "1", label: "Booking Confirmed", description: "Booking confirmed.", timestamp: "Nov 04, 2023 • 07:00 PM", status: "completed" },
    { id: "2", label: "Technician Assigned", description: "Sonia Rao assigned.", timestamp: "Nov 04, 2023 • 08:30 PM", status: "completed" },
    { id: "3", label: "Sample Collected", description: "Home collection completed.", timestamp: "Nov 05, 2023 • 08:20 AM", status: "completed" },
    { id: "4", label: "Lab Processing", description: "Running analysis.", timestamp: "Nov 05, 2023 • 10:00 AM", status: "completed" },
    { id: "5", label: "Report Ready", description: "Reports available.", timestamp: "Nov 05, 2023 • 06:00 PM", status: "completed" },
    { id: "6", label: "Report Delivered", description: "Delivered to dashboard.", timestamp: "Nov 05, 2023 • 06:10 PM", status: "completed" },
  ],
};

export const userReports: Report[] = [
  {
    id: "REP-983",
    testName: "Thyroid Profile (T3, T4, TSH)",
    labName: "DiagCare Labs",
    date: "2024-02-15",
    status: "Ready",
    abnormal: false,
    doctorNote: "Thyroid function is within normal limits. Continue current medication.",
    parameters: [
      { name: "T3 (Triiodothyronine)", value: "1.2", unit: "ng/mL", referenceRange: "0.8–2.0", status: "normal" },
      { name: "T4 (Thyroxine)", value: "7.8", unit: "µg/dL", referenceRange: "5.1–14.1", status: "normal" },
      { name: "TSH", value: "2.4", unit: "mIU/L", referenceRange: "0.4–4.0", status: "normal" },
    ],
  },
  {
    id: "REP-912",
    testName: "Lipid Profile",
    labName: "Apollo Path Labs",
    date: "2023-11-05",
    status: "Ready",
    abnormal: true,
    doctorNote: "LDL cholesterol is slightly elevated. Dietary changes and exercise recommended.",
    parameters: [
      { name: "Total Cholesterol", value: "210", unit: "mg/dL", referenceRange: "<200", status: "high" },
      { name: "LDL Cholesterol", value: "138", unit: "mg/dL", referenceRange: "<130", status: "high" },
      { name: "HDL Cholesterol", value: "52", unit: "mg/dL", referenceRange: ">40", status: "normal" },
      { name: "Triglycerides", value: "145", unit: "mg/dL", referenceRange: "<150", status: "normal" },
      { name: "VLDL", value: "29", unit: "mg/dL", referenceRange: "<30", status: "normal" },
    ],
  },
  {
    id: "REP-913",
    testName: "Liver Function Test",
    labName: "Apollo Path Labs",
    date: "2023-11-05",
    status: "Ready",
    abnormal: false,
    parameters: [
      { name: "SGOT (AST)", value: "25", unit: "U/L", referenceRange: "10–40", status: "normal" },
      { name: "SGPT (ALT)", value: "30", unit: "U/L", referenceRange: "7–56", status: "normal" },
      { name: "Alkaline Phosphatase", value: "72", unit: "U/L", referenceRange: "44–147", status: "normal" },
      { name: "Bilirubin Total", value: "0.8", unit: "mg/dL", referenceRange: "0.1–1.2", status: "normal" },
    ],
  },
  {
    id: "REP-901",
    testName: "Complete Blood Count (CBC)",
    labName: "HealthPlus Diagnostics",
    date: "2024-03-20",
    status: "Processing",
    abnormal: false,
  },
];

export const vaultFiles: VaultFile[] = [
  { id: "VF-001", name: "Dr. Sharma Prescription.pdf", category: "Prescription", uploadDate: "2024-03-10", size: "1.2 MB", doctorName: "Dr. A.K. Sharma" },
  { id: "VF-002", name: "Chest X-Ray 2023.jpg", category: "Scan", uploadDate: "2023-08-22", size: "4.5 MB" },
  { id: "VF-003", name: "Appollo Invoice Nov.pdf", category: "Invoice", uploadDate: "2023-11-06", size: "0.8 MB" },
];

export const paymentHistory: PaymentTransaction[] = [
  { id: "TXN-88220199", bookingId: "MN892341", date: "2024-03-18", amount: 1098, method: "UPI", status: "Successful" },
  { id: "TXN-88154322", bookingId: "MN891102", date: "2024-02-14", amount: 649, method: "Card", status: "Successful" },
  { id: "TXN-87994321", bookingId: "MN889054", date: "2023-11-04", amount: 1148, method: "UPI", status: "Successful" },
  { id: "TXN-87112000", bookingId: "MN884501", date: "2023-07-21", amount: 549, method: "Wallet", status: "Failed" },
];

export const notifications: Notification[] = [
  { id: "N-001", type: "booking", title: "Booking Confirmed!", message: "Your CBC + Vitamin D test at HealthPlus Diagnostics is confirmed for March 20 at 9:00 AM.", timestamp: "2024-03-18T11:32:00", read: false, actionLabel: "Track Booking", actionHref: "/dashboard/bookings/MN892341" },
  { id: "N-002", type: "report", title: "Report Ready 📋", message: "Your Thyroid Profile report from DiagCare Labs is now available. Tap to view.", timestamp: "2024-02-15T17:05:00", read: false, actionLabel: "View Report", actionHref: "/dashboard/reports/REP-983" },
  { id: "N-003", type: "reminder", title: "Time to Book Your Annual Checkup", message: "It's been 6 months since your last health checkup. Schedule one today!", timestamp: "2024-03-10T09:00:00", read: true, actionLabel: "Search Tests", actionHref: "/search" },
  { id: "N-004", type: "report", title: "Report Ready 📋", message: "Your Lipid Profile and Liver Function Test reports from Apollo Path Labs are ready.", timestamp: "2023-11-05T18:10:00", read: true, actionLabel: "View Reports", actionHref: "/dashboard/reports" },
  { id: "N-005", type: "offer", title: "Flat 30% off on Full Body Checkup", message: "Exclusive offer for MeddyNet members! Book a full body health checkup at discounted rates.", timestamp: "2024-03-15T10:00:00", read: false, actionLabel: "Explore", actionHref: "/search" },
  { id: "N-006", type: "reminder", title: "Vitamin D Report Collected", message: "Your sample has been collected. Results expected by tomorrow.", timestamp: "2024-03-20T09:30:00", read: false },
  { id: "N-007", type: "booking", title: "Technician Assigned", message: "Ramesh Kumar will collect your sample tomorrow between 8:30 - 9:30 AM.", timestamp: "2024-03-19T09:15:00", read: true, actionLabel: "View Details", actionHref: "/dashboard/bookings/MN892341" },
];

export const healthRecords: HealthRecord[] = [
  { id: "HR-001", type: "report", title: "Lipid Profile", date: "2023-11-05", details: "Cholesterol slightly elevated. Follow-up recommended.", labName: "Apollo Path Labs", fileAvailable: true, status: "Abnormal", tags: ["Cardiology"] },
  { id: "HR-002", type: "report", title: "Liver Function Test", date: "2023-11-05", details: "All parameters within normal range.", labName: "Apollo Path Labs", fileAvailable: true, status: "Normal", tags: ["Liver"] },
  { id: "HR-003", type: "prescription", title: "Prescription by Dr. A.K. Sharma", date: "2024-03-10", details: "Follow-up check for thyroid levels. Tablet Thyronorm 50mcg.", doctor: "Dr. A.K. Sharma", fileAvailable: true, tags: ["Thyroid"] },
  { id: "HR-004", type: "test", title: "Thyroid Profile (T3, T4, TSH)", date: "2024-02-15", details: "Booked at DiagCare Labs. Results: Normal.", labName: "DiagCare Labs", fileAvailable: true, status: "Normal", tags: ["Thyroid"] },
  { id: "HR-005", type: "scan", title: "Chest X-Ray", date: "2023-08-22", details: "Routine chest X-ray. No abnormalities detected.", doctor: "Dr. S. Mehta", fileAvailable: true, status: "Normal", tags: ["Radiology"] },
  { id: "HR-006", type: "test", title: "HbA1c + Blood Glucose Fasting", date: "2023-09-12", details: "Blood sugar levels within normal limits.", labName: "MedLife Pathology", fileAvailable: false, status: "Normal", tags: ["Diabetes"] },
];

export const prescriptions: Prescription[] = [
  {
    id: "PRESC-001",
    fileName: "Dr_Sharma_Prescription.pdf",
    uploadDate: "2024-03-10",
    doctor: "Dr. A.K. Sharma",
    hospital: "Apollo Hospitals, New Delhi",
    fileType: "pdf",
    size: "1.2 MB",
    suggestedTests: [
      { name: "Thyroid Profile (T3, T4, TSH)", reason: "Mentioned for thyroid monitoring", category: "Thyroid", estimatedPrice: 599 },
      { name: "Vitamin D (25-OH)", reason: "Vitamin D deficiency suspected", category: "Vitamins", estimatedPrice: 699 },
      { name: "Complete Blood Count (CBC)", reason: "Routine follow-up", category: "Hematology", estimatedPrice: 399 },
    ],
  },
  {
    id: "PRESC-002",
    fileName: "Fortis_Prescription_Aug.jpg",
    uploadDate: "2023-08-20",
    doctor: "Dr. S. Mehta",
    hospital: "Fortis Hospital, Gurugram",
    fileType: "image",
    size: "2.4 MB",
    suggestedTests: [
      { name: "Chest X-Ray", reason: "Follow-up for respiratory check", category: "Radiology", estimatedPrice: 450 },
      { name: "Sputum Culture", reason: "Rule out infection", category: "Microbiology", estimatedPrice: 350 },
    ],
  },
];

export const availableTimeSlots: Record<string, TimeSlot[]> = {
  "2024-03-21": [
    { id: "s1", time: "07:00 AM", available: true, period: "morning" },
    { id: "s2", time: "07:30 AM", available: false, period: "morning" },
    { id: "s3", time: "08:00 AM", available: true, period: "morning" },
    { id: "s4", time: "08:30 AM", available: true, period: "morning" },
    { id: "s5", time: "09:00 AM", available: false, period: "morning" },
    { id: "s6", time: "09:30 AM", available: true, period: "morning" },
    { id: "s7", time: "10:00 AM", available: true, period: "morning" },
    { id: "s8", time: "10:30 AM", available: true, period: "morning" },
    { id: "s9", time: "12:00 PM", available: true, period: "afternoon" },
    { id: "s10", time: "12:30 PM", available: false, period: "afternoon" },
    { id: "s11", time: "01:00 PM", available: true, period: "afternoon" },
    { id: "s12", time: "02:00 PM", available: true, period: "afternoon" },
    { id: "s13", time: "05:00 PM", available: true, period: "evening" },
    { id: "s14", time: "05:30 PM", available: false, period: "evening" },
    { id: "s15", time: "06:00 PM", available: true, period: "evening" },
    { id: "s16", time: "06:30 PM", available: true, period: "evening" },
  ],
};
