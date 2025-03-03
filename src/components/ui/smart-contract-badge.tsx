import React from "react";
import { Badge } from "@/components/ui/badge";

export function SmartContractBadge() {
  return (
    <Badge 
      variant="secondary" 
      className="bg-[#1a1a1a] text-white border border-[#333] rounded-sm py-1.5 px-8 text-sm font-light tracking-wide"
    >
      Smarter contracts, powered by AI
    </Badge>
  );
} 