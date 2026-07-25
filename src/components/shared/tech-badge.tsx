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
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105",
        colorClasses,
      )}
    >
      {name}
    </motion.span>
  );
}
