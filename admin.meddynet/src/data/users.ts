export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  gender: "Male" | "Female";
  age: number;
  status: "Active" | "Inactive" | "Suspended";
  joinedAt: string;
  totalBookings: number;
  totalSpent: number;
}

export const mockUsers: User[] = [
  { id: "USR-001", name: "Ramesh Kumar", email: "ramesh.kumar@gmail.com", phone: "+91 98765 43210", city: "Delhi", state: "Delhi", gender: "Male", age: 34, status: "Active", joinedAt: "2025-06-10T09:00:00Z", totalBookings: 12, totalSpent: 8400 },
  { id: "USR-002", name: "Priya Sharma", email: "priya.sharma@yahoo.com", phone: "+91 87654 32109", city: "Mumbai", state: "Maharashtra", gender: "Female", age: 27, status: "Active", joinedAt: "2025-07-15T10:30:00Z", totalBookings: 5, totalSpent: 3250 },
  { id: "USR-003", name: "Arun Patel", email: "arun.patel@hotmail.com", phone: "+91 76543 21098", city: "Ahmedabad", state: "Gujarat", gender: "Male", age: 45, status: "Active", joinedAt: "2025-05-20T08:00:00Z", totalBookings: 18, totalSpent: 14200 },
  { id: "USR-004", name: "Sunita Devi", email: "sunita.devi@gmail.com", phone: "+91 65432 10987", city: "Bangalore", state: "Karnataka", gender: "Female", age: 38, status: "Active", joinedAt: "2025-08-01T11:00:00Z", totalBookings: 7, totalSpent: 5100 },
  { id: "USR-005", name: "Mohan Reddy", email: "mohan.reddy@gmail.com", phone: "+91 54321 09876", city: "Hyderabad", state: "Telangana", gender: "Male", age: 52, status: "Inactive", joinedAt: "2025-04-12T07:30:00Z", totalBookings: 3, totalSpent: 1800 },
  { id: "USR-006", name: "Kavita Singh", email: "kavita.singh@gmail.com", phone: "+91 93214 56789", city: "Pune", state: "Maharashtra", gender: "Female", age: 29, status: "Active", joinedAt: "2025-09-05T13:00:00Z", totalBookings: 9, totalSpent: 6300 },
  { id: "USR-007", name: "Deepak Verma", email: "deepak.verma@gmail.com", phone: "+91 82103 45678", city: "Jaipur", state: "Rajasthan", gender: "Male", age: 41, status: "Active", joinedAt: "2025-07-22T09:45:00Z", totalBookings: 15, totalSpent: 11000 },
  { id: "USR-008", name: "Anita Nair", email: "anita.nair@gmail.com", phone: "+91 71092 34567", city: "Kochi", state: "Kerala", gender: "Female", age: 33, status: "Active", joinedAt: "2025-10-10T14:00:00Z", totalBookings: 4, totalSpent: 2800 },
  { id: "USR-009", name: "Suresh Menon", email: "suresh.menon@gmail.com", phone: "+91 60981 23456", city: "Chennai", state: "Tamil Nadu", gender: "Male", age: 47, status: "Suspended", joinedAt: "2025-03-18T08:30:00Z", totalBookings: 22, totalSpent: 17500 },
  { id: "USR-010", name: "Pooja Ghosh", email: "pooja.ghosh@gmail.com", phone: "+91 59870 12345", city: "Kolkata", state: "West Bengal", gender: "Female", age: 31, status: "Active", joinedAt: "2025-11-02T10:00:00Z", totalBookings: 6, totalSpent: 4200 },
  { id: "USR-011", name: "Rajiv Malhotra", email: "rajiv.m@gmail.com", phone: "+91 99123 45678", city: "Delhi", state: "Delhi", gender: "Male", age: 55, status: "Active", joinedAt: "2025-02-14T09:00:00Z", totalBookings: 28, totalSpent: 21000 },
  { id: "USR-012", name: "Meena Iyer", email: "meena.iyer@gmail.com", phone: "+91 88234 56789", city: "Bangalore", state: "Karnataka", gender: "Female", age: 24, status: "Active", joinedAt: "2026-01-05T11:30:00Z", totalBookings: 2, totalSpent: 1200 },
  { id: "USR-013", name: "Vikram Joshi", email: "vikram.joshi@gmail.com", phone: "+91 77345 67890", city: "Pune", state: "Maharashtra", gender: "Male", age: 36, status: "Active", joinedAt: "2025-12-20T08:00:00Z", totalBookings: 10, totalSpent: 7800 },
  { id: "USR-014", name: "Lakshmi Rao", email: "lakshmi.rao@gmail.com", phone: "+91 66456 78901", city: "Hyderabad", state: "Telangana", gender: "Female", age: 42, status: "Active", joinedAt: "2025-06-30T12:00:00Z", totalBookings: 14, totalSpent: 9800 },
  { id: "USR-015", name: "Amit Tiwari", email: "amit.tiwari@gmail.com", phone: "+91 55567 89012", city: "Lucknow", state: "Uttar Pradesh", gender: "Male", age: 39, status: "Active", joinedAt: "2025-08-18T10:15:00Z", totalBookings: 8, totalSpent: 5600 },
  { id: "USR-016", name: "Radha Krishnan", email: "radha.k@gmail.com", phone: "+91 44678 90123", city: "Chennai", state: "Tamil Nadu", gender: "Female", age: 26, status: "Active", joinedAt: "2026-02-10T09:30:00Z", totalBookings: 3, totalSpent: 1900 },
  { id: "USR-017", name: "Ganesh Pillai", email: "ganesh.pillai@gmail.com", phone: "+91 33789 01234", city: "Kochi", state: "Kerala", gender: "Male", age: 50, status: "Active", joinedAt: "2025-05-05T08:45:00Z", totalBookings: 20, totalSpent: 15600 },
  { id: "USR-018", name: "Sonal Bhatia", email: "sonal.bhatia@gmail.com", phone: "+91 22890 12345", city: "Ahmedabad", state: "Gujarat", gender: "Female", age: 28, status: "Active", joinedAt: "2025-09-22T13:30:00Z", totalBookings: 6, totalSpent: 4100 },
  { id: "USR-019", name: "Harish Gupta", email: "harish.gupta@gmail.com", phone: "+91 11901 23456", city: "Jaipur", state: "Rajasthan", gender: "Male", age: 44, status: "Inactive", joinedAt: "2025-04-28T07:00:00Z", totalBookings: 11, totalSpent: 7200 },
  { id: "USR-020", name: "Nikita Choudhary", email: "nikita.c@gmail.com", phone: "+91 99012 34567", city: "Kolkata", state: "West Bengal", gender: "Female", age: 22, status: "Active", joinedAt: "2026-03-01T12:00:00Z", totalBookings: 1, totalSpent: 650 },
  { id: "USR-021", name: "Sanjeev Nath", email: "sanjeev.nath@gmail.com", phone: "+91 98123 45670", city: "Bhopal", state: "Madhya Pradesh", gender: "Male", age: 48, status: "Active", joinedAt: "2025-07-08T09:00:00Z", totalBookings: 16, totalSpent: 12400 },
  { id: "USR-022", name: "Deepika Yadav", email: "deepika.yadav@gmail.com", phone: "+91 87234 56780", city: "Nagpur", state: "Maharashtra", gender: "Female", age: 35, status: "Active", joinedAt: "2025-10-15T10:00:00Z", totalBookings: 7, totalSpent: 5300 },
  { id: "USR-023", name: "Kiran Babu", email: "kiran.babu@gmail.com", phone: "+91 76345 67890", city: "Visakhapatnam", state: "Andhra Pradesh", gender: "Male", age: 31, status: "Active", joinedAt: "2025-11-20T08:30:00Z", totalBookings: 5, totalSpent: 3700 },
  { id: "USR-024", name: "Shobha Naik", email: "shobha.naik@gmail.com", phone: "+91 65456 78901", city: "Goa", state: "Goa", gender: "Female", age: 37, status: "Active", joinedAt: "2025-08-30T11:00:00Z", totalBookings: 9, totalSpent: 6800 },
  { id: "USR-025", name: "Praveen Kumar", email: "praveen.k@gmail.com", phone: "+91 54567 89012", city: "Chandigarh", state: "Punjab", gender: "Male", age: 30, status: "Active", joinedAt: "2026-01-15T14:00:00Z", totalBookings: 4, totalSpent: 2900 },
  { id: "USR-026", name: "Aruna Saxena", email: "aruna.saxena@gmail.com", phone: "+91 43678 90123", city: "Agra", state: "Uttar Pradesh", gender: "Female", age: 43, status: "Suspended", joinedAt: "2025-06-15T10:00:00Z", totalBookings: 13, totalSpent: 9200 },
  { id: "USR-027", name: "Sunil Pandey", email: "sunil.pandey@gmail.com", phone: "+91 32789 01234", city: "Varanasi", state: "Uttar Pradesh", gender: "Male", age: 56, status: "Active", joinedAt: "2025-03-10T08:00:00Z", totalBookings: 25, totalSpent: 19000 },
  { id: "USR-028", name: "Nandini Desai", email: "nandini.desai@gmail.com", phone: "+91 21890 12345", city: "Surat", state: "Gujarat", gender: "Female", age: 32, status: "Active", joinedAt: "2025-12-05T09:30:00Z", totalBookings: 6, totalSpent: 4500 },
  { id: "USR-029", name: "Rohit Kapoor", email: "rohit.kapoor@gmail.com", phone: "+91 90901 23456", city: "Amritsar", state: "Punjab", gender: "Male", age: 25, status: "Active", joinedAt: "2026-02-20T13:00:00Z", totalBookings: 2, totalSpent: 1400 },
  { id: "USR-030", name: "Lalitha Subramanian", email: "lalitha.s@gmail.com", phone: "+91 89012 34567", city: "Coimbatore", state: "Tamil Nadu", gender: "Female", age: 40, status: "Active", joinedAt: "2025-09-12T11:30:00Z", totalBookings: 11, totalSpent: 8100 },
  // Additional users for variety
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `USR-${String(31 + i).padStart(3, "0")}`,
    name: ["Ravi Shankar", "Geeta Patel", "Suresh Babu", "Preethi Nair", "Dinesh Rajan", "Kaveri Rao", "Manish Dubey", "Swati Kulkarni", "Ajay Bhatt", "Rekha Murthy", "Arjun Sinha", "Padma Reddy", "Santosh Pillai", "Malini Krishnan", "Tarun Ahuja", "Vandana Srivastava", "Naresh Mehta", "Sudha Prabhu", "Yash Aggarwal", "Divya Menon"][i],
    email: `user${31 + i}@gmail.com`,
    phone: `+91 ${80000 + i * 1234} ${10000 + i * 567}`,
    city: ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Kochi"][i % 10],
    state: ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Telangana", "Maharashtra", "West Bengal", "Gujarat", "Rajasthan", "Kerala"][i % 10],
    gender: (i % 2 === 0 ? "Male" : "Female") as "Male" | "Female",
    age: 22 + (i * 3) % 40,
    status: (i % 7 === 0 ? "Inactive" : i % 11 === 0 ? "Suspended" : "Active") as "Active" | "Inactive" | "Suspended",
    joinedAt: new Date(2025, i % 12, (i * 7 + 1) % 28 + 1).toISOString(),
    totalBookings: (i * 3 + 1) % 25,
    totalSpent: ((i * 3 + 1) % 25) * 750,
  })),
];
