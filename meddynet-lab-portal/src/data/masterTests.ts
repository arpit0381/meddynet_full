export interface MasterTest {
  name: string;
  category: string;
  turnaround_hours: number;
  suggested_price: number;
  suggested_mrp: number;
  home_collection: boolean;
}

export const MASTER_TEST_CATALOGUE: MasterTest[] = [
  // Hematology
  { name: "Complete Blood Count (CBC)", category: "Hematology", turnaround_hours: 6, suggested_price: 299, suggested_mrp: 499, home_collection: true },
  { name: "ESR (Erythrocyte Sedimentation Rate)", category: "Hematology", turnaround_hours: 6, suggested_price: 99, suggested_mrp: 149, home_collection: true },
  { name: "CBC + ESR", category: "Hematology", turnaround_hours: 6, suggested_price: 349, suggested_mrp: 549, home_collection: true },
  { name: "Peripheral Blood Smear", category: "Hematology", turnaround_hours: 12, suggested_price: 199, suggested_mrp: 299, home_collection: true },
  { name: "Reticulocyte Count", category: "Hematology", turnaround_hours: 12, suggested_price: 149, suggested_mrp: 249, home_collection: true },
  { name: "PT/INR (Prothrombin Time)", category: "Hematology", turnaround_hours: 6, suggested_price: 199, suggested_mrp: 349, home_collection: true },
  { name: "APTT (Activated Partial Thromboplastin Time)", category: "Hematology", turnaround_hours: 6, suggested_price: 199, suggested_mrp: 349, home_collection: true },
  { name: "D-Dimer", category: "Hematology", turnaround_hours: 12, suggested_price: 599, suggested_mrp: 899, home_collection: true },
  { name: "Bleeding Time & Clotting Time", category: "Hematology", turnaround_hours: 4, suggested_price: 99, suggested_mrp: 149, home_collection: false },

  // Thyroid
  { name: "TSH (Thyroid Stimulating Hormone)", category: "Thyroid", turnaround_hours: 12, suggested_price: 249, suggested_mrp: 399, home_collection: true },
  { name: "T3 (Triiodothyronine)", category: "Thyroid", turnaround_hours: 12, suggested_price: 199, suggested_mrp: 299, home_collection: true },
  { name: "T4 (Thyroxine)", category: "Thyroid", turnaround_hours: 12, suggested_price: 199, suggested_mrp: 299, home_collection: true },
  { name: "Thyroid Profile (T3, T4, TSH)", category: "Thyroid", turnaround_hours: 12, suggested_price: 449, suggested_mrp: 699, home_collection: true },
  { name: "Free T3 + Free T4 + TSH", category: "Thyroid", turnaround_hours: 12, suggested_price: 549, suggested_mrp: 799, home_collection: true },
  { name: "Anti-TPO Antibodies", category: "Thyroid", turnaround_hours: 24, suggested_price: 699, suggested_mrp: 999, home_collection: true },

  // Diabetes
  { name: "Fasting Blood Glucose", category: "Diabetes", turnaround_hours: 4, suggested_price: 69, suggested_mrp: 99, home_collection: true },
  { name: "Post Prandial Glucose (PP)", category: "Diabetes", turnaround_hours: 4, suggested_price: 69, suggested_mrp: 99, home_collection: true },
  { name: "HbA1c (Glycated Hemoglobin)", category: "Diabetes", turnaround_hours: 12, suggested_price: 349, suggested_mrp: 549, home_collection: true },
  { name: "Fasting + PP + HbA1c", category: "Diabetes", turnaround_hours: 12, suggested_price: 449, suggested_mrp: 649, home_collection: true },
  { name: "Insulin Fasting", category: "Diabetes", turnaround_hours: 24, suggested_price: 449, suggested_mrp: 699, home_collection: true },
  { name: "C-Peptide", category: "Diabetes", turnaround_hours: 24, suggested_price: 699, suggested_mrp: 999, home_collection: true },

  // Lipid / Cardiology
  { name: "Lipid Profile", category: "Cardiology", turnaround_hours: 8, suggested_price: 399, suggested_mrp: 599, home_collection: true },
  { name: "Total Cholesterol", category: "Cardiology", turnaround_hours: 8, suggested_price: 99, suggested_mrp: 149, home_collection: true },
  { name: "HDL Cholesterol", category: "Cardiology", turnaround_hours: 8, suggested_price: 149, suggested_mrp: 249, home_collection: true },
  { name: "LDL Cholesterol", category: "Cardiology", turnaround_hours: 8, suggested_price: 149, suggested_mrp: 249, home_collection: true },
  { name: "Triglycerides", category: "Cardiology", turnaround_hours: 8, suggested_price: 149, suggested_mrp: 249, home_collection: true },
  { name: "hs-CRP (High Sensitivity CRP)", category: "Cardiology", turnaround_hours: 24, suggested_price: 549, suggested_mrp: 799, home_collection: true },
  { name: "Troponin I", category: "Cardiology", turnaround_hours: 6, suggested_price: 699, suggested_mrp: 999, home_collection: true },
  { name: "CK-MB (Creatine Kinase-MB)", category: "Cardiology", turnaround_hours: 6, suggested_price: 499, suggested_mrp: 749, home_collection: true },
  { name: "BNP (B-type Natriuretic Peptide)", category: "Cardiology", turnaround_hours: 24, suggested_price: 1499, suggested_mrp: 1999, home_collection: true },

  // Liver
  { name: "Liver Function Test (LFT)", category: "Liver", turnaround_hours: 8, suggested_price: 499, suggested_mrp: 749, home_collection: true },
  { name: "SGOT (AST)", category: "Liver", turnaround_hours: 8, suggested_price: 149, suggested_mrp: 249, home_collection: true },
  { name: "SGPT (ALT)", category: "Liver", turnaround_hours: 8, suggested_price: 149, suggested_mrp: 249, home_collection: true },
  { name: "Bilirubin Total & Direct", category: "Liver", turnaround_hours: 8, suggested_price: 149, suggested_mrp: 249, home_collection: true },
  { name: "Alkaline Phosphatase (ALP)", category: "Liver", turnaround_hours: 8, suggested_price: 149, suggested_mrp: 249, home_collection: true },
  { name: "GGT (Gamma Glutamyl Transferase)", category: "Liver", turnaround_hours: 12, suggested_price: 249, suggested_mrp: 399, home_collection: true },
  { name: "Hepatitis B Surface Antigen (HBsAg)", category: "Liver", turnaround_hours: 12, suggested_price: 299, suggested_mrp: 499, home_collection: true },
  { name: "Hepatitis C Antibody (Anti-HCV)", category: "Liver", turnaround_hours: 12, suggested_price: 349, suggested_mrp: 549, home_collection: true },

  // Kidney
  { name: "Kidney Function Test (KFT)", category: "Kidney", turnaround_hours: 8, suggested_price: 499, suggested_mrp: 749, home_collection: true },
  { name: "Blood Urea", category: "Kidney", turnaround_hours: 8, suggested_price: 99, suggested_mrp: 149, home_collection: true },
  { name: "Serum Creatinine", category: "Kidney", turnaround_hours: 8, suggested_price: 99, suggested_mrp: 149, home_collection: true },
  { name: "Uric Acid", category: "Kidney", turnaround_hours: 8, suggested_price: 149, suggested_mrp: 249, home_collection: true },
  { name: "eGFR (Estimated Glomerular Filtration Rate)", category: "Kidney", turnaround_hours: 8, suggested_price: 199, suggested_mrp: 299, home_collection: true },
  { name: "Urine Routine & Microscopy", category: "Kidney", turnaround_hours: 6, suggested_price: 99, suggested_mrp: 149, home_collection: true },
  { name: "24-Hour Urine Protein", category: "Kidney", turnaround_hours: 24, suggested_price: 299, suggested_mrp: 449, home_collection: false },
  { name: "Microalbuminuria", category: "Kidney", turnaround_hours: 24, suggested_price: 499, suggested_mrp: 749, home_collection: true },

  // Vitamins & Minerals
  { name: "Vitamin D (25-OH)", category: "Vitamins", turnaround_hours: 24, suggested_price: 799, suggested_mrp: 1199, home_collection: true },
  { name: "Vitamin B12 (Cobalamin)", category: "Vitamins", turnaround_hours: 24, suggested_price: 649, suggested_mrp: 999, home_collection: true },
  { name: "Vitamin D + B12 Combo", category: "Vitamins", turnaround_hours: 24, suggested_price: 1249, suggested_mrp: 1799, home_collection: true },
  { name: "Serum Iron", category: "Vitamins", turnaround_hours: 12, suggested_price: 199, suggested_mrp: 299, home_collection: true },
  { name: "TIBC (Total Iron Binding Capacity)", category: "Vitamins", turnaround_hours: 12, suggested_price: 299, suggested_mrp: 449, home_collection: true },
  { name: "Serum Ferritin", category: "Vitamins", turnaround_hours: 24, suggested_price: 449, suggested_mrp: 699, home_collection: true },
  { name: "Iron Studies (Iron + TIBC + Ferritin)", category: "Vitamins", turnaround_hours: 24, suggested_price: 799, suggested_mrp: 1199, home_collection: true },
  { name: "Serum Calcium", category: "Vitamins", turnaround_hours: 12, suggested_price: 149, suggested_mrp: 249, home_collection: true },
  { name: "Serum Magnesium", category: "Vitamins", turnaround_hours: 12, suggested_price: 249, suggested_mrp: 399, home_collection: true },
  { name: "Serum Phosphorus", category: "Vitamins", turnaround_hours: 12, suggested_price: 149, suggested_mrp: 249, home_collection: true },

  // Infectious Disease
  { name: "Typhoid (Widal Test)", category: "Infectious Disease", turnaround_hours: 12, suggested_price: 149, suggested_mrp: 249, home_collection: true },
  { name: "Dengue NS1 Antigen", category: "Infectious Disease", turnaround_hours: 8, suggested_price: 699, suggested_mrp: 999, home_collection: true },
  { name: "Dengue IgG + IgM Antibodies", category: "Infectious Disease", turnaround_hours: 8, suggested_price: 799, suggested_mrp: 1199, home_collection: true },
  { name: "Malaria Antigen (PF/PV)", category: "Infectious Disease", turnaround_hours: 6, suggested_price: 349, suggested_mrp: 549, home_collection: true },
  { name: "COVID-19 RT-PCR", category: "Infectious Disease", turnaround_hours: 24, suggested_price: 499, suggested_mrp: 799, home_collection: true },
  { name: "HIV 1 & 2 Antibody", category: "Infectious Disease", turnaround_hours: 12, suggested_price: 399, suggested_mrp: 599, home_collection: true },
  { name: "VDRL (Syphilis)", category: "Infectious Disease", turnaround_hours: 12, suggested_price: 149, suggested_mrp: 249, home_collection: true },
  { name: "CRP (C-Reactive Protein)", category: "Infectious Disease", turnaround_hours: 8, suggested_price: 249, suggested_mrp: 399, home_collection: true },
  { name: "Blood Culture & Sensitivity", category: "Infectious Disease", turnaround_hours: 72, suggested_price: 999, suggested_mrp: 1499, home_collection: false },

  // Hormones
  { name: "Testosterone Total", category: "Hormones", turnaround_hours: 24, suggested_price: 699, suggested_mrp: 999, home_collection: true },
  { name: "Prolactin", category: "Hormones", turnaround_hours: 24, suggested_price: 449, suggested_mrp: 699, home_collection: true },
  { name: "FSH (Follicle Stimulating Hormone)", category: "Hormones", turnaround_hours: 24, suggested_price: 449, suggested_mrp: 699, home_collection: true },
  { name: "LH (Luteinizing Hormone)", category: "Hormones", turnaround_hours: 24, suggested_price: 449, suggested_mrp: 699, home_collection: true },
  { name: "Estradiol (E2)", category: "Hormones", turnaround_hours: 24, suggested_price: 549, suggested_mrp: 799, home_collection: true },
  { name: "Cortisol (Morning)", category: "Hormones", turnaround_hours: 24, suggested_price: 649, suggested_mrp: 999, home_collection: true },
  { name: "AMH (Anti-Mullerian Hormone)", category: "Hormones", turnaround_hours: 48, suggested_price: 1499, suggested_mrp: 1999, home_collection: true },
  { name: "DHEA-S", category: "Hormones", turnaround_hours: 24, suggested_price: 699, suggested_mrp: 999, home_collection: true },

  // Urology
  { name: "Urine Culture & Sensitivity", category: "Urology", turnaround_hours: 48, suggested_price: 499, suggested_mrp: 749, home_collection: true },
  { name: "PSA (Prostate Specific Antigen)", category: "Urology", turnaround_hours: 24, suggested_price: 699, suggested_mrp: 999, home_collection: true },
  { name: "Urine Microalbumin/Creatinine Ratio", category: "Urology", turnaround_hours: 24, suggested_price: 499, suggested_mrp: 749, home_collection: true },

  // Packages
  { name: "Full Body Checkup - Basic", category: "Packages", turnaround_hours: 24, suggested_price: 999, suggested_mrp: 1999, home_collection: true },
  { name: "Full Body Checkup - Advanced", category: "Packages", turnaround_hours: 48, suggested_price: 1999, suggested_mrp: 3999, home_collection: true },
  { name: "Aarogya Package (Women's Health)", category: "Packages", turnaround_hours: 48, suggested_price: 1499, suggested_mrp: 2999, home_collection: true },
  { name: "Heart Health Package", category: "Packages", turnaround_hours: 24, suggested_price: 1299, suggested_mrp: 2499, home_collection: true },
  { name: "Diabetic Monitoring Panel", category: "Packages", turnaround_hours: 24, suggested_price: 799, suggested_mrp: 1499, home_collection: true },
  { name: "Senior Citizen Health Check", category: "Packages", turnaround_hours: 48, suggested_price: 1799, suggested_mrp: 3499, home_collection: true },
  { name: "Pre-Employment Health Screening", category: "Packages", turnaround_hours: 48, suggested_price: 1199, suggested_mrp: 2299, home_collection: false },
];

export const MASTER_CATEGORIES = [
  "Hematology", "Thyroid", "Diabetes", "Cardiology",
  "Liver", "Kidney", "Vitamins", "Infectious Disease",
  "Hormones", "Urology", "Packages", "General"
];
