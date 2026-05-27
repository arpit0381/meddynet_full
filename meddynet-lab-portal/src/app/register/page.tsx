"use client";

import { 
  isValidEmail, 
  validateFullName, 
  validatePhone, 
  validateEmail,
  isEmailRegistered,
  isPhoneRegistered 
} from '@/utils/validation';
import { Loader2, Lock } from "lucide-react";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  FileText, 
  User, 
  ArrowRight, 
  Check, 
  Microscope,
  Award,
  ShieldCheck,
  ChevronLeft,
  Mail,
  Phone,
  Briefcase,
  UploadCloud
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

const steps = [
  { id: 1, title: "Lab Identity", icon: Building2 },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Accreditation", icon: Award },
  { id: 4, title: "Contact Person", icon: User },
];

export default function LabRegistrationPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    labName: "",
    email: "",
    phone: "",
    registrationNumber: "",
    labCategory: "Pathology Lab",
    address: "",
    state: "",
    city: "",
    pincode: "",
    branches: "1",
    pathologistName: "",
    pathologistRegNo: "",
    contactName: "",
    contactPhone: "",
    contactRole: "",
    password: "", // User can now set their own password
  });

  const [isCertified, setIsCertified] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailRegistered, setEmailRegistered] = useState<boolean | null>(null);
  const [phoneRegistered, setPhoneRegistered] = useState<boolean | null>(null);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validateStep = (stepId: number) => {
    switch (stepId) {
       case 1:
        return formData.labName.trim() !== "" && 
               isValidEmail(formData.email) && 
               emailRegistered === false &&
               formData.phone.length === 10 && 
               phoneRegistered === false &&
               formData.registrationNumber.trim() !== "";
      case 2:
        return formData.address.trim() !== "" && 
               formData.state.trim() !== "" && 
               formData.city.trim() !== "" && 
               formData.pincode.length === 6;
      case 3:
        return formData.pathologistName.trim() !== "" && 
               formData.pathologistRegNo.trim() !== "" && 
               isCertified;
      case 4:
        return formData.contactName.trim() !== "" && 
               formData.contactPhone.length === 10 && 
               formData.contactRole.trim() !== "" &&
               formData.password.length >= 6 && // Added password length validation
               isTermsAccepted;
      default:
        return false;
    }
  };

  const isStepValid = () => validateStep(currentStep);

  const canAccessStep = (stepId: number) => {
    if (stepId <= currentStep) return true;
    for (let i = 1; i < stepId; i++) {
      if (!validateStep(i)) return false;
    }
    return true;
  };

  const handleStepClick = (stepId: number) => {
    if (canAccessStep(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const nextStep = () => {
    if (isStepValid()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const updateForm = (field: string, value: string) => {
    let sanitizedValue = value;
    
    if (['labName', 'pathologistName', 'contactName'].includes(field)) {
      sanitizedValue = validateFullName(value);
    } else if (['phone', 'contactPhone'].includes(field)) {
      sanitizedValue = validatePhone(value);
      checkPhoneRegistration(sanitizedValue);
    } else if (field === 'email') {
      sanitizedValue = validateEmail(value);
      checkEmailRegistration(sanitizedValue);
    } else if (field === 'pincode') {
      sanitizedValue = value.replace(/\D/g, '').substring(0, 6);
    }

    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  const checkEmailRegistration = (email: string) => {
    setEmailRegistered(null);
    if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
    
    if (isValidEmail(email)) {
      setIsVerifyingEmail(true);
      verificationTimeoutRef.current = setTimeout(async () => {
        const isRegistered = await isEmailRegistered(email);
        setIsVerifyingEmail(false);
        setEmailRegistered(isRegistered);
      }, 700);
    }
  };

  const checkPhoneRegistration = (phone: string) => {
    setPhoneRegistered(null);
    if (phone.length === 10) {
      setTimeout(async () => {
        const isRegistered = await isPhoneRegistered(phone);
        setPhoneRegistered(isRegistered);
      }, 700);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB");
        return;
      }
      setCertificateFile(file);
      setUploadProgress(20);
      
      try {
          const formDataFileUpload = new FormData();
          formDataFileUpload.append('file', file);
          
          setUploadProgress(40);
          const response = await api.post("/auth/upload-doc", formDataFileUpload, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          setUploadProgress(100);
          setCertificateUrl(response.data.url); 
      } catch (err: unknown) {
          const axiosErr = err as { response?: { data?: { detail?: string } } };
          console.error("Upload failed:", err);
          alert("Failed to upload document. Please check your internet.");
          setCertificateFile(null);
          setUploadProgress(0);
      }
    }
  };

  const handleSubmit = async () => {
    if (!isStepValid()) return;
    setIsSubmitting(true);
    
    try {
      const payload = {
        admin_name: formData.contactName,
        admin_email: formData.email,
        admin_password: formData.password, // Correctly sending the chosen password
        admin_phone: formData.contactPhone,
        lab_name: formData.labName,
        lab_city: formData.city,
        lab_address: formData.address,
        lab_phone: formData.phone,
        registration_number: formData.registrationNumber,
        lab_category: formData.labCategory,
        state: formData.state,
        pincode: formData.pincode,
        branches: formData.branches,
        pathologist_name: formData.pathologistName,
        pathologist_reg_no: formData.pathologistRegNo,
        nabl_certificate_url: certificateUrl,
        is_certified: isCertified
      };

      const response = await api.post("/auth/register-lab", payload);
      
      if (response.data.access_token) {
        setAuth(response.data.user, response.data.access_token);
        localStorage.setItem("lab_token", response.data.access_token);
        router.push("/subscription");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      console.error("Registration failed:", err);
      // Clean error detail for SQL truncation message from backend if it ever flows down
      const errorMsg = axiosErr.response?.data?.detail || "Registration failed. Please try again.";
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh sm:min-h-screen bg-surface flex flex-col items-center justify-center p-0 sm:p-4 font-sans">
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.png" onChange={handleFileUpload} />
      
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between p-6 sm:p-0 sm:mb-12 sm:px-4 bg-surface">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
           <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">M</div>
           <span className="text-xl font-black text-dark-light tracking-tight">Meddy<span className="text-primary">Net</span></span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">
           <span className="hidden sm:inline">Already Registered?</span>
           <Link href="/login" className="text-primary hover:underline">Sign In</Link>
        </div>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-5xl shadow-2xl shadow-black/5 sm:border border-border-dark/20 overflow-hidden flex flex-col lg:flex-row flex-1 sm:flex-initial min-h-0 sm:min-h-[650px] m-4 sm:m-0 animate-in fade-in zoom-in-95 duration-1000">
        {/* Progress Sidebar */}
        <div className="lg:w-80 bg-dark p-6 sm:p-8 lg:p-10 text-white relative flex flex-col shrink-0">
          <div className="absolute inset-0 bg-linear-to-b from-primary/20 to-transparent opacity-50" />
          <div className="relative z-10 flex-1 flex flex-col">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-6 lg:mb-8 hidden sm:block">Lab Onboarding</h2>
            <div className="flex lg:flex-col gap-6 lg:gap-8 overflow-x-auto no-scrollbar pb-2 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0">
              {steps.map((step) => {
                const isAccessible = canAccessStep(step.id);
                return (
                  <div 
                    key={step.id} 
                    className={`flex items-center gap-3 lg:gap-4 group shrink-0 transition-all ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`} 
                    onClick={() => handleStepClick(step.id)}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 ${
                      currentStep === step.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 
                      currentStep > step.id ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/40'
                    }`}>
                      {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${
                        currentStep >= step.id ? 'text-primary' : 'text-white/30'
                      }`}>Step 0{step.id}</p>
                      <p className={`text-sm font-black tracking-tight ${
                        currentStep >= step.id ? 'text-white' : 'text-white/40'
                      }`}>{step.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-8 hidden lg:block">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                 <ShieldCheck className="w-8 h-8 text-primary mb-3" />
                 <p className="text-xs font-bold text-white leading-relaxed">Your data is encrypted and secure with MeddyNet HIPAA compliant servers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 p-6 sm:p-10 lg:p-14 relative flex flex-col bg-white overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {currentStep === 1 && (
                <div className="space-y-6 text-left flex-1">
                  <div className="mb-8">
                    <h3 className="text-3xl font-black text-dark-light tracking-tight mb-2">Lab Identity</h3>
                    <p className="text-text-muted font-bold text-sm">Enter the official business name and contact details.</p>
                  </div>
                  <div className="space-y-5">
                    <div className="group">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Lab Name *</label>
                      <input type="text" value={formData.labName} onChange={e => updateForm('labName', e.target.value)} placeholder="e.g. City Diagnostics Lab" className={`w-full bg-surface border-2 rounded-3xl px-5 py-4 text-sm font-bold outline-none transition-all shadow-sm ${formData.labName && formData.labName.length < 3 ? 'border-red-500/50 focus:border-red-500' : 'border-border-dark focus:border-primary focus:bg-white'}`} />
                      {formData.labName && formData.labName.length < 3 && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-2 px-2">Name too short</p>}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="group">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Lab Email *</label>
                        <div className="relative">
                           <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${formData.email && (!isValidEmail(formData.email) || emailRegistered === true) ? 'text-red-500' : 'text-text-muted group-focus-within:text-primary'}`} />
                           <input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} placeholder="contact@labname.com" className={`w-full bg-surface border-2 rounded-3xl pl-11 pr-12 py-4 text-sm font-bold outline-none transition-all shadow-sm ${formData.email && (!isValidEmail(formData.email) || emailRegistered === true) ? 'border-red-500/50 focus:border-red-500' : 'border-border-dark focus:border-primary focus:bg-white'}`} />
                           {isVerifyingEmail && (
                             <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                           )}
                        </div>
                        {formData.email && !isValidEmail(formData.email) && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-2 px-2">Invalid email format</p>}
                         {formData.email && isValidEmail(formData.email) && emailRegistered === true && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-2 px-2">Associated with an active Lab account</p>}
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Lab Phone Number *</label>
                        <div className="relative">
                           <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${formData.phone && (formData.phone.length < 10 || phoneRegistered === true) ? 'text-red-500' : 'text-text-muted group-focus-within:text-primary'}`} />
                           <input type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="10-digit number" className={`w-full bg-surface border-2 rounded-3xl pl-11 pr-4 py-4 text-sm font-bold outline-none transition-all shadow-sm ${formData.phone && (formData.phone.length < 10 || phoneRegistered === true) ? 'border-red-500/50 focus:border-red-500' : 'border-border-dark focus:border-primary focus:bg-white'}`} />
                        </div>
                        {formData.phone && formData.phone.length > 0 && formData.phone.length < 10 && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-2 px-2">Must be 10 digits</p>}
                        {formData.phone && phoneRegistered === true && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-2 px-2">Associated with an active Lab account</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="group">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Registration No. (GSTIN/PAN)</label>
                        <input type="text" value={formData.registrationNumber} onChange={e => updateForm('registrationNumber', e.target.value)} placeholder="Registration ID" className="w-full bg-surface border-2 border-border-dark rounded-3xl px-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary transition-all shadow-sm" />
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Lab Category</label>
                        <select value={formData.labCategory} onChange={e => updateForm('labCategory', e.target.value)} className="w-full bg-surface border-2 border-border-dark rounded-3xl px-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary transition-all shadow-sm appearance-none cursor-pointer">
                          <option>Pathology Lab</option>
                          <option>Radiology Center</option>
                          <option>Diagnostic Center (Both)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 text-left flex-1">
                  <div className="mb-8">
                    <h3 className="text-3xl font-black text-dark-light tracking-tight mb-2">Location Setup</h3>
                    <p className="text-text-muted font-bold text-sm">Patient discovery is based on your precise location.</p>
                  </div>
                  <div className="space-y-5">
                    <div className="group">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Full Address</label>
                      <textarea value={formData.address} onChange={e => updateForm('address', e.target.value)} placeholder="Enter street, building, area" className="w-full bg-surface border-2 border-border-dark rounded-3xl px-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary transition-all shadow-sm h-28 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                      <div className="group">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">State</label>
                        <input type="text" value={formData.state} onChange={e => updateForm('state', e.target.value)} placeholder="Maharashtra" className="w-full bg-surface border-2 border-border-dark rounded-3xl px-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary transition-all shadow-sm" />
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">City</label>
                        <input type="text" value={formData.city} onChange={e => updateForm('city', e.target.value)} placeholder="Mumbai" className="w-full bg-surface border-2 border-border-dark rounded-3xl px-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary transition-all shadow-sm" />
                      </div>
                      <div className="group col-span-2 sm:col-span-1">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Pincode</label>
                        <input type="text" value={formData.pincode} onChange={e => updateForm('pincode', e.target.value)} placeholder="400001" className={`w-full bg-surface border-2 rounded-3xl px-5 py-4 text-sm font-bold outline-none transition-all shadow-sm ${formData.pincode && formData.pincode.length < 6 ? 'border-red-500/50 focus:border-red-500' : 'border-border-dark focus:border-primary focus:bg-white'}`} />
                        {formData.pincode && formData.pincode.length > 0 && formData.pincode.length < 6 && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-2 px-2">Must be 6 digits</p>}
                      </div>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Number of Branches</label>
                      <select value={formData.branches} onChange={e => updateForm('branches', e.target.value)} className="w-full sm:w-1/2 bg-surface border-2 border-border-dark rounded-3xl px-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary transition-all shadow-sm appearance-none cursor-pointer">
                        <option value="1">1 (Single Center)</option>
                        <option value="2-5">2 to 5 Branches</option>
                        <option value="6-10">6 to 10 Branches</option>
                        <option value="10+">More than 10</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 text-left flex-1">
                  <div className="mb-8">
                    <h3 className="text-3xl font-black text-dark-light tracking-tight mb-2">Accreditation</h3>
                    <p className="text-text-muted font-bold text-sm">Help patients trust you by providing lab credentials.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="group">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Chief Pathologist Name</label>
                        <input type="text" value={formData.pathologistName} onChange={e => updateForm('pathologistName', e.target.value)} placeholder="Dr. Firstname Lastname" className="w-full bg-surface border-2 border-border-dark rounded-3xl px-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary transition-all shadow-sm" />
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Registration Number (MCI)</label>
                        <input type="text" value={formData.pathologistRegNo} onChange={e => updateForm('pathologistRegNo', e.target.value)} placeholder="e.g. 123456" className="w-full bg-surface border-2 border-border-dark rounded-3xl px-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary transition-all shadow-sm" />
                      </div>
                    </div>

                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-8 border-2 border-dashed rounded-3xl transition-all text-center group cursor-pointer mt-4 ${
                            certificateFile ? 'border-primary bg-primary/5' : 'border-border-dark bg-surface hover:bg-primary/5 hover:border-primary/50'
                        }`}
                    >
                       {certificateFile ? (
                           <div className="flex flex-col items-center">
                               <Check className="w-12 h-12 text-primary mb-3" />
                               <p className="text-sm font-black text-dark-light">{certificateFile.name}</p>
                               <div className="w-full max-w-xs h-1.5 bg-border-dark rounded-full mt-4 overflow-hidden">
                                   <div className="h-full bg-primary transition-all duration-500" style={{ width: `${uploadProgress}%` }}></div>
                               </div>
                           </div>
                       ) : (
                           <>
                               <UploadCloud className="w-12 h-12 text-text-muted mx-auto mb-4 group-hover:scale-110 group-hover:text-primary transition-all" />
                               <p className="text-sm font-black text-dark-light mb-1">Upload NABL Certificate (Optional)</p>
                               <p className="text-[10px] font-bold text-text-muted">PDF, JPG, or PNG (Max 5MB)</p>
                           </>
                       )}
                    </div>
                    
                    <div className="flex items-center gap-3 bg-surface p-4 rounded-3xl border border-border-dark">
                       <input 
                         type="checkbox" 
                         id="certify" 
                         checked={isCertified}
                         onChange={(e) => setIsCertified(e.target.checked)}
                         className="w-5 h-5 rounded-lg text-primary focus:ring-primary cursor-pointer accent-primary" 
                       />
                       <label htmlFor="certify" className="text-xs font-bold text-dark-light leading-relaxed cursor-pointer">I certify that my lab follows the Indian Medical Council standards and all local healthcare regulations.</label>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 text-left flex-1">
                  <div className="mb-8">
                    <h3 className="text-3xl font-black text-dark-light tracking-tight mb-2">Contact Person</h3>
                    <p className="text-text-muted font-bold text-sm">Who should we contact for onboarding setup?</p>
                  </div>
                  <div className="space-y-5">
                    <div className="group">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Full Name</label>
                      <input type="text" value={formData.contactName} onChange={e => updateForm('contactName', e.target.value)} placeholder="Contact Person's Name" className="w-full bg-surface border-2 border-border-dark rounded-3xl px-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary transition-all shadow-sm" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="group">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Direct Phone / Mobile</label>
                        <div className="relative">
                           <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${formData.contactPhone && (formData.contactPhone.length < 10 || phoneRegistered === true) ? 'text-red-500' : 'text-text-muted group-focus-within:text-primary'}`} />
                           <input type="tel" value={formData.contactPhone} onChange={e => updateForm('contactPhone', e.target.value)} placeholder="10-digit mobile" className={`w-full bg-surface border-2 rounded-3xl pl-11 pr-4 py-4 text-sm font-bold outline-none transition-all shadow-sm ${formData.contactPhone && (formData.contactPhone.length < 10 || phoneRegistered === true) ? 'border-red-500/50 focus:border-red-500' : 'border-border-dark focus:border-primary focus:bg-white'}`} />
                        </div>
                        {formData.contactPhone && phoneRegistered === true && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-2 px-2">Phone already in use</p>}
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Role / Designation</label>
                        <div className="relative">
                           <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary" />
                           <input type="text" value={formData.contactRole} onChange={e => updateForm('contactRole', e.target.value)} placeholder="e.g. Lab Manager" className="w-full bg-surface border-2 border-border-dark rounded-3xl pl-11 pr-4 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary transition-all shadow-sm" />
                        </div>
                      </div>
                    </div>

                    <div className="group mt-4">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Create Password *</label>
                      <div className="relative">
                         <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${formData.password && formData.password.length < 6 ? 'text-red-500' : 'text-text-muted group-focus-within:text-primary'}`} />
                         <input type="password" value={formData.password} onChange={e => setFormData(p => ({...p, password: e.target.value}))} placeholder="Min 6 characters" className={`w-full bg-surface border-2 rounded-3xl pl-11 pr-4 py-4 text-sm font-bold outline-none transition-all shadow-sm ${formData.password && formData.password.length < 6 ? 'border-red-500/50 focus:border-red-500' : 'border-border-dark focus:border-primary focus:bg-white'}`} />
                      </div>
                      {formData.password && formData.password.length < 6 && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-2 px-2">Too short (Min 6 chars)</p>}
                    </div>

                    <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-3xl border border-primary/20 mt-4">
                       <input 
                         type="checkbox" 
                         id="terms" 
                         checked={isTermsAccepted}
                         onChange={(e) => setIsTermsAccepted(e.target.checked)}
                         className="w-5 h-5 rounded-lg text-primary focus:ring-primary cursor-pointer accent-primary" 
                       />
                       <label htmlFor="terms" className="text-xs font-bold text-dark-light leading-relaxed cursor-pointer">I agree to MeddyNet&apos;s <span className="text-primary font-black uppercase tracking-widest text-[10px]">Terms & Conditions</span> and Privacy Policy for laboratory partners.</label>
                    </div>

                    <div className="bg-primary/5 rounded-4xl p-6 border border-primary/20 flex items-center gap-5 mt-6">
                       <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shrink-0">
                          <FileText className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="font-black text-dark-light tracking-tight mb-1 text-sm">Onboarding Summary</h4>
                          <p className="text-xs font-bold text-text-muted">By submitting, your application will be reviewed within 24 hours.</p>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 pt-6 border-t border-border-dark flex items-center justify-between">
                <button 
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 py-4 rounded-full text-sm font-black transition-all ${
                    currentStep === 1 ? 'opacity-0 cursor-default' : 'text-text-muted hover:bg-surface hover:text-dark-light cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                {currentStep === steps.length ? (
                   <button 
                    onClick={handleSubmit}
                    disabled={!isStepValid() || isSubmitting}
                    className={`flex items-center gap-2 px-10 py-4 rounded-full text-sm font-black shadow-xl transition-all ${
                      isStepValid() && !isSubmitting
                        ? 'bg-primary text-white shadow-primary/30 hover:-translate-y-1 hover:bg-primary-dark cursor-pointer' 
                        : 'bg-border-dark text-text-muted cursor-not-allowed opacity-70'
                    }`}
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"} <Check className="w-5 h-5 ml-1" />
                  </button>
                ) : (
                  <button 
                    onClick={nextStep}
                    className={`flex items-center gap-2 px-10 py-4 rounded-full text-sm font-black shadow-xl transition-all ${
                      isStepValid()
                        ? 'bg-dark text-white shadow-dark/20 hover:-translate-y-1 hover:bg-dark-light cursor-pointer'
                        : 'bg-border-dark text-text-muted cursor-not-allowed opacity-70'
                    }`}
                  >
                    Next Step <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
