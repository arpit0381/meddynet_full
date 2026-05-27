export interface Lab {
  id: string;
  name: string;
  slug: string;
  initials: string;
  rating: number;
  reviewCount: number;
  distance: number;
  address: string;
  city: string;
  verified: boolean;
  nabl: boolean;
  iso: boolean;
  homeCollection: boolean;
  operatingHours: string;
  phone: string;
  email?: string;
  website?: string;
  about: string;
  image: string;
  color: string;
  established?: number;
  totalPatients?: number;
  specialties?: string[];
  ratingBreakdown?: { stars: number; count: number }[];
  tests: LabTest[];
  reviews: Review[];
  facilities?: Facility[];
}

export interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  turnaround: string;
  homeCollectionAvailable: boolean;
  popular: boolean;
  description?: string;
  parameters?: number;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  helpful?: number;
  verified?: boolean;
  testName?: string;
}

export interface Facility {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}

export const labs: Lab[] = [
  {
    id: "1",
    name: "HealthPlus Diagnostics",
    slug: "healthplus-diagnostics",
    initials: "H+",
    rating: 4.8,
    reviewCount: 1243,
    distance: 1.2,
    address: "45, MG Road, Sector 12",
    city: "New Delhi",
    verified: true,
    nabl: true,
    iso: true,
    homeCollection: true,
    operatingHours: "7:00 AM - 9:00 PM",
    phone: "+91 98765 43210",
    email: "info@healthplusdiag.com",
    website: "www.healthplusdiag.com",
    about: "HealthPlus Diagnostics is a NABL-accredited pathology lab offering a wide range of diagnostic services with state-of-the-art equipment and experienced pathologists.",
    image: "/labs/healthplus.jpg",
    color: "from-blue-500 to-blue-600",
    established: 2010,
    totalPatients: 52000,
    specialties: ["Hematology", "Thyroid", "Cardiology", "Diabetes", "Vitamins"],
    tests: [
      { id: "t1", name: "Complete Blood Count (CBC)", category: "Hematology", price: 399, originalPrice: 699, turnaround: "Same Day", homeCollectionAvailable: true, popular: true },
      { id: "t2", name: "Thyroid Profile (T3, T4, TSH)", category: "Thyroid", price: 599, originalPrice: 999, turnaround: "Same Day", homeCollectionAvailable: true, popular: true },
    ],
    reviews: [],
  },
];

export function getLabById(id: string): Lab | undefined {
  return labs.find((lab) => lab.id === id);
}

export function getLabBySlug(slug: string): Lab | undefined {
  return labs.find((lab) => lab.slug === slug);
}
