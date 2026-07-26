"use client";

import { motion } from "motion/react";
import { staggerItem } from "@/lib/animations";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      className="group relative rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:bg-muted/50 hover:shadow-glow"
    >
      {/* Subtle hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/[0.03] to-transparent" />
      </div>

      <div className="relative">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary transition-colors duration-300 group-hover:bg-primary/10">
          <Icon className="h-5 w-5" />
        </div>

        <h3 className="mb-2 text-base font-semibold tracking-tight text-card-foreground">
          {title}
        </h3>

        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
