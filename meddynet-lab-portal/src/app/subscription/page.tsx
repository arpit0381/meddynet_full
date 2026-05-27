"use client";

import { motion } from "framer-motion";
import { 
  Check, 
  Zap, 
  Crown, 
  Rocket,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  Microscope
} from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "₹0",
    duration: "/forever",
    description: "Perfect for new laboratories starting their digital journey.",
    icon: Microscope,
    color: "bg-slate-400",
    features: [
      "Listed on MeddyNet Map",
      "10 Tests Management",
      "22% Commission per test",
      "Community Support",
      "Basic Analytics"
    ],
    highlight: false,
    buttonText: "Get Started for Free"
  },
  {
    name: "Basic",
    price: "₹1,999",
    duration: "/month",
    description: "Ideal for small independent labs entering the digital space.",
    icon: Rocket,
    color: "bg-blue-500",
    features: [
      "Discovery on Map",
      "50 Tests Management",
      "18% Commission per test",
      "Standard Support",
      "Home Sample Collection (Manual)"
    ],
    highlight: false,
    buttonText: "Get Started with Basic"
  },
  {
    name: "Advanced",
    price: "₹4,999",
    duration: "/month",
    description: "Best for growing labs with high daily booking volume.",
    icon: Zap,
    color: "bg-amber-500",
    features: [
      "Priority in Search",
      "Unlimited Tests Management",
      "15% Commission (Lowered)",
      "Dedicated Dashboard",
      "Technician Management App",
      "24/7 Priority Support"
    ],
    highlight: true,
    tag: "Most Popular",
    buttonText: "Get Started with Advanced"
  },
  {
    name: "Premium",
    price: "₹9,999",
    duration: "/month",
    description: "Complete SaaS solution for large diagnostics chains.",
    icon: Crown,
    color: "bg-indigo-600",
    features: [
      "Top Rank in City",
      "API Integration Support",
      "12% Commission (Lowest)",
      "SLA Guaranteed Support",
      "Advanced Revenue AI",
      "Multi-city Listing"
    ],
    highlight: false,
    buttonText: "Get Started with Premium"
  }
];

export default function LabSubscriptionPage() {
  return (
    <div className="min-h-screen bg-surface py-10 sm:py-20 px-4 font-sans">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest mb-8"
          >
             <ShieldCheck className="w-4 h-4" /> Final Step: Choose Your Plan
          </motion.div>
          <h1 className="text-3xl sm:text-6xl font-black text-dark-light tracking-tight mb-6 px-4">
            Scale your Lab business with <br className="sm:hidden" /> <span className="text-primary">MeddyNet</span>
          </h1>
          <p className="text-text-muted font-bold text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-6">
            Pick a plan that fits your current needs. You can upgrade or downgrade anytime as your laboratory expands.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-20">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white rounded-5xl sm:rounded-[3.5rem] p-8 lg:p-10 border-2 transition-all duration-500 group flex flex-col ${
                plan.highlight 
                  ? 'border-primary shadow-2xl shadow-primary/10 lg:scale-105 z-10' 
                  : 'border-border-dark/10 shadow-xl shadow-black/2 hover:border-primary/20'
              }`}
            >
              {plan.tag && (
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 rounded-full bg-primary text-white text-[10px] font-black tracking-widest uppercase shadow-xl shadow-primary/40 block whitespace-nowrap">
                   {plan.tag}
                 </div>
              )}

              <div className="mb-8">
                 <div className={`w-14 h-14 rounded-3xl ${plan.color} flex items-center justify-center text-white shadow-xl mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <plan.icon className="w-6 h-6" />
                 </div>
                 <h3 className="text-2xl font-black text-dark-light mb-2">{plan.name}</h3>
                 <p className="text-[11px] font-bold text-text-muted leading-relaxed min-h-[40px]">{plan.description}</p>
              </div>

              <div className="mb-8 text-left">
                 <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-dark-light tracking-tighter">{plan.price}</span>
                    <span className="text-text-muted font-bold text-xs">{plan.duration}</span>
                 </div>
              </div>

              <div className="space-y-4 mb-10 flex-1 text-left">
                 {plan.features.map((feature) => (
                   <div key={feature} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${plan.highlight ? 'bg-primary/20 text-primary' : 'bg-surface text-primary'}`}>
                         <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[13px] font-bold text-dark-light/80 leading-tight">{feature}</span>
                   </div>
                 ))}
              </div>

              <Link 
                href="/launch"
                className={`w-full py-5 rounded-2.5xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                  plan.highlight 
                    ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1' 
                    : 'bg-dark text-white hover:bg-dark-light shadow-xl shadow-dark/10 hover:-translate-y-1'
                }`}
              >
                {plan.buttonText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Extra Info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-10 bg-white sm:bg-transparent rounded-4xl">
           <Link href="/register" className="flex items-center gap-2 text-sm font-black text-text-muted hover:text-dark-light transition-colors group">
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <ChevronLeft className="w-5 h-5" /> 
              </div>
              Change Registration Details
           </Link>
           
           <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 <p className="text-xs font-bold text-text-muted">Prices are Inclusive of GST.</p>
              </div>
              <p className="text-xs font-bold text-text-muted">
                Need a custom enterprise plan? <button className="text-primary font-black hover:underline cursor-pointer ml-1">Contact Sales</button>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
