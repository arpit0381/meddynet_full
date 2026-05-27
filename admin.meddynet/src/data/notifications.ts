export interface AdminNotification {
  id: string;
  type: "new_lab_application" | "payout_request" | "flagged_report" | "support_ticket_high" | "subscription_expiring" | "system_alert";
  title: string;
  description: string;
  link: string;
  time: string;
  read: boolean;
}

export const mockNotifications: AdminNotification[] = [
  { id: "NOT-001", type: "new_lab_application", title: "New Lab Application", description: "GenX Pathology (Goa) submitted application for review.", link: "/admin/onboarding", time: "2026-03-23T11:45:00Z", read: false },
  { id: "NOT-002", type: "flagged_report", title: "Report Flagged", description: "Report RPT-9002 was auto-flagged for incorrect data format.", link: "/admin/reports", time: "2026-03-23T10:30:00Z", read: false },
  { id: "NOT-003", type: "support_ticket_high", title: "High Priority Ticket", description: "Ramesh Kumar: 'App crash on payment' — needs urgent attention.", link: "/admin/support", time: "2026-03-23T09:15:00Z", read: false },
  { id: "NOT-004", type: "payout_request", title: "Payout Request", description: "CityLab Diagnostics has requested ₹45,000 payout for March.", link: "/admin/financials", time: "2026-03-23T08:00:00Z", read: true },
  { id: "NOT-005", type: "subscription_expiring", title: "Subscription Expiring", description: "QuickTest Diagnostics (Basic plan) expires in 7 days.", link: "/admin/subscriptions", time: "2026-03-22T18:00:00Z", read: true },
  { id: "NOT-006", type: "system_alert", title: "System Alert", description: "Email service response time degraded above 2s threshold.", link: "/admin/platform-health", time: "2026-03-22T15:30:00Z", read: true },
  { id: "NOT-007", type: "new_lab_application", title: "New Lab Application", description: "GlobeCare Labs (Surat) submitted documents for verification.", link: "/admin/onboarding", time: "2026-03-22T12:00:00Z", read: true },
  { id: "NOT-008", type: "flagged_report", title: "Report Flagged", description: "RPT-9007 flagged — possible data integrity issue detected.", link: "/admin/reports", time: "2026-03-22T09:45:00Z", read: true },
  { id: "NOT-009", type: "payout_request", title: "Payout Approved", description: "Payout of ₹82,000 for Apex Diagnostics processed successfully.", link: "/admin/financials", time: "2026-03-21T16:00:00Z", read: true },
  { id: "NOT-010", type: "support_ticket_high", title: "High Priority Ticket", description: "Arun Patel: 'Wrong test results uploaded' — requires action.", link: "/admin/support", time: "2026-03-21T10:00:00Z", read: true },
  { id: "NOT-011", type: "subscription_expiring", title: "Subscription Expiring", description: "NovaMed Diagnostics (Starter) expires tomorrow.", link: "/admin/subscriptions", time: "2026-03-20T09:00:00Z", read: true },
  { id: "NOT-012", type: "system_alert", title: "System Alert", description: "Database backup completed successfully at 02:00 AM.", link: "/admin/platform-health", time: "2026-03-20T02:05:00Z", read: true },
  { id: "NOT-013", type: "new_lab_application", title: "New Lab Application", description: "MedFirst Labs (Delhi) has completed document submission.", link: "/admin/onboarding", time: "2026-03-19T14:00:00Z", read: true },
  { id: "NOT-014", type: "flagged_report", title: "Review Flagged", description: "Review REV-018 flagged: patient reported incorrect patient name on report.", link: "/admin/reviews", time: "2026-03-19T11:00:00Z", read: true },
  { id: "NOT-015", type: "payout_request", title: "Payout Hold", description: "Payout for MetroScan Labs placed on hold — missing bank details.", link: "/admin/financials", time: "2026-03-18T15:00:00Z", read: true },
];
