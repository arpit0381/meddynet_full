export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  profile_image_url?: string;
  age: number | string;
  pan_card?: string;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  memberSince: string;
  wallet_balance: number;
}

export interface Address {
  id: string;
  label: string;
  fullAddress: string;
  isDefault: boolean;
}

export const currentUser: UserProfile = {
  id: "",
  name: "",
  email: "",
  phone: "",
  avatar: "",
  age: "",
  gender: "Male",
  bloodGroup: "",
  memberSince: "",
  wallet_balance: 0,
};

export const savedAddresses: Address[] = [
  {
    id: "addr1",
    label: "Home",
    fullAddress: "14B, Green Park Extension, New Delhi - 110016",
    isDefault: true,
  },
  {
    id: "addr2",
    label: "Office",
    fullAddress: "Cyber City, DLF Phase 2, Gurugram - 122002",
    isDefault: false,
  },
];
