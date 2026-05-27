export interface Booking {
  id: string;
  labName: string;
  labInitials: string;
  labColor: string;
  tests: string[];
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  type: "Home Collection" | "Lab Visit";
  totalAmount: number;
}

export interface Report {
  id: string;
  testName: string;
  labName: string;
  date: string;
  status: "Ready" | "Processing";
  fileUrl?: string;
  abnormal: boolean;
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
  method: "UPI" | "Card" | "NetBanking";
  status: "Successful" | "Pending" | "Failed";
}

export const recentBookings: Booking[] = [
  {
    id: "MN892341",
    labName: "HealthPlus Diagnostics",
    labInitials: "H+",
    labColor: "from-blue-500 to-blue-600",
    tests: ["Complete Blood Count (CBC)", "Vitamin D"],
    date: "2024-03-20",
    time: "09:00 AM",
    status: "Upcoming",
    type: "Home Collection",
    totalAmount: 1098,
  },
  {
    id: "MN891102",
    labName: "DiagCare Labs",
    labInitials: "DC",
    labColor: "from-orange-500 to-orange-600",
    tests: ["Thyroid Profile"],
    date: "2024-02-15",
    time: "10:30 AM",
    status: "Completed",
    type: "Lab Visit",
    totalAmount: 649,
  },
  {
    id: "MN889054",
    labName: "Apollo Path Labs",
    labInitials: "AP",
    labColor: "from-teal-500 to-teal-600",
    tests: ["Lipid Profile", "Liver Function Test"],
    date: "2023-11-05",
    time: "08:00 AM",
    status: "Completed",
    type: "Home Collection",
    totalAmount: 1148,
  },
];

export const userReports: Report[] = [
  {
    id: "REP-983",
    testName: "Thyroid Profile (T3, T4, TSH)",
    labName: "DiagCare Labs",
    date: "2024-02-15",
    status: "Ready",
    abnormal: false,
  },
  {
    id: "REP-912",
    testName: "Lipid Profile",
    labName: "Apollo Path Labs",
    date: "2023-11-05",
    status: "Ready",
    abnormal: true,
  },
  {
    id: "REP-913",
    testName: "Liver Function Test",
    labName: "Apollo Path Labs",
    date: "2023-11-05",
    status: "Ready",
    abnormal: false,
  },
];

export const vaultFiles: VaultFile[] = [
  {
    id: "VF-001",
    name: "Dr. Sharma Prescription.pdf",
    category: "Prescription",
    uploadDate: "2024-03-10",
    size: "1.2 MB",
    doctorName: "Dr. A.K. Sharma",
  },
  {
    id: "VF-002",
    name: "Chest X-Ray 2023.jpg",
    category: "Scan",
    uploadDate: "2023-08-22",
    size: "4.5 MB",
  },
  {
    id: "VF-003",
    name: "Appollo Invoice Nov.pdf",
    category: "Invoice",
    uploadDate: "2023-11-06",
    size: "0.8 MB",
  },
];

export const paymentHistory: PaymentTransaction[] = [
  {
    id: "TXN-88220199",
    bookingId: "MN892341",
    date: "2024-03-18",
    amount: 1098,
    method: "UPI",
    status: "Successful",
  },
  {
    id: "TXN-88154322",
    bookingId: "MN891102",
    date: "2024-02-14",
    amount: 649,
    method: "Card",
    status: "Successful",
  },
  {
    id: "TXN-87994321",
    bookingId: "MN889054",
    date: "2023-11-04",
    amount: 1148,
    method: "UPI",
    status: "Successful",
  },
];
