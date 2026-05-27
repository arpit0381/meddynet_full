"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ breadcrumbs, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-5 border-b border-border-dim">
      <div className="min-w-0">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm mb-1.5">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx < breadcrumbs.length - 1 ? (
                <>
                   <Link
                    href={crumb.href || "#"}
                    className="text-muted hover:text-main-text transition-colors font-medium hover:underline decoration-muted/30 underline-offset-4"
                  >
                    {crumb.label}
                  </Link>
                  <ChevronRight size={14} className="text-muted/40 shrink-0" />
                </>
              ) : (
                <span className="text-main-text font-bold tracking-tight">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
 
        {/* Description */}
        {description && (
          <p className="text-sm text-muted font-medium leading-relaxed max-w-2xl">{description}</p>
        )}
      </div>

      {/* Actions slot */}
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
