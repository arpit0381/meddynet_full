"use client";

import Link from "next/link";
import { MapPin, Star, Home, Clock, ShieldCheck } from "lucide-react";
import { haptics } from "@/lib/haptics";

interface LabTestCardProps {
  id: string;
  labName: string;
  initials: string;
  rating: number;
  reviewCount: number;
  testName?: string;
  price: number;
  originalPrice: number;
  distance: number;
  homeCollection: boolean;
  certified: string;
  turnaround: string;
  color: string;
}

export default function LabTestCard({
  id,
  labName,
  initials,
  rating,
  reviewCount,
  testName,
  price,
  originalPrice,
  distance,
  homeCollection,
  certified,
  turnaround,
  color,
}: LabTestCardProps) {
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <div className="group bg-white border border-border rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/8 hover:border-primary/30 active:scale-[0.98] relative overflow-hidden">
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-3 right-3 bg-linear-to-r from-primary to-primary-light text-white text-xs font-bold px-2.5 py-1 rounded-lg">
          {discount}% OFF
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br ${color} flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg shrink-0`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-semibold text-dark-light group-hover:text-primary transition-colors truncate">
            {labName}
          </h4>
          <div className="flex items-center gap-1.5 text-xs">
            <Star className="w-3.5 h-3.5 text-star fill-star shrink-0" />
            <span className="font-medium text-star">{rating}</span>
            <span className="text-slate-300 truncate">
              ({reviewCount.toLocaleString()} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Test Name (if provided) — full, no truncation */}
      {testName && (
        <p className="text-sm font-medium text-text-secondary mb-3">
          {testName}
        </p>
      )}

      {/* Price & Distance */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-bold text-primary">
            ₹{price.toLocaleString()}
          </span>
          {originalPrice > price && (
            <span className="text-sm text-slate-300 line-through">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {distance} km
        </div>
      </div>

      {/* Feature Tags — wrap on mobile */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {homeCollection && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
            <Home className="w-3 h-3" />
            Home
          </span>
        )}
        {certified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-accent/10 text-accent">
            <ShieldCheck className="w-3 h-3" />
            {certified}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600">
          <Clock className="w-3 h-3" />
          {turnaround}
        </span>
      </div>

      {/* Book Now — full width, 44px min height */}
      <Link
        href={`/labs/${id}`}
        onClick={() => haptics.medium()}
        className="block w-full text-center min-h-[44px] leading-[44px] rounded-xl bg-linear-to-r from-primary to-primary-light text-white font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
      >
        Book Now
      </Link>
    </div>
  );
}
