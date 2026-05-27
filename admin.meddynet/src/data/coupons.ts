export interface Coupon {
  id: string;
  code: string;
  type: "Flat" | "Percentage";
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  maxUses: number;
  usedCount: number;
  perUserLimit: number;
  validFrom: string;
  validUntil: string;
  applicableTo: "All" | "New Users" | "Specific Lab" | "Specific Test";
  labId: string | null;
  testName: string | null;
  status: "Active" | "Expired" | "Paused";
}

export const mockCoupons: Coupon[] = [
  { id: "CPN-001", code: "WELCOME100", type: "Flat", value: 100, minOrder: 500, maxDiscount: null, maxUses: 5000, usedCount: 2341, perUserLimit: 1, validFrom: "2025-01-01T00:00:00Z", validUntil: "2026-12-31T23:59:59Z", applicableTo: "New Users", labId: null, testName: null, status: "Active" },
  { id: "CPN-002", code: "SAVE20", type: "Percentage", value: 20, minOrder: 800, maxDiscount: 200, maxUses: 2000, usedCount: 1876, perUserLimit: 2, validFrom: "2026-01-01T00:00:00Z", validUntil: "2026-03-31T23:59:59Z", applicableTo: "All", labId: null, testName: null, status: "Expired" },
  { id: "CPN-003", code: "THYROID15", type: "Percentage", value: 15, minOrder: 400, maxDiscount: 150, maxUses: 1000, usedCount: 423, perUserLimit: 3, validFrom: "2026-02-01T00:00:00Z", validUntil: "2026-06-30T23:59:59Z", applicableTo: "Specific Test", labId: null, testName: "Thyroid Profile", status: "Active" },
  { id: "CPN-004", code: "APEX50", type: "Flat", value: 50, minOrder: 300, maxDiscount: null, maxUses: 500, usedCount: 312, perUserLimit: 5, validFrom: "2025-12-01T00:00:00Z", validUntil: "2026-05-31T23:59:59Z", applicableTo: "Specific Lab", labId: "LAB-001", testName: null, status: "Active" },
  { id: "CPN-005", code: "DIAGNOSTIC25", type: "Percentage", value: 25, minOrder: 1000, maxDiscount: 300, maxUses: 800, usedCount: 799, perUserLimit: 1, validFrom: "2025-10-01T00:00:00Z", validUntil: "2025-12-31T23:59:59Z", applicableTo: "All", labId: null, testName: null, status: "Expired" },
  { id: "CPN-006", code: "HEALTH200", type: "Flat", value: 200, minOrder: 1500, maxDiscount: null, maxUses: 300, usedCount: 145, perUserLimit: 2, validFrom: "2026-03-01T00:00:00Z", validUntil: "2026-09-30T23:59:59Z", applicableTo: "All", labId: null, testName: null, status: "Active" },
  { id: "CPN-007", code: "CBC100", type: "Flat", value: 100, minOrder: 250, maxDiscount: null, maxUses: 2000, usedCount: 87, perUserLimit: 1, validFrom: "2026-03-15T00:00:00Z", validUntil: "2026-04-15T23:59:59Z", applicableTo: "Specific Test", labId: null, testName: "Complete Blood Count", status: "Active" },
  { id: "CPN-008", code: "DIABETES10", type: "Percentage", value: 10, minOrder: 300, maxDiscount: 100, maxUses: 5000, usedCount: 1204, perUserLimit: 10, validFrom: "2025-11-01T00:00:00Z", validUntil: "2026-10-31T23:59:59Z", applicableTo: "All", labId: null, testName: null, status: "Active" },
  { id: "CPN-009", code: "PAUSE99", type: "Flat", value: 99, minOrder: 600, maxDiscount: null, maxUses: 1000, usedCount: 0, perUserLimit: 1, validFrom: "2026-04-01T00:00:00Z", validUntil: "2026-05-31T23:59:59Z", applicableTo: "All", labId: null, testName: null, status: "Paused" },
  { id: "CPN-010", code: "MUMBAI30", type: "Percentage", value: 30, minOrder: 700, maxDiscount: 250, maxUses: 500, usedCount: 198, perUserLimit: 2, validFrom: "2026-02-15T00:00:00Z", validUntil: "2026-04-30T23:59:59Z", applicableTo: "All", labId: null, testName: null, status: "Active" },
];
