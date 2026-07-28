"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { featureCard } from "@/lib/animations";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export function FeatureCard({ icon: Icon, title, description, index = 0 }: FeatureCardProps) {
  const gradientVariants = [
    "from-emerald-500/20 via-emerald-400/10 to-transparent",
    "from-sky-500/20 via-sky-400/10 to-transparent",
    "from-amber-400/20 via-amber-300/10 to-transparent",
    "from-emerald-500/20 via-sky-400/10 to-transparent",
    "from-sky-500/20 via-amber-300/10 to-transparent",
    "from-amber-400/20 via-emerald-400/10 to-transparent",
  ];

  const iconBgVariants = [
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    "bg-amber-400/10 text-amber-600 dark:text-amber-400",
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    "bg-amber-400/10 text-amber-600 dark:text-amber-400",
  ];

  return (
    <motion.div
      variants={featureCard}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-border/80 hover:shadow-lg hover:shadow-emerald-500/5"
    >
      {/* Gradient overlay */}
      <div className={cn(
        "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
        gradientVariants[index % gradientVariants.length]
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className={cn(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
          iconBgVariants[index % iconBgVariants.length]
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
