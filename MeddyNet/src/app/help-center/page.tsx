"use client";

import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Search,
  ChevronRight,
  HelpCircle,
  Book,
  User,
  CreditCard,
  FileText,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  ArrowRight,
  Plus,
  Minus,
  X,
  Clock,
  Eye,
  ChevronDown,
  Bookmark,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { useState, useCallback, ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ───── Article data per category ───── */
interface Article {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  views: string;
  tag: string;
  tagColor: string;
}

interface CategoryArticles {
  [key: string]: Article[];
}

const articlesByCategoryEn: CategoryArticles = {
  "Getting Started": [
    { id: "gs-1", title: "How MeddyNet Works – A Complete Walkthrough", excerpt: "Learn step-by-step how to search for tests, compare labs, book appointments, and receive your digital reports – all from one platform.", readTime: "5 min", views: "12.5K", tag: "Guide", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "gs-2", title: "Creating Your MeddyNet Account", excerpt: "Sign up in under 60 seconds using your phone number or email. We'll walk you through verification and setting up your health profile.", readTime: "3 min", views: "9.8K", tag: "Basics", tagColor: "bg-blue-50 text-blue-600" },
    { id: "gs-3", title: "Finding the Right Lab Near You", excerpt: "Use our smart filters to discover NABL-certified labs sorted by distance, price, rating, and available tests in your area.", readTime: "4 min", views: "8.2K", tag: "Guide", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "gs-4", title: "Understanding Lab Ratings & Reviews", excerpt: "How we calculate lab ratings, what verified reviews mean, and how to use them to make the best decision for your health.", readTime: "3 min", views: "5.4K", tag: "Tips", tagColor: "bg-amber-50 text-amber-600" },
    { id: "gs-5", title: "Your First Test Booking – What to Expect", excerpt: "A beginner-friendly guide covering everything from selecting a test to receiving your results in your Health Vault.", readTime: "6 min", views: "7.1K", tag: "Guide", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "gs-6", title: "MeddyNet Mobile App Quick Start", excerpt: "Download, install, and start using the MeddyNet mobile app. Available on both Android and iOS platforms.", readTime: "2 min", views: "4.3K", tag: "Basics", tagColor: "bg-blue-50 text-blue-600" },
  ],
  "Account & Profile": [
    { id: "ap-1", title: "How to Reset Your Password", excerpt: "Forgot your password? Follow these simple steps to reset it via email or SMS OTP and regain access to your account securely.", readTime: "2 min", views: "15.3K", tag: "Security", tagColor: "bg-red-50 text-red-600" },
    { id: "ap-2", title: "Managing Your Digital Health Records", excerpt: "Your Health Vault stores all lab reports securely. Learn how to upload, organize, share, and download your medical records.", readTime: "5 min", views: "11.2K", tag: "Health Vault", tagColor: "bg-purple-50 text-purple-600" },
    { id: "ap-3", title: "Updating Your Profile Information", excerpt: "Change your name, phone number, email, address, or emergency contact details from your account settings page.", readTime: "2 min", views: "6.7K", tag: "Account", tagColor: "bg-blue-50 text-blue-600" },
    { id: "ap-4", title: "Setting Up Family Profiles", excerpt: "Add family members to your account to book tests and manage health records for your parents, spouse, or children.", readTime: "4 min", views: "5.1K", tag: "Guide", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "ap-5", title: "Privacy & Data Settings", excerpt: "Control who can see your health data, manage sharing preferences, and understand how MeddyNet protects your information.", readTime: "3 min", views: "4.8K", tag: "Security", tagColor: "bg-red-50 text-red-600" },
    { id: "ap-6", title: "Deleting Your Account", excerpt: "If you wish to delete your MeddyNet account, here's how to do it and what happens to your stored health records.", readTime: "2 min", views: "3.2K", tag: "Account", tagColor: "bg-blue-50 text-blue-600" },
  ],
  "Booking & Tests": [
    { id: "bt-1", title: "How to Book a Home Sample Collection", excerpt: "Step-by-step guide to booking a certified phlebotomist who will visit your home at your chosen time slot for sample collection.", readTime: "4 min", views: "18.6K", tag: "Popular", tagColor: "bg-orange-50 text-orange-600" },
    { id: "bt-2", title: "Pre-Test Instructions & Preparations", excerpt: "Fasting requirements, medication guidelines, and everything you need to know before your blood test or diagnostic procedure.", readTime: "5 min", views: "14.1K", tag: "Important", tagColor: "bg-red-50 text-red-600" },
    { id: "bt-3", title: "Rescheduling or Cancelling a Booking", excerpt: "Need to change your appointment? Here's how to reschedule or cancel your booking and understand the refund timeline.", readTime: "3 min", views: "9.5K", tag: "Guide", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "bt-4", title: "Understanding Your Test Reports", excerpt: "A guide to reading your lab results, understanding normal ranges, and when you should consult a doctor about your findings.", readTime: "7 min", views: "12.8K", tag: "Health", tagColor: "bg-teal-50 text-teal-600" },
    { id: "bt-5", title: "Booking Tests for Family Members", excerpt: "Learn how to book diagnostic tests for your family members and manage their appointments from your single account.", readTime: "3 min", views: "6.3K", tag: "Guide", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "bt-6", title: "Health Packages & Bundles Explained", excerpt: "Save money with our curated health packages. Understand what each package includes and choose the right one for you.", readTime: "4 min", views: "7.9K", tag: "Savings", tagColor: "bg-amber-50 text-amber-600" },
  ],
  "Payments & Refunds": [
    { id: "pr-1", title: "Accepted Payment Methods", excerpt: "We accept UPI, credit/debit cards, net banking, wallets, and EMI options. Here's a complete list with step-by-step payment guides.", readTime: "3 min", views: "10.4K", tag: "Payments", tagColor: "bg-orange-50 text-orange-600" },
    { id: "pr-2", title: "Tracking Your Refund Status", excerpt: "Initiated a refund? Track its progress in real-time from your dashboard. Typical processing times for each payment method explained.", readTime: "3 min", views: "13.7K", tag: "Refunds", tagColor: "bg-blue-50 text-blue-600" },
    { id: "pr-3", title: "Downloading Invoices & Payment Receipts", excerpt: "Access and download GST-compliant invoices for all your bookings from the billing section of your account.", readTime: "2 min", views: "5.9K", tag: "Billing", tagColor: "bg-slate-100 text-slate-600" },
    { id: "pr-4", title: "Understanding Our Pricing Policy", excerpt: "How test prices are determined, what's included in the fee, and why MeddyNet prices may differ from direct lab pricing.", readTime: "4 min", views: "8.1K", tag: "Pricing", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "pr-5", title: "Applying Discount Codes & Offers", excerpt: "Learn how to apply promo codes, referral discounts, and seasonal offers to get the best deal on your diagnostic tests.", readTime: "2 min", views: "11.3K", tag: "Savings", tagColor: "bg-amber-50 text-amber-600" },
    { id: "pr-6", title: "Payment Failed? Here's What to Do", excerpt: "If your payment didn't go through, don't worry. Follow these troubleshooting steps to resolve the issue and complete your booking.", readTime: "3 min", views: "7.6K", tag: "Troubleshoot", tagColor: "bg-red-50 text-red-600" },
  ],
  "Lab Partners": [
    { id: "lp-1", title: "Getting Started with the Partner Dashboard", excerpt: "A comprehensive guide for lab partners to navigate the MeddyNet dashboard, manage bookings, and view analytics.", readTime: "6 min", views: "4.2K", tag: "Partners", tagColor: "bg-rose-50 text-rose-600" },
    { id: "lp-2", title: "How to Join MeddyNet as a Lab Partner", excerpt: "Registration process, required documents, verification timeline, and everything you need to list your lab on our platform.", readTime: "5 min", views: "6.8K", tag: "Onboarding", tagColor: "bg-blue-50 text-blue-600" },
    { id: "lp-3", title: "Lab Verification & Quality Standards", excerpt: "Our verification process ensures only quality labs are listed. Understand NABL, ISO, and other certification requirements.", readTime: "4 min", views: "3.9K", tag: "Quality", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "lp-4", title: "Managing Test Listings & Pricing", excerpt: "How to add, update, or remove tests from your lab listing and set competitive pricing that attracts patients.", readTime: "4 min", views: "3.4K", tag: "Management", tagColor: "bg-purple-50 text-purple-600" },
    { id: "lp-5", title: "Handling Home Collection Requests", excerpt: "Best practices for managing home sample collection requests, phlebotomist assignments, and report uploads.", readTime: "5 min", views: "2.8K", tag: "Operations", tagColor: "bg-orange-50 text-orange-600" },
    { id: "lp-6", title: "Partner Revenue & Payouts", excerpt: "Understanding the commission structure, payout schedules, and how to track your earnings on the partner dashboard.", readTime: "3 min", views: "5.1K", tag: "Finance", tagColor: "bg-amber-50 text-amber-600" },
  ],
  "Other Queries": [
    { id: "oq-1", title: "MeddyNet Privacy Policy Explained", excerpt: "A simplified breakdown of our privacy policy – what data we collect, how it's used, and your rights as a user.", readTime: "5 min", views: "7.3K", tag: "Legal", tagColor: "bg-slate-100 text-slate-600" },
    { id: "oq-2", title: "Terms of Service – Key Points", excerpt: "The most important clauses from our Terms of Service explained in plain, easy-to-understand language.", readTime: "4 min", views: "5.6K", tag: "Legal", tagColor: "bg-slate-100 text-slate-600" },
    { id: "oq-3", title: "About MeddyNet – Our Mission & Vision", excerpt: "Learn about the team behind MeddyNet, our mission to democratize healthcare, and where we're headed next.", readTime: "3 min", views: "4.2K", tag: "Company", tagColor: "bg-blue-50 text-blue-600" },
    { id: "oq-4", title: "Reporting a Bug or Issue", excerpt: "Found something broken? Here's how to report bugs, UI issues, or technical problems to our engineering team.", readTime: "2 min", views: "2.9K", tag: "Support", tagColor: "bg-red-50 text-red-600" },
    { id: "oq-5", title: "Feedback & Feature Requests", excerpt: "We love hearing from you! Submit your ideas for new features or improvements through our feedback portal.", readTime: "2 min", views: "3.1K", tag: "Feedback", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "oq-6", title: "Accessibility on MeddyNet", excerpt: "Our commitment to making the platform accessible to users with disabilities, including screen reader support and more.", readTime: "3 min", views: "1.8K", tag: "Accessibility", tagColor: "bg-purple-50 text-purple-600" },
  ],
};

/* ───── Hindi article data ───── */
const articlesByCategoryHi: CategoryArticles = {
  "Getting Started": [
    { id: "gs-1", title: "मेड्डीनेट कैसे काम करता है – पूरी जानकारी", excerpt: "जानें कि कैसे आप टेस्ट खोज सकते हैं, लैब्स की तुलना कर सकते हैं, अपॉइंटमेंट बुक कर सकते हैं और अपनी डिजिटल रिपोर्ट प्राप्त कर सकते हैं – सब कुछ एक ही प्लेटफॉर्म से।", readTime: "5 मिनट", views: "12.5K", tag: "गाइड", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "gs-2", title: "अपना मेड्डीनेट खाता बनाएँ", excerpt: "अपने फोन नंबर या ईमेल का उपयोग करके 60 सेकंड से भी कम समय में साइन अप करें। हम आपको वेरिफिकेशन और हेल्थ प्रोफ़ाइल सेटअप में मदद करेंगे।", readTime: "3 मिनट", views: "9.8K", tag: "बुनियादी", tagColor: "bg-blue-50 text-blue-600" },
    { id: "gs-3", title: "अपने पास सही लैब खोजें", excerpt: "हमारे स्मार्ट फ़िल्टर से NABL-प्रमाणित लैब्स को दूरी, कीमत, रेटिंग और उपलब्ध टेस्ट के अनुसार खोजें।", readTime: "4 मिनट", views: "8.2K", tag: "गाइड", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "gs-4", title: "लैब रेटिंग और रिव्यू को समझें", excerpt: "हम लैब रेटिंग की गणना कैसे करते हैं, सत्यापित रिव्यू का क्या मतलब है और अपने स्वास्थ्य के लिए सही निर्णय लेने में इनका उपयोग कैसे करें।", readTime: "3 मिनट", views: "5.4K", tag: "सुझाव", tagColor: "bg-amber-50 text-amber-600" },
    { id: "gs-5", title: "आपकी पहली टेस्ट बुकिंग – क्या उम्मीद करें", excerpt: "टेस्ट चुनने से लेकर अपने हेल्थ वॉल्ट में परिणाम प्राप्त करने तक, शुरुआत करने वालों के लिए एक आसान गाइड।", readTime: "6 मिनट", views: "7.1K", tag: "गाइड", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "gs-6", title: "मेड्डीनेट मोबाइल ऐप क्विक स्टार्ट", excerpt: "मेड्डीनेट मोबाइल ऐप डाउनलोड करें, इंस्टॉल करें और उपयोग शुरू करें। Android और iOS दोनों प्लेटफॉर्म पर उपलब्ध।", readTime: "2 मिनट", views: "4.3K", tag: "बुनियादी", tagColor: "bg-blue-50 text-blue-600" },
  ],
  "Account & Profile": [
    { id: "ap-1", title: "अपना पासवर्ड कैसे रीसेट करें", excerpt: "पासवर्ड भूल गए? ईमेल या SMS OTP के माध्यम से इसे रीसेट करने और अपने खाते को सुरक्षित रूप से पुनः प्राप्त करने के लिए इन सरल चरणों का पालन करें।", readTime: "2 मिनट", views: "15.3K", tag: "सुरक्षा", tagColor: "bg-red-50 text-red-600" },
    { id: "ap-2", title: "अपने डिजिटल स्वास्थ्य रिकॉर्ड प्रबंधित करें", excerpt: "आपका हेल्थ वॉल्ट सभी लैब रिपोर्ट सुरक्षित तरीके से संग्रहीत करता है। अपने मेडिकल रिकॉर्ड अपलोड, व्यवस्थित, साझा और डाउनलोड करना सीखें।", readTime: "5 मिनट", views: "11.2K", tag: "हेल्थ वॉल्ट", tagColor: "bg-purple-50 text-purple-600" },
    { id: "ap-3", title: "अपनी प्रोफ़ाइल जानकारी अपडेट करें", excerpt: "अपने अकाउंट सेटिंग्स पेज से अपना नाम, फोन नंबर, ईमेल, पता या आपातकालीन संपर्क विवरण बदलें।", readTime: "2 मिनट", views: "6.7K", tag: "खाता", tagColor: "bg-blue-50 text-blue-600" },
    { id: "ap-4", title: "परिवार प्रोफ़ाइल सेट करना", excerpt: "अपने माता-पिता, जीवनसाथी या बच्चों के लिए टेस्ट बुक करने और स्वास्थ्य रिकॉर्ड प्रबंधित करने के लिए परिवार के सदस्यों को जोड़ें।", readTime: "4 मिनट", views: "5.1K", tag: "गाइड", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "ap-5", title: "गोपनीयता और डेटा सेटिंग्स", excerpt: "नियंत्रित करें कि आपका स्वास्थ्य डेटा कौन देख सकता है, शेयरिंग प्राथमिकताएँ प्रबंधित करें और समझें कि मेड्डीनेट आपकी जानकारी की सुरक्षा कैसे करता है।", readTime: "3 मिनट", views: "4.8K", tag: "सुरक्षा", tagColor: "bg-red-50 text-red-600" },
    { id: "ap-6", title: "अपना खाता हटाना", excerpt: "यदि आप अपना मेड्डीनेट खाता हटाना चाहते हैं, तो यहाँ जानें कि यह कैसे करें और आपके संग्रहीत स्वास्थ्य रिकॉर्ड का क्या होगा।", readTime: "2 मिनट", views: "3.2K", tag: "खाता", tagColor: "bg-blue-50 text-blue-600" },
  ],
  "Booking & Tests": [
    { id: "bt-1", title: "होम सैंपल कलेक्शन कैसे बुक करें", excerpt: "अपने घर पर चुने हुए समय पर सैंपल कलेक्शन के लिए प्रमाणित फ्लेबोटोमिस्ट को बुक करने की चरण-दर-चरण गाइड।", readTime: "4 मिनट", views: "18.6K", tag: "लोकप्रिय", tagColor: "bg-orange-50 text-orange-600" },
    { id: "bt-2", title: "टेस्ट से पहले के निर्देश और तैयारी", excerpt: "उपवास की आवश्यकताएँ, दवा संबंधी दिशानिर्देश और ब्लड टेस्ट या डायग्नोस्टिक प्रक्रिया से पहले जानने योग्य सब कुछ।", readTime: "5 मिनट", views: "14.1K", tag: "महत्वपूर्ण", tagColor: "bg-red-50 text-red-600" },
    { id: "bt-3", title: "बुकिंग रीशेड्यूल या रद्द करना", excerpt: "अपनी अपॉइंटमेंट बदलनी है? यहाँ जानें कि अपनी बुकिंग कैसे रीशेड्यूल या रद्द करें और रिफंड की समयरेखा को समझें।", readTime: "3 मिनट", views: "9.5K", tag: "गाइड", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "bt-4", title: "अपनी टेस्ट रिपोर्ट को समझें", excerpt: "अपनी लैब रिपोर्ट पढ़ने, सामान्य सीमाओं को समझने और डॉक्टर से कब परामर्श करना चाहिए, इसके लिए एक गाइड।", readTime: "7 मिनट", views: "12.8K", tag: "स्वास्थ्य", tagColor: "bg-teal-50 text-teal-600" },
    { id: "bt-5", title: "परिवार के सदस्यों के लिए टेस्ट बुक करें", excerpt: "जानें कि अपने परिवार के सदस्यों के लिए डायग्नोस्टिक टेस्ट कैसे बुक करें और अपने एकल खाते से उनकी अपॉइंटमेंट कैसे प्रबंधित करें।", readTime: "3 मिनट", views: "6.3K", tag: "गाइड", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "bt-6", title: "हेल्थ पैकेज और बंडल की जानकारी", excerpt: "हमारे चुनिंदा हेल्थ पैकेज से पैसे बचाएँ। समझें कि प्रत्येक पैकेज में क्या शामिल है और अपने लिए सही पैकेज चुनें।", readTime: "4 मिनट", views: "7.9K", tag: "बचत", tagColor: "bg-amber-50 text-amber-600" },
  ],
  "Payments & Refunds": [
    { id: "pr-1", title: "स्वीकृत भुगतान विधियाँ", excerpt: "हम UPI, क्रेडिट/डेबिट कार्ड, नेट बैंकिंग, वॉलेट और EMI विकल्प स्वीकार करते हैं। चरण-दर-चरण भुगतान गाइड के साथ पूरी सूची।", readTime: "3 मिनट", views: "10.4K", tag: "भुगतान", tagColor: "bg-orange-50 text-orange-600" },
    { id: "pr-2", title: "अपने रिफंड की स्थिति ट्रैक करें", excerpt: "रिफंड शुरू किया? अपने डैशबोर्ड से रीयल-टाइम में इसकी प्रगति ट्रैक करें। प्रत्येक भुगतान विधि के लिए सामान्य प्रोसेसिंग समय बताया गया है।", readTime: "3 मिनट", views: "13.7K", tag: "रिफंड", tagColor: "bg-blue-50 text-blue-600" },
    { id: "pr-3", title: "इनवॉइस और भुगतान रसीद डाउनलोड करें", excerpt: "अपने खाते के बिलिंग सेक्शन से अपनी सभी बुकिंग के लिए GST-अनुपालक इनवॉइस एक्सेस और डाउनलोड करें।", readTime: "2 मिनट", views: "5.9K", tag: "बिलिंग", tagColor: "bg-slate-100 text-slate-600" },
    { id: "pr-4", title: "हमारी मूल्य निर्धारण नीति को समझें", excerpt: "टेस्ट की कीमतें कैसे निर्धारित होती हैं, शुल्क में क्या शामिल है और मेड्डीनेट की कीमतें सीधी लैब कीमतों से अलग क्यों हो सकती हैं।", readTime: "4 मिनट", views: "8.1K", tag: "मूल्य", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "pr-5", title: "डिस्काउंट कोड और ऑफर लागू करें", excerpt: "जानें कि अपने डायग्नोस्टिक टेस्ट पर सबसे अच्छी डील पाने के लिए प्रोमो कोड, रेफरल डिस्काउंट और सीज़नल ऑफर कैसे लागू करें।", readTime: "2 मिनट", views: "11.3K", tag: "बचत", tagColor: "bg-amber-50 text-amber-600" },
    { id: "pr-6", title: "भुगतान विफल हुआ? यहाँ जानें क्या करें", excerpt: "अगर आपका भुगतान नहीं हुआ तो चिंता न करें। समस्या को हल करने और अपनी बुकिंग पूरी करने के लिए इन समस्या निवारण चरणों का पालन करें।", readTime: "3 मिनट", views: "7.6K", tag: "समस्या निवारण", tagColor: "bg-red-50 text-red-600" },
  ],
  "Lab Partners": [
    { id: "lp-1", title: "पार्टनर डैशबोर्ड के साथ शुरुआत करें", excerpt: "लैब पार्टनर्स के लिए मेड्डीनेट डैशबोर्ड नेविगेट करने, बुकिंग प्रबंधित करने और एनालिटिक्स देखने के लिए व्यापक गाइड।", readTime: "6 मिनट", views: "4.2K", tag: "पार्टनर", tagColor: "bg-rose-50 text-rose-600" },
    { id: "lp-2", title: "लैब पार्टनर के रूप में मेड्डीनेट से कैसे जुड़ें", excerpt: "रजिस्ट्रेशन प्रक्रिया, आवश्यक दस्तावेज़, सत्यापन समयरेखा और अपनी लैब को हमारे प्लेटफॉर्म पर सूचीबद्ध करने के लिए सब कुछ।", readTime: "5 मिनट", views: "6.8K", tag: "ऑनबोर्डिंग", tagColor: "bg-blue-50 text-blue-600" },
    { id: "lp-3", title: "लैब सत्यापन और गुणवत्ता मानक", excerpt: "हमारी सत्यापन प्रक्रिया सुनिश्चित करती है कि केवल गुणवत्ता वाली लैब्स ही सूचीबद्ध हों। NABL, ISO और अन्य प्रमाणन आवश्यकताओं को समझें।", readTime: "4 मिनट", views: "3.9K", tag: "गुणवत्ता", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "lp-4", title: "टेस्ट लिस्टिंग और मूल्य प्रबंधन", excerpt: "अपनी लैब लिस्टिंग से टेस्ट कैसे जोड़ें, अपडेट करें या हटाएँ और ऐसी प्रतिस्पर्धी कीमत निर्धारित करें जो मरीजों को आकर्षित करे।", readTime: "4 मिनट", views: "3.4K", tag: "प्रबंधन", tagColor: "bg-purple-50 text-purple-600" },
    { id: "lp-5", title: "होम कलेक्शन अनुरोध संभालना", excerpt: "होम सैंपल कलेक्शन अनुरोधों, फ्लेबोटोमिस्ट असाइनमेंट और रिपोर्ट अपलोड प्रबंधित करने के लिए सर्वोत्तम प्रथाएँ।", readTime: "5 मिनट", views: "2.8K", tag: "संचालन", tagColor: "bg-orange-50 text-orange-600" },
    { id: "lp-6", title: "पार्टनर राजस्व और भुगतान", excerpt: "कमीशन संरचना, भुगतान अनुसूची और पार्टनर डैशबोर्ड पर अपनी कमाई को ट्रैक करने का तरीका समझें।", readTime: "3 मिनट", views: "5.1K", tag: "वित्त", tagColor: "bg-amber-50 text-amber-600" },
  ],
  "Other Queries": [
    { id: "oq-1", title: "मेड्डीनेट गोपनीयता नीति की व्याख्या", excerpt: "हमारी गोपनीयता नीति का सरल विवरण – हम कौन सा डेटा एकत्र करते हैं, इसका उपयोग कैसे होता है और एक उपयोगकर्ता के रूप में आपके अधिकार क्या हैं।", readTime: "5 मिनट", views: "7.3K", tag: "कानूनी", tagColor: "bg-slate-100 text-slate-600" },
    { id: "oq-2", title: "सेवा की शर्तें – मुख्य बिंदु", excerpt: "हमारी सेवा की शर्तों से सबसे महत्वपूर्ण धाराएँ, सरल और आसानी से समझ में आने वाली भाषा में समझाई गई हैं।", readTime: "4 मिनट", views: "5.6K", tag: "कानूनी", tagColor: "bg-slate-100 text-slate-600" },
    { id: "oq-3", title: "मेड्डीनेट के बारे में – हमारा मिशन और विज़न", excerpt: "मेड्डीनेट की टीम, स्वास्थ्य सेवा को सबके लिए सुलभ बनाने का हमारा मिशन और हम आगे कहाँ जा रहे हैं, जानें।", readTime: "3 मिनट", views: "4.2K", tag: "कंपनी", tagColor: "bg-blue-50 text-blue-600" },
    { id: "oq-4", title: "बग या समस्या की रिपोर्ट करें", excerpt: "कुछ टूटा हुआ मिला? हमारी इंजीनियरिंग टीम को बग, UI समस्या या तकनीकी समस्या की रिपोर्ट कैसे करें, यहाँ जानें।", readTime: "2 मिनट", views: "2.9K", tag: "सहायता", tagColor: "bg-red-50 text-red-600" },
    { id: "oq-5", title: "फीडबैक और फीचर अनुरोध", excerpt: "हम आपसे सुनना पसंद करते हैं! हमारे फीडबैक पोर्टल के माध्यम से नई सुविधाओं या सुधारों के लिए अपने विचार जमा करें।", readTime: "2 मिनट", views: "3.1K", tag: "फीडबैक", tagColor: "bg-emerald-50 text-emerald-600" },
    { id: "oq-6", title: "मेड्डीनेट पर एक्सेसिबिलिटी", excerpt: "विकलांग उपयोगकर्ताओं के लिए प्लेटफॉर्म को सुलभ बनाने के प्रति हमारी प्रतिबद्धता, जिसमें स्क्रीन रीडर सपोर्ट और बहुत कुछ शामिल है।", readTime: "3 मिनट", views: "1.8K", tag: "सुलभता", tagColor: "bg-purple-50 text-purple-600" },
  ],
};

// Helper to get articles by locale
function getArticlesByCategory(locale: string): CategoryArticles {
  return locale === "hi" ? articlesByCategoryHi : articlesByCategoryEn;
}

// Hindi category name mapping
const categoryNameMapHi: { [key: string]: string } = {
  "Getting Started": "शुरुआत करना",
  "Account & Profile": "खाता और प्रोफ़ाइल",
  "Booking & Tests": "बुकिंग और टेस्ट",
  "Payments & Refunds": "भुगतान और रिफंड",
  "Lab Partners": "लैब पार्टनर्स",
  "Other Queries": "अन्य प्रश्न",
};

/* ───── FAQ Item Component ───── */
function FAQItem({ question, answer, isHindi }: { question: string; answer: string; isHindi: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-5 text-left group transition-all"
      >
        <span className={`text-base sm:text-lg font-bold text-dark group-hover:text-primary transition-colors ${isHindi ? "font-hindi" : ""}`}>
          {question}
        </span>
        <div className={`p-1 rounded-lg transition-all ${isOpen ? "bg-primary/8 text-primary" : "bg-slate-100 text-slate-400 group-hover:text-slate-600"}`}>
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className={`pb-6 text-slate-600 leading-relaxed text-sm sm:text-base ${isHindi ? "font-hindi" : ""}`}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───── Articles Modal Component ───── */
function ArticlesModal({
  isOpen,
  onClose,
  categoryTitle,
  categoryIcon,
  categoryColor,
  articles,
  locale,
}: {
  isOpen: boolean;
  onClose: () => void;
  categoryTitle: string;
  categoryIcon: ReactNode;
  categoryColor: string;
  articles: Article[];
  locale: string;
}) {
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const isHindi = locale === "hi";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed inset-4 sm:inset-8 md:inset-y-12 md:inset-x-[10%] lg:inset-x-[15%] z-[101] bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col ${isHindi ? "font-hindi" : ""}`}
          >
            {/* Modal Header */}
            <div className="relative px-6 sm:px-10 pt-8 pb-6 border-b border-slate-100 shrink-0">
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3 pointer-events-none" />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${categoryColor} flex items-center justify-center shadow-sm`}>
                    {categoryIcon}
                  </div>
                  <div>
                    <h2 className={`text-xl sm:text-2xl font-extrabold text-dark tracking-tight ${isHindi ? "font-hindi" : ""}`}>
                      {categoryTitle}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mt-0.5">
                      {articles.length} {isHindi ? "लेख उपलब्ध" : "articles available"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Articles List - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-4 scrollbar-hide">
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className={`group p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      expandedArticle === article.id
                        ? "border-primary/30 bg-primary/3 shadow-lg shadow-primary/5"
                        : "border-slate-100 bg-white hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5"
                    }`}
                    onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                  >
                    {/* Article Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${article.tagColor}`}>
                            {article.tag}
                          </span>
                          <span className="flex items-center text-xs text-slate-400 gap-1">
                            <Clock className="w-3 h-3" /> {article.readTime}
                          </span>
                          <span className="flex items-center text-xs text-slate-400 gap-1">
                            <Eye className="w-3 h-3" /> {article.views}
                          </span>
                        </div>
                        <h3 className={`text-base sm:text-lg font-bold text-dark group-hover:text-primary transition-colors leading-snug ${isHindi ? "font-hindi" : ""}`}>
                          {article.title}
                        </h3>
                      </div>
                      <div className={`p-1.5 rounded-lg transition-all shrink-0 mt-1 ${
                        expandedArticle === article.id ? "bg-primary/10 text-primary rotate-180" : "bg-slate-100 text-slate-400"
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Expandable Content */}
                    <AnimatePresence>
                      {expandedArticle === article.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-5">
                              {article.excerpt}
                            </p>
                            <div className="flex items-center gap-3">
                              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm hover:shadow-md">
                                {isHindi ? "पूरा लेख पढ़ें" : "Read Full Article"} <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all" title="Bookmark">
                                <Bookmark className="w-4 h-4" />
                              </button>
                              <button className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all" title="Share">
                                <Share2 className="w-4 h-4" />
                              </button>
                              <button className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 transition-all" title="Helpful">
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 sm:px-10 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <p className="text-xs text-slate-400 font-medium">
                {isHindi ? "क्या आपको अभी भी मदद चाहिए?" : "Still need help?"}
              </p>
              <Link href="/chat" onClick={onClose}>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-dark text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all">
                  <MessageSquare className="w-4 h-4" /> {isHindi ? "लाइव चैट" : "Live Chat"}
                </button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ───── Main Help Center Page ───── */
export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCategoryIcon, setActiveCategoryIcon] = useState<ReactNode>(null);
  const [activeCategoryColor, setActiveCategoryColor] = useState<string>("");
  const { t, locale } = useLanguage();
  const isHindi = locale === "hi";

  const categories = [
    {
      icon: <Book className="w-6 h-6" />,
      title: t("helpCenter.cats.c1_title"),
      enTitle: "Getting Started",
      description: t("helpCenter.cats.c1_desc"),
      links: [t("helpCenter.cats.c1_l1"), t("helpCenter.cats.c1_l2"), t("helpCenter.cats.c1_l3")],
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: <User className="w-6 h-6" />,
      title: t("helpCenter.cats.c2_title"),
      enTitle: "Account & Profile",
      description: t("helpCenter.cats.c2_desc"),
      links: [t("helpCenter.cats.c2_l1"), t("helpCenter.cats.c2_l2"), t("helpCenter.cats.c2_l3")],
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: t("helpCenter.cats.c3_title"),
      enTitle: "Booking & Tests",
      description: t("helpCenter.cats.c3_desc"),
      links: [t("helpCenter.cats.c3_l1"), t("helpCenter.cats.c3_l2"), t("helpCenter.cats.c3_l3")],
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: t("helpCenter.cats.c4_title"),
      enTitle: "Payments & Refunds",
      description: t("helpCenter.cats.c4_desc"),
      links: [t("helpCenter.cats.c4_l1"), t("helpCenter.cats.c4_l2"), t("helpCenter.cats.c4_l3")],
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: t("helpCenter.cats.c5_title"),
      enTitle: "Lab Partners",
      description: t("helpCenter.cats.c5_desc"),
      links: [t("helpCenter.cats.c5_l1"), t("helpCenter.cats.c5_l2"), t("helpCenter.cats.c5_l3")],
      color: "bg-rose-50 text-rose-600",
    },
    {
      icon: <HelpCircle className="w-6 h-6" />,
      title: t("helpCenter.cats.c6_title"),
      enTitle: "Other Queries",
      description: t("helpCenter.cats.c6_desc"),
      links: [t("helpCenter.cats.c6_l1"), t("helpCenter.cats.c6_l2"), t("helpCenter.cats.c6_l3")],
      color: "bg-slate-50 text-slate-600",
    },
  ];

  const faqs = [
    { question: t("helpCenter.faqs.q1_q"), answer: t("helpCenter.faqs.q1_a") },
    { question: t("helpCenter.faqs.q2_q"), answer: t("helpCenter.faqs.q2_a") },
    { question: t("helpCenter.faqs.q3_q"), answer: t("helpCenter.faqs.q3_a") },
    { question: t("helpCenter.faqs.q4_q"), answer: t("helpCenter.faqs.q4_a") },
    { question: t("helpCenter.faqs.q5_q"), answer: t("helpCenter.faqs.q5_a") },
  ];

  const handleBrowseArticles = useCallback((cat: typeof categories[0]) => {
    setActiveCategory(cat.enTitle);
    setActiveCategoryIcon(cat.icon);
    setActiveCategoryColor(cat.color);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveCategory(null);
  }, []);

  const displayCategoryTitle = activeCategory
    ? (isHindi ? categoryNameMapHi[activeCategory] || activeCategory : activeCategory)
    : "";

  return (
    <div className={`bg-white min-h-screen pt-[120px] pb-24 ${isHindi ? "font-hindi" : ""}`}>
      {/* ─── Articles Modal ─── */}
      <ArticlesModal
        isOpen={!!activeCategory}
        onClose={handleCloseModal}
        categoryTitle={displayCategoryTitle}
        categoryIcon={activeCategoryIcon}
        categoryColor={activeCategoryColor}
        articles={activeCategory ? (getArticlesByCategory(locale)[activeCategory] || []) : []}
        locale={locale}
      />

      {/* ─── Hero Section ─── */}
      <section className="relative px-4 sm:px-6 mb-16 sm:mb-24 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-bold tracking-wide mb-6"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {t("helpCenter.tag")}
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-4xl sm:text-6xl font-extrabold text-dark mb-6 tracking-tight leading-tight"
          >
            {t("helpCenter.title1")} <span className="text-primary">{t("helpCenter.titleHighlight")}</span> {t("helpCenter.title2")}
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto"
          >
            {t("helpCenter.desc")}
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-white border-2 border-slate-200 rounded-2xl px-5 py-2 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input
                type="text"
                placeholder={t("helpCenter.searchPlaceholder")}
                className="flex-1 bg-transparent py-3 outline-none text-dark font-medium placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
              />
              <button className="hidden sm:block px-6 py-2 bg-dark text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all">
                {t("helpCenter.searchBtn")}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[90px] pointer-events-none" />
      </section>

      {/* ─── Categories Grid ─── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.enTitle}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="group p-8 rounded-3xl bg-white border border-slate-200 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <h3 className="text-xl font-bold text-dark mb-3 leading-tight">{cat.title}</h3>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">{cat.description}</p>
              <ul className="space-y-3 mb-6">
                {cat.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="flex items-center text-sm font-semibold text-slate-700 hover:text-primary transition-colors">
                      <ChevronRight className="w-4 h-4 mr-1 text-slate-300 group-hover:text-primary transition-colors" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleBrowseArticles(cat)}
                className="inline-flex items-center text-sm font-bold text-primary hover:translate-x-1 transition-transform cursor-pointer"
              >
                {t("helpCenter.browseArticles")} <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FAQs Section ─── */}
      <section className="bg-slate-50 py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark mb-4 tracking-tight">{t("helpCenter.faqTitle")}</h2>
            <p className="text-slate-600">{t("helpCenter.faqDesc")}</p>
          </div>
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-200 shadow-sm">
            {faqs.map((faq, idx) => (
              <FAQItem key={idx} question={faq.question} answer={faq.answer} isHindi={isHindi} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/chat">
              <button className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 mx-auto">
                <MessageSquare className="w-5 h-5" /> {t("helpCenter.chatBtn")}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Contact Section ─── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 mt-24">
        <div className="bg-dark rounded-[3rem] p-8 sm:p-16 relative overflow-hidden text-center sm:text-left">
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-lg">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">{t("helpCenter.contactTitle")}</h2>
              <p className="text-slate-400 text-lg mb-8">
                {t("helpCenter.contactDesc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                <Link href="/chat" className="w-full sm:w-auto">
                    <button className="w-full px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" /> {t("helpCenter.liveChat")}
                    </button>
                </Link>
                <Link href="mailto:support@meddynet.com" className="w-full sm:w-auto">
                    <button className="w-full px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                    {t("helpCenter.emailSupport")}
                    </button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
              {[
                { icon: <Mail className="w-5 h-5" />, title: t("helpCenter.emailUs"), detail: "support@meddynet.com", sub: t("helpCenter.emailDesc"), href: "mailto:support@meddynet.com" },
                { icon: <Phone className="w-5 h-5" />, title: t("helpCenter.callUs"), detail: "+91 9170252358", sub: t("helpCenter.callDesc"), href: "tel:+919170252358" },
              ].map((item) => (
                <Link key={item.title} href={item.href} className="block group/card">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover/card:scale-110 transition-transform">
                        {item.icon}
                    </div>
                    <h4 className="text-white font-bold mb-1">{item.title}</h4>
                    <p className="text-primary font-bold text-sm mb-1">{item.detail}</p>
                    <p className="text-slate-500 text-xs">{item.sub}</p>
                    </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Community Section ─── */}
      <section className="text-center py-24 px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="inline-block p-4 rounded-3xl bg-emerald-50 text-primary mb-8 animate-bounce">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-dark mb-4">{t("helpCenter.joinTitle")}</h2>
          <p className="text-slate-600 mb-10">
            {t("helpCenter.joinDesc")}
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder={t("helpCenter.emailPlaceholder")}
              className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 border-none outline-none focus:ring-2 focus:ring-primary/20 text-dark"
              suppressHydrationWarning
            />
            <button className="px-8 py-4 bg-dark text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">
              {t("helpCenter.subscribe")}
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}
