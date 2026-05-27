export interface SupportTicket {
  id: string;
  userId: string;
  user: string;
  userType: "Patient" | "Lab";
  subject: string;
  description: string;
  channel: "Chat" | "Email" | "Phone";
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  messages: { sender: "user" | "admin"; text: string; time: string }[];
}

export const mockSupportTickets: SupportTicket[] = [
  { id: "TKT-8001", userId: "USR-001", user: "Ramesh Kumar", userType: "Patient", subject: "App crashed during payment", description: "When I tried to pay for my booking, the app crashed and money was deducted but booking not confirmed.", channel: "Chat", priority: "High", status: "Open", assignedTo: null, createdAt: "2026-03-22T10:30:00Z", updatedAt: "2026-03-22T10:30:00Z", messages: [{ sender: "user", text: "My payment failed but money got deducted!", time: "2026-03-22T10:30:00Z" }] },
  { id: "TKT-8002", userId: "LAB-002", user: "CityLab Diagnostics", userType: "Lab", subject: "Report upload not working", description: "We are unable to upload PDF reports for the last 2 days.", channel: "Email", priority: "High", status: "In Progress", assignedTo: "Support Agent 1", createdAt: "2026-03-21T09:00:00Z", updatedAt: "2026-03-21T14:00:00Z", messages: [{ sender: "user", text: "Report upload failing since 2 days", time: "2026-03-21T09:00:00Z" }, { sender: "admin", text: "We are investigating this issue.", time: "2026-03-21T14:00:00Z" }] },
  { id: "TKT-8003", userId: "USR-003", user: "Arun Patel", userType: "Patient", subject: "Wrong test results uploaded", description: "The results belong to another patient. Very concerned.", channel: "Phone", priority: "High", status: "Open", assignedTo: "Support Agent 2", createdAt: "2026-03-23T08:00:00Z", updatedAt: "2026-03-23T08:00:00Z", messages: [{ sender: "user", text: "Wrong results uploaded to my account!", time: "2026-03-23T08:00:00Z" }] },
  { id: "TKT-8004", userId: "USR-005", user: "Mohan Reddy", userType: "Patient", subject: "Technician did not arrive", description: "Booked home collection for 9 AM. No technician came till 11 AM.", channel: "Chat", priority: "Medium", status: "Resolved", assignedTo: "Support Agent 1", createdAt: "2026-03-20T11:00:00Z", updatedAt: "2026-03-20T15:30:00Z", messages: [{ sender: "user", text: "No technician came for home collection", time: "2026-03-20T11:00:00Z" }, { sender: "admin", text: "Sorry for inconvenience. We've raised this with the lab.", time: "2026-03-20T15:30:00Z" }] },
  { id: "TKT-8005", userId: "LAB-004", user: "MediScan Labs", userType: "Lab", subject: "Commission deducted incorrectly", description: "The commission rate is showing 15% but our plan says 12%.", channel: "Email", priority: "Medium", status: "In Progress", assignedTo: "Support Agent 3", createdAt: "2026-03-19T10:00:00Z", updatedAt: "2026-03-19T16:00:00Z", messages: [{ sender: "user", text: "Commission calculated wrongly this month.", time: "2026-03-19T10:00:00Z" }] },
  { id: "TKT-8006", userId: "USR-007", user: "Deepak Verma", userType: "Patient", subject: "Refund not received after 10 days", description: "Cancelled booking on March 10. Still no refund in account.", channel: "Chat", priority: "High", status: "Open", assignedTo: null, createdAt: "2026-03-22T16:00:00Z", updatedAt: "2026-03-22T16:00:00Z", messages: [{ sender: "user", text: "Refund pending since 10 days!", time: "2026-03-22T16:00:00Z" }] },
  { id: "TKT-8007", userId: "USR-009", user: "Suresh Menon", userType: "Patient", subject: "Unable to book — slot not available", description: "Trying to book CBC for tomorrow but getting error no slots available.", channel: "Phone", priority: "Low", status: "Resolved", assignedTo: "Support Agent 2", createdAt: "2026-03-18T09:30:00Z", updatedAt: "2026-03-18T12:00:00Z", messages: [{ sender: "user", text: "Slot booking not working", time: "2026-03-18T09:30:00Z" }, { sender: "admin", text: "There was a temporary slot sync issue. It's resolved now.", time: "2026-03-18T12:00:00Z" }] },
  { id: "TKT-8008", userId: "LAB-006", user: "QuickTest Diagnostics", userType: "Lab", subject: "Login OTP not receiving", description: "Our lab login OTP is not being delivered to registered email.", channel: "Email", priority: "Medium", status: "Resolved", assignedTo: "Support Agent 1", createdAt: "2026-03-17T14:00:00Z", updatedAt: "2026-03-17T17:30:00Z", messages: [{ sender: "user", text: "OTP not received for lab login", time: "2026-03-17T14:00:00Z" }, { sender: "admin", text: "Email configuration has been fixed. Please try again.", time: "2026-03-17T17:30:00Z" }] },
  ...Array.from({ length: 22 }, (_, i) => ({
    id: `TKT-${8009 + i}`,
    userId: `USR-${String((i % 20) + 1).padStart(3, "0")}`,
    user: ["Priya Sharma", "Kavita Singh", "Anita Nair", "Pooja Ghosh", "Rajiv Malhotra", "Vikram Joshi", "Deepika Yadav", "Nandini Desai", "Lalitha Subramanian", "Nikita Choudhary"][i % 10],
    userType: (i % 4 === 0 ? "Lab" : "Patient") as "Patient" | "Lab",
    subject: ["Cancel my upcoming booking", "Request for home collection reschedule", "Change registered phone number", "Test catalog not updated", "Payout not released this month", "Need GST invoice", "Duplicate booking created", "Wrong lab assigned", "App showing wrong address", "Rating not showing on profile"][i % 10],
    description: "Please help me resolve this issue at the earliest.",
    channel: (["Chat", "Email", "Phone"] as const)[i % 3],
    priority: (["High", "Medium", "Low"] as const)[(i * 3) % 3],
    status: (["Open", "In Progress", "Resolved", "Closed"] as const)[(i * 7) % 4],
    assignedTo: i % 3 === 0 ? null : `Support Agent ${(i % 3) + 1}`,
    createdAt: new Date(2026, 2, 23 - i).toISOString(),
    updatedAt: new Date(2026, 2, 23 - i).toISOString(),
    messages: [{ sender: "user" as const, text: "Please help resolve this issue.", time: new Date(2026, 2, 23 - i).toISOString() }],
  })),
];
