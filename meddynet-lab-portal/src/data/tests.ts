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
