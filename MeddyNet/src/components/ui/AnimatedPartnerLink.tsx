"use client";

import Link from "next/link";


interface PartnerLinkProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function AnimatedPartnerLink({ 
  children, 
  className,
  onClick 
}: PartnerLinkProps) {
  return (
    <Link 
      href="/partnership"
      onClick={onClick} 
      className={className}
    >
      {children || "Partner With Us"}
    </Link>
  );
}
