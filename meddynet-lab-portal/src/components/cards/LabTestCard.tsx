"use client";

import Link from "next/link";
import { MapPin, Star, Home, Clock, ShieldCheck } from "lucide-react";

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
    <div className="group bg-white border border-border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/8 hover:border-primary/30 relative overflow-hidden">
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-primary-light text-white text-xs font-bold px-2.5 py-1 rounded-lg">
          {discount}% OFF
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-4">
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-base shadow-lg`}
        >
          {initials}
        </div>
        <div>
          <h4 className="text-base font-semibold text-dark-light group-hover:text-primary transition-colors font-bold">
            {labName}
          </h4>
          <div className="flex items-center gap-1.5 text-xs">
            <Star className="w-3.5 h-3.5 text-star fill-star" />
            <span className="font-medium text-star">{rating}</span>
            <span className="text-text-muted">
              ({reviewCount.toLocaleString()} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Test Name (if provided) */}
      {testName && (
        <p className="text-sm font-medium text-text-secondary mb-3 truncate font-bold">
          {testName}
        </p>
      )}

      {/* Price & Distance */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-2xl font-bold text-primary">
            ₹{price.toLocaleString()}
          </span>
          {originalPrice > price && (
            <span className="text-sm text-text-muted line-through ml-2">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <MapPin className="w-3.5 h-3.5" />
          {distance} km away
        </div>
      </div>

      {/* Feature Tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {homeCollection && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-success/10 text-success">
            <Home className="w-3 h-3" />
            Home Collection
          </span>
        )}
        {certified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent">
            <ShieldCheck className="w-3 h-3" />
            {certified}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-warning/10 text-warning">
          <Clock className="w-3 h-3" />
          {turnaround}
        </span>
      </div>

      {/* Book Now */}
      <Link
        href={`/labs/${id}`}
        className="block w-full text-center py-3 rounded-full bg-gradient-to-r from-primary to-primary-light text-white font-black text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
      >
        Book Now
      </Link>
    </div>
  );
}
