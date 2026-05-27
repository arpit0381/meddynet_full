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
    about: "HealthPlus Diagnostics is a NABL-accredited pathology lab offering a wide range of diagnostic services with state-of-the-art equipment and experienced pathologists. We are committed to providing accurate and timely results to help our patients lead healthier lives.",
    image: "/labs/healthplus.jpg",
    color: "from-blue-500 to-blue-600",
    established: 2010,
    totalPatients: 52000,
    specialties: ["Hematology", "Thyroid", "Cardiology", "Diabetes", "Vitamins"],
    ratingBreakdown: [
      { stars: 5, count: 820 },
      { stars: 4, count: 280 },
      { stars: 3, count: 90 },
      { stars: 2, count: 33 },
      { stars: 1, count: 20 },
    ],
    tests: [
      { id: "t1", name: "Complete Blood Count (CBC)", category: "Hematology", price: 399, originalPrice: 699, turnaround: "Same Day", homeCollectionAvailable: true, popular: true, description: "Evaluates overall health and detects disorders including anemia, infection, and leukemia.", parameters: 25 },
      { id: "t2", name: "Thyroid Profile (T3, T4, TSH)", category: "Thyroid", price: 599, originalPrice: 999, turnaround: "Same Day", homeCollectionAvailable: true, popular: true, description: "Comprehensive thyroid function assessment with T3, T4 and TSH levels.", parameters: 3 },
      { id: "t3", name: "Lipid Profile", category: "Cardiology", price: 499, originalPrice: 899, turnaround: "Same Day", homeCollectionAvailable: true, popular: true, description: "Measures cholesterol levels to assess cardiovascular risk.", parameters: 8 },
      { id: "t4", name: "Vitamin D (25-OH)", category: "Vitamins", price: 699, originalPrice: 1299, turnaround: "Next Day", homeCollectionAvailable: true, popular: false, description: "Measures vitamin D levels in blood to assess deficiency.", parameters: 1 },
      { id: "t5", name: "HbA1c (Glycated Hemoglobin)", category: "Diabetes", price: 449, originalPrice: 799, turnaround: "Same Day", homeCollectionAvailable: true, popular: true, description: "Indicates average blood sugar levels over the past 2-3 months.", parameters: 1 },
      { id: "t6", name: "Liver Function Test (LFT)", category: "Liver", price: 549, originalPrice: 999, turnaround: "Same Day", homeCollectionAvailable: true, popular: false, description: "Assesses liver health through various enzyme and protein measurements.", parameters: 11 },
      { id: "t7", name: "Kidney Function Test (KFT)", category: "Kidney", price: 549, originalPrice: 999, turnaround: "Same Day", homeCollectionAvailable: true, popular: false, description: "Evaluates kidney function and detects early signs of kidney disease.", parameters: 9 },
      { id: "t8", name: "Vitamin B12", category: "Vitamins", price: 599, originalPrice: 999, turnaround: "Next Day", homeCollectionAvailable: true, popular: false, description: "Measures vitamin B12 levels crucial for nerve function and red blood cells.", parameters: 1 },
    ],
    reviews: [
      { id: "r1", name: "Priya Sharma", rating: 5, date: "2 days ago", comment: "Excellent service! The technician was very professional and reports were delivered on time. The digital report feature is a huge plus.", helpful: 12, verified: true, testName: "CBC + Thyroid Profile" },
      { id: "r2", name: "Rahul Verma", rating: 4, date: "1 week ago", comment: "Good lab with accurate results. Home collection was very convenient. Slight wait at the reception but overall great experience.", helpful: 8, verified: true, testName: "Lipid Profile" },
      { id: "r3", name: "Anita Gupta", rating: 5, date: "2 weeks ago", comment: "Very clean facility and the staff is very helpful. Got my vitamin D and B12 reports within 24 hours. Highly recommended!", helpful: 21, verified: false, testName: "Vitamin D + B12" },
    ],
    facilities: [
      { id: "f1", name: "NABL Accredited", icon: "award", description: "Certified by National Accreditation Board for Testing and Calibration Laboratories.", available: true },
      { id: "f2", name: "ISO 9001:2015 Certified", icon: "shield", description: "Meets international standards for quality management systems.", available: true },
      { id: "f3", name: "Home Sample Collection", icon: "home", description: "Trained phlebotomists visit your home at your preferred time slot.", available: true },
      { id: "f4", name: "Digital Reports", icon: "file-text", description: "Reports delivered digitally via email and app within the promised time.", available: true },
      { id: "f5", name: "Senior Pathologist Review", icon: "user-check", description: "Every report is reviewed and signed off by experienced pathologists.", available: true },
      { id: "f6", name: "24/7 Customer Support", icon: "headphones", description: "Round-the-clock support for queries, bookings, and results clarification.", available: true },
      { id: "f7", name: "Automated Lab Analysis", icon: "cpu", description: "State-of-the-art automated analyzers for maximum accuracy and speed.", available: true },
      { id: "f8", name: "Wheelchair Accessible", icon: "accessibility", description: "Fully accessible facility for patients with mobility challenges.", available: true },
      { id: "f9", name: "Dedicated Pediatric Phlebotomy", icon: "baby", description: "Specialized staff trained for blood collection from children.", available: false },
      { id: "f10", name: "On-Site Doctor Consultation", icon: "stethoscope", description: "Doctor available for result interpretation and follow-up consultation.", available: false },
    ],
  },
  {
    id: "2",
    name: "MedLife Pathology",
    slug: "medlife-pathology",
    initials: "ML",
    rating: 4.6,
    reviewCount: 892,
    distance: 2.5,
    address: "12, Civil Lines",
    city: "New Delhi",
    verified: true,
    nabl: false,
    iso: true,
    homeCollection: true,
    operatingHours: "6:30 AM - 8:00 PM",
    about: "MedLife Pathology offers comprehensive diagnostic services with a focus on affordability and accuracy. Our team of experienced technicians and pathologists ensure quality results every time.",
    image: "/labs/medlife.jpg",
    color: "from-emerald-500 to-emerald-600",
    tests: [
      { id: "t9", name: "Complete Blood Count (CBC)", category: "Hematology", price: 349, originalPrice: 599, turnaround: "Same Day", homeCollectionAvailable: true, popular: true },
      { id: "t10", name: "Thyroid Profile (T3, T4, TSH)", category: "Thyroid", price: 549, originalPrice: 899, turnaround: "Next Day", homeCollectionAvailable: true, popular: true },
      { id: "t11", name: "Lipid Profile", category: "Cardiology", price: 449, originalPrice: 799, turnaround: "Same Day", homeCollectionAvailable: true, popular: true },
      { id: "t12", name: "Vitamin D (25-OH)", category: "Vitamins", price: 649, originalPrice: 1199, turnaround: "Next Day", homeCollectionAvailable: true, popular: false },
      { id: "t13", name: "HbA1c (Glycated Hemoglobin)", category: "Diabetes", price: 399, originalPrice: 699, turnaround: "Same Day", homeCollectionAvailable: true, popular: true },
    ],
    reviews: [
      { id: "r4", name: "Suresh Kumar", rating: 5, date: "3 days ago", comment: "Affordable pricing with quality results. Very satisfied with the service." },
      { id: "r5", name: "Meena Patel", rating: 4, date: "1 week ago", comment: "Quick turnaround time and friendly staff." },
    ],
  },
  {
    id: "3",
    name: "DiagCare Labs",
    slug: "diagcare-labs",
    initials: "DC",
    rating: 4.9,
    reviewCount: 2156,
    distance: 0.8,
    address: "78, Nehru Place",
    city: "New Delhi",
    verified: true,
    nabl: true,
    iso: true,
    homeCollection: true,
    operatingHours: "6:00 AM - 10:00 PM",
    about: "DiagCare Labs is a premium NABL and ISO certified diagnostic center with cutting-edge technology and an unwavering commitment to accuracy. We offer same-day results for most tests and 2-hour express results for urgent cases.",
    image: "/labs/diagcare.jpg",
    color: "from-orange-500 to-orange-600",
    tests: [
      { id: "t14", name: "Complete Blood Count (CBC)", category: "Hematology", price: 449, originalPrice: 799, turnaround: "2 Hours", homeCollectionAvailable: true, popular: true },
      { id: "t15", name: "Thyroid Profile (T3, T4, TSH)", category: "Thyroid", price: 649, originalPrice: 1099, turnaround: "Same Day", homeCollectionAvailable: true, popular: true },
      { id: "t16", name: "Lipid Profile", category: "Cardiology", price: 549, originalPrice: 999, turnaround: "2 Hours", homeCollectionAvailable: true, popular: true },
      { id: "t17", name: "Vitamin D (25-OH)", category: "Vitamins", price: 749, originalPrice: 1399, turnaround: "Same Day", homeCollectionAvailable: true, popular: false },
      { id: "t18", name: "HbA1c (Glycated Hemoglobin)", category: "Diabetes", price: 499, originalPrice: 899, turnaround: "2 Hours", homeCollectionAvailable: true, popular: true },
      { id: "t19", name: "Full Body Health Checkup", category: "Packages", price: 1999, originalPrice: 4999, turnaround: "Next Day", homeCollectionAvailable: true, popular: true },
    ],
    reviews: [
      { id: "r6", name: "Dr. Rajesh", rating: 5, date: "1 day ago", comment: "Best diagnostic lab in the area. Extremely accurate and fast results." },
      { id: "r7", name: "Kavita Singh", rating: 5, date: "3 days ago", comment: "Premium experience! Clean, professional, and very quick turnaround." },
      { id: "r8", name: "Amit Joshi", rating: 4, date: "1 week ago", comment: "Slightly expensive but worth every penny for the quality." },
    ],
  },
  {
    id: "4",
    name: "CityPath Diagnostics",
    slug: "citypath-diagnostics",
    initials: "CP",
    rating: 4.5,
    reviewCount: 567,
    distance: 3.2,
    address: "23, Lajpat Nagar",
    city: "New Delhi",
    verified: true,
    nabl: true,
    iso: false,
    homeCollection: false,
    operatingHours: "7:00 AM - 7:00 PM",
    about: "CityPath Diagnostics provides reliable diagnostic services at competitive prices. With NABL accreditation and experienced pathologists, we ensure accurate and timely test results.",
    image: "/labs/citypath.jpg",
    color: "from-purple-500 to-purple-600",
    tests: [
      { id: "t20", name: "Complete Blood Count (CBC)", category: "Hematology", price: 299, originalPrice: 499, turnaround: "Same Day", homeCollectionAvailable: false, popular: true },
      { id: "t21", name: "Thyroid Profile (T3, T4, TSH)", category: "Thyroid", price: 499, originalPrice: 799, turnaround: "Same Day", homeCollectionAvailable: false, popular: true },
      { id: "t22", name: "Lipid Profile", category: "Cardiology", price: 399, originalPrice: 699, turnaround: "Same Day", homeCollectionAvailable: false, popular: true },
      { id: "t23", name: "Vitamin D (25-OH)", category: "Vitamins", price: 599, originalPrice: 999, turnaround: "Next Day", homeCollectionAvailable: false, popular: false },
    ],
    reviews: [
      { id: "r9", name: "Neha Agarwal", rating: 4, date: "5 days ago", comment: "Good service and reasonable prices. Would recommend." },
      { id: "r10", name: "Vikram Malhotra", rating: 5, date: "2 weeks ago", comment: "Very reliable results. Been going here for years." },
    ],
  },
  {
    id: "5",
    name: "Apollo Path Labs",
    slug: "apollo-path-labs",
    initials: "AP",
    rating: 4.7,
    reviewCount: 1876,
    distance: 1.8,
    address: "98, Connaught Place",
    city: "New Delhi",
    verified: true,
    nabl: true,
    iso: true,
    homeCollection: true,
    operatingHours: "24/7",
    about: "Apollo Path Labs is part of the renowned Apollo Healthcare Group. We offer comprehensive diagnostic services with international quality standards, 24/7 availability, and home sample collection across the city.",
    image: "/labs/apollo.jpg",
    color: "from-teal-500 to-teal-600",
    tests: [
      { id: "t24", name: "Complete Blood Count (CBC)", category: "Hematology", price: 499, originalPrice: 899, turnaround: "Same Day", homeCollectionAvailable: true, popular: true },
      { id: "t25", name: "Thyroid Profile (T3, T4, TSH)", category: "Thyroid", price: 699, originalPrice: 1199, turnaround: "Same Day", homeCollectionAvailable: true, popular: true },
      { id: "t26", name: "Lipid Profile", category: "Cardiology", price: 599, originalPrice: 1099, turnaround: "Same Day", homeCollectionAvailable: true, popular: true },
      { id: "t27", name: "Vitamin D (25-OH)", category: "Vitamins", price: 799, originalPrice: 1499, turnaround: "Same Day", homeCollectionAvailable: true, popular: false },
      { id: "t28", name: "Full Body Health Checkup", category: "Packages", price: 2499, originalPrice: 5999, turnaround: "Next Day", homeCollectionAvailable: true, popular: true },
    ],
    reviews: [
      { id: "r11", name: "Dr. Arun", rating: 5, date: "2 days ago", comment: "Internationally accredited lab with top-notch facilities. Highly trustworthy." },
      { id: "r12", name: "Sonia Kapoor", rating: 4, date: "4 days ago", comment: "Convenient 24/7 service. Home collection was prompt and professional." },
    ],
  },
  {
    id: "6",
    name: "LifeCare Diagnostics",
    slug: "lifecare-diagnostics",
    initials: "LC",
    rating: 4.4,
    reviewCount: 421,
    distance: 4.1,
    address: "56, Saket District Centre",
    city: "New Delhi",
    verified: true,
    nabl: false,
    iso: true,
    homeCollection: true,
    operatingHours: "8:00 AM - 8:00 PM",
    about: "LifeCare Diagnostics offers value-for-money diagnostic services with ISO certification. We believe that quality healthcare should be accessible and affordable for everyone.",
    image: "/labs/lifecare.jpg",
    color: "from-rose-500 to-rose-600",
    tests: [
      { id: "t29", name: "Complete Blood Count (CBC)", category: "Hematology", price: 279, originalPrice: 499, turnaround: "Same Day", homeCollectionAvailable: true, popular: true },
      { id: "t30", name: "Thyroid Profile (T3, T4, TSH)", category: "Thyroid", price: 449, originalPrice: 799, turnaround: "Next Day", homeCollectionAvailable: true, popular: true },
      { id: "t31", name: "Lipid Profile", category: "Cardiology", price: 349, originalPrice: 649, turnaround: "Same Day", homeCollectionAvailable: true, popular: true },
      { id: "t32", name: "Vitamin D (25-OH)", category: "Vitamins", price: 549, originalPrice: 999, turnaround: "Next Day", homeCollectionAvailable: false, popular: false },
    ],
    reviews: [
      { id: "r13", name: "Pooja Bhatia", rating: 4, date: "1 week ago", comment: "Most affordable lab with decent quality. Good for routine tests." },
    ],
  },
];

export function getLabById(id: string): Lab | undefined {
  return labs.find((lab) => lab.id === id);
}

export function getLabBySlug(slug: string): Lab | undefined {
  return labs.find((lab) => lab.slug === slug);
}
