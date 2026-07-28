"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { staggerItem } from "@/lib/animations";

interface TechBadgeProps {
  name: string;
  colorClasses: string;
}

export function TechBadge({ name, colorClasses }: TechBadgeProps) {
  return (
    <motion.span
      variants={staggerItem}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg",
        colorClasses
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
      {name}
    </motion.span>
  );
}
