"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeInUp, viewportOnce } from "@/lib/animations";

interface PageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

export function PageHeader({
  badge,
  title,
  description,
  className,
  align = "center",
}: PageHeaderProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn(
        "mb-16 max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {badge && (
        <span className="mb-4 inline-block rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-xs font-medium tracking-wide text-zinc-400 uppercase">
          {badge}
        </span>
      )}
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg leading-relaxed text-zinc-400">
          {description}
        </p>
      )}
    </motion.div>
  );
}
