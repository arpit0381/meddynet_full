export interface Transaction {
  id: string;
  labId: string;
  labName: string;
  type: "Payout" | "Commission" | "Refund" | "Adjustment";
  amount: number;
  date: string;
  status: "Completed" | "Pending" | "Failed" | "On Hold";
  paymentMethod: string;
  notes: string;
}

export interface Refund {
  id: string;
  bookingId: string;
  patientName: string;
  labName: string;
  amount: number;
  reason: string;
  paymentMethod: "UPI" | "Card" | "NetBanking" | "Wallet";
  status: "Pending" | "Approved" | "Rejected" | "Partial";
  requestedAt: string;
  resolvedAt: string | null;
  adminNotes: string;
  partialAmount: number | null;
}

export const mockTransactions: Transaction[] = Array.from({ length: 40 }, (_, i) => ({
  id: `TXN-${5000 + i}`,
  labId: `LAB-${String((i % 22) + 1).padStart(3, "0")}`,
  labName: ["Apex Diagnostics", "CityLab Diagnostics", "HealthPlus Diagnostics", "Acme Labs", "LifeCare Diagnostics", "TrueHealth Labs", "MetroScan Labs"][i % 7],
  type: (["Payout", "Commission", "Payout", "Adjustment", "Refund"] as const)[i % 5],
  amount: [45000, 12000, 82000, 960, 1200, 28000, 5400, 15000, 35000, 7800][i % 10],
  date: new Date(2026, 2, 23 - (i * 0.6 | 0)).toISOString(),
  status: (["Completed", "Completed", "Pending", "On Hold", "Failed"] as const)[(i * 3) % 5],
  paymentMethod: ["NEFT", "IMPS", "RTGS"][i % 3],
  notes: i % 8 === 0 ? "Held pending bank verification" : "Regular processing",
}));

export const mockRefunds: Refund[] = [
  { id: "RFD-001", bookingId: "BKG-20003", patientName: "Arun Patel", labName: "MediScan Labs", amount: 1200, reason: "Technician did not arrive for home collection.", paymentMethod: "UPI", status: "Pending", requestedAt: "2026-03-22T10:00:00Z", resolvedAt: null, adminNotes: "", partialAmount: null },
  { id: "RFD-002", bookingId: "BKG-20010", patientName: "Sunita Devi", labName: "CityLab Diagnostics", amount: 850, reason: "Wrong test results uploaded, Lab error confirmed.", paymentMethod: "Card", status: "Approved", requestedAt: "2026-03-20T14:00:00Z", resolvedAt: "2026-03-21T10:30:00Z", adminNotes: "Lab confirmed error. Full refund approved.", partialAmount: null },
  { id: "RFD-003", bookingId: "BKG-20025", patientName: "Deepak Verma", labName: "QuickTest Diagnostics", amount: 650, reason: "Service not provided — booking expired without collection.", paymentMethod: "NetBanking", status: "Pending", requestedAt: "2026-03-21T09:00:00Z", resolvedAt: null, adminNotes: "", partialAmount: null },
  { id: "RFD-004", bookingId: "BKG-20040", patientName: "Kavita Singh", labName: "Apex Diagnostics", amount: 2100, reason: "Cancelled booking 48 hours in advance.", paymentMethod: "UPI", status: "Approved", requestedAt: "2026-03-18T12:00:00Z", resolvedAt: "2026-03-19T09:00:00Z", adminNotes: "Cancellation policy satisfied. Full refund.", partialAmount: null },
  { id: "RFD-005", bookingId: "BKG-20055", patientName: "Mohan Reddy", labName: "Precision Pathology", amount: 1800, reason: "Report not delivered after 5 days.", paymentMethod: "Card", status: "Partial", requestedAt: "2026-03-16T10:00:00Z", resolvedAt: "2026-03-17T14:00:00Z", adminNotes: "Report was delayed due to machine breakdown. Partial refund as service was eventually delivered.", partialAmount: 900 },
  { id: "RFD-006", bookingId: "BKG-20070", patientName: "Rajiv Malhotra", labName: "Acme Labs", amount: 2500, reason: "Duplicate booking created accidentally.", paymentMethod: "Wallet", status: "Approved", requestedAt: "2026-03-15T08:00:00Z", resolvedAt: "2026-03-15T15:00:00Z", adminNotes: "Confirmed duplicate. Immediate refund processed.", partialAmount: null },
  { id: "RFD-007", bookingId: "BKG-20085", patientName: "Anita Nair", labName: "TrueHealth Labs", amount: 750, reason: "Lab didn't open on the booked day (public holiday).", paymentMethod: "UPI", status: "Rejected", requestedAt: "2026-03-14T11:00:00Z", resolvedAt: "2026-03-14T18:00:00Z", adminNotes: "Lab was marked as operational. T&C allow 24h reschedule. Rejected.", partialAmount: null },
  { id: "RFD-008", bookingId: "BKG-20100", patientName: "Suresh Menon", labName: "MetroScan Labs", amount: 1450, reason: "Sample lost in processing.", paymentMethod: "Card", status: "Pending", requestedAt: "2026-03-23T07:00:00Z", resolvedAt: null, adminNotes: "", partialAmount: null },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `RFD-${String(9 + i).padStart(3, "0")}`,
    bookingId: `BKG-${20110 + i * 5}`,
    patientName: ["Pooja Ghosh", "Vikram Joshi", "Lakshmi Rao", "Amit Tiwari", "Sonal Bhatia", "Harish Gupta", "Deepika Yadav", "Kiran Babu", "Praveen Kumar", "Nandini Desai", "Rohit Kapoor", "Lalitha S"][i],
    labName: ["Apex Diagnostics", "HealthPlus Diagnostics", "LifeCare Diagnostics", "CityLab Diagnostics"][i % 4],
    amount: [650, 850, 1200, 1450, 1800, 2100][i % 6],
    reason: ["Technician late by 3+ hours", "Report quality issues", "Service not as described", "System error during booking", "Cancellation within policy"][i % 5],
    paymentMethod: (["UPI", "Card", "NetBanking", "Wallet"] as const)[i % 4],
    status: (["Pending", "Approved", "Rejected", "Partial"] as const)[(i * 3) % 4],
    requestedAt: new Date(2026, 2, 22 - i).toISOString(),
    resolvedAt: i % 4 === 0 ? null : new Date(2026, 2, 22 - i + 1).toISOString(),
    adminNotes: i % 4 === 0 ? "" : "Reviewed and processed.",
    partialAmount: i % 4 === 3 ? Math.floor([650, 850, 1200, 1450, 1800, 2100][i % 6] / 2) : null,
  })),
];
