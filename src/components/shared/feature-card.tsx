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
      className="group relative rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-900/80"
    >
      {/* Subtle hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-500/[0.03] to-transparent" />
      </div>

      <div className="relative">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 text-blue-400 transition-colors duration-300 group-hover:bg-blue-600/10 group-hover:text-blue-400">
          <Icon className="h-5 w-5" />
        </div>

        <h3 className="mb-2 text-base font-semibold tracking-tight text-zinc-100">
          {title}
        </h3>

        <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
      </div>
    </motion.div>
  );
}
