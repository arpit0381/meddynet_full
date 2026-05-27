export interface TestInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  popular: boolean;
  minPrice: number;
  maxPrice: number;
  labCount: number;
}

export const popularTests: TestInfo[] = [
  { id: "pt1", name: "Complete Blood Count (CBC)", category: "Hematology", description: "Measures red blood cells, white blood cells, and platelets", icon: "🩸", popular: true, minPrice: 279, maxPrice: 499, labCount: 6 },
  { id: "pt2", name: "Thyroid Profile (T3, T4, TSH)", category: "Thyroid", description: "Comprehensive thyroid function assessment", icon: "🦋", popular: true, minPrice: 449, maxPrice: 699, labCount: 6 },
  { id: "pt3", name: "Lipid Profile", category: "Cardiology", description: "Cholesterol and triglyceride levels for heart health", icon: "🫀", popular: true, minPrice: 349, maxPrice: 599, labCount: 6 },
  { id: "pt4", name: "Vitamin D (25-OH)", category: "Vitamins", description: "Check your Vitamin D levels for bone health", icon: "☀️", popular: true, minPrice: 549, maxPrice: 799, labCount: 6 },
  { id: "pt5", name: "HbA1c (Glycated Hemoglobin)", category: "Diabetes", description: "3-month average blood sugar level indicator", icon: "🔬", popular: true, minPrice: 399, maxPrice: 499, labCount: 5 },
  { id: "pt6", name: "Liver Function Test (LFT)", category: "Liver", description: "Evaluates liver health and function", icon: "🫁", popular: false, minPrice: 449, maxPrice: 649, labCount: 3 },
  { id: "pt7", name: "Kidney Function Test (KFT)", category: "Kidney", description: "Assesses kidney health and filtration", icon: "🫘", popular: false, minPrice: 449, maxPrice: 649, labCount: 3 },
  { id: "pt8", name: "Vitamin B12", category: "Vitamins", description: "Essential vitamin for nerve function and blood cells", icon: "💊", popular: false, minPrice: 499, maxPrice: 699, labCount: 3 },
  { id: "pt9", name: "Full Body Health Checkup", category: "Packages", description: "Comprehensive health screening package with 50+ tests", icon: "🏥", popular: true, minPrice: 1999, maxPrice: 2499, labCount: 2 },
  { id: "pt10", name: "Covid RT-PCR", category: "Infectious Disease", description: "COVID-19 detection with RT-PCR method", icon: "🧫", popular: false, minPrice: 299, maxPrice: 599, labCount: 4 },
  { id: "pt11", name: "Urine Routine & Microscopy", category: "Urology", description: "Basic urine analysis for infections and conditions", icon: "🧪", popular: false, minPrice: 149, maxPrice: 299, labCount: 5 },
  { id: "pt12", name: "Blood Sugar Fasting", category: "Diabetes", description: "Fasting blood glucose level measurement", icon: "💉", popular: false, minPrice: 99, maxPrice: 199, labCount: 6 },
  { id: "pt13", name: "Iron Studies", category: "Hematology", description: "Serum iron, TIBC, and ferritin levels", icon: "⚡", popular: false, minPrice: 599, maxPrice: 999, labCount: 4 },
  { id: "pt14", name: "Vitamin Panel", category: "Vitamins", description: "Complete vitamin analysis (D, B12, Folate)", icon: "🌿", popular: false, minPrice: 1299, maxPrice: 1999, labCount: 3 },
  { id: "pt15", name: "Allergy Panel", category: "Immunology", description: "IgE-based allergy screening for common allergens", icon: "🤧", popular: false, minPrice: 1499, maxPrice: 2499, labCount: 2 },
];

export const testCategories = [
  "All",
  "Hematology",
  "Thyroid",
  "Cardiology",
  "Vitamins",
  "Diabetes",
  "Liver",
  "Kidney",
  "Packages",
  "Infectious Disease",
  "Urology",
  "Immunology",
];

export const searchSuggestions = [
  "Blood Test",
  "Thyroid Test",
  "Vitamin D",
  "CBC",
  "Lipid Profile",
  "Sugar Test",
  "Full Body Checkup",
  "COVID Test",
  "Liver Function",
  "Kidney Function",
];
