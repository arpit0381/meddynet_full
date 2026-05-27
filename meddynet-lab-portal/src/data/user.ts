export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  memberSince: string;
}

export const currentUser: UserProfile = {
  id: "USR-089",
  name: "Arpit Sharma",
  email: "arpit@example.com",
  phone: "+91 9876543210",
  avatar: "AS",
  age: 28,
  gender: "Male",
  bloodGroup: "O+",
  memberSince: "Jan 2024",
};
