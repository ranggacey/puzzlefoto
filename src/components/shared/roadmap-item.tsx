"use client";

import { motion } from "motion/react";
import { Check, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { staggerItem } from "@/lib/animations";
import type { RoadmapPhase } from "@/constants/roadmap";

interface RoadmapItemProps {
  phase: RoadmapPhase;
  isLast: boolean;
}

const statusConfig = {
  completed: {
    icon: Check,
    dotColor: "bg-emerald-500",
    lineColor: "bg-emerald-500/30",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    label: "Completed",
  },
  "in-progress": {
    icon: Loader2,
    dotColor: "bg-blue-500",
    lineColor: "bg-blue-500/30",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    label: "In Progress",
  },
  planned: {
    icon: Circle,
    dotColor: "bg-zinc-600",
    lineColor: "bg-zinc-800",
    badgeColor: "bg-zinc-800 text-zinc-400 border-zinc-700",
    label: "Planned",
  },
};

export function RoadmapItem({ phase, isLast }: RoadmapItemProps) {
  const config = statusConfig[phase.status];
  const StatusIcon = config.icon;

  return (
    <motion.div variants={staggerItem} className="relative flex gap-6">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            config.dotColor,
          )}
        >
          <StatusIcon
            className={cn(
              "h-4 w-4 text-white",
              phase.status === "in-progress" && "animate-spin",
            )}
          />
        </div>
        {!isLast && (
          <div className={cn("mt-2 w-px grow", config.lineColor)} />
        )}
      </div>

      {/* Content */}
      <div className="pb-12">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            {phase.phase}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
              config.badgeColor,
            )}
          >
            {config.label}
          </span>
        </div>

        <h3 className="mb-3 text-lg font-semibold tracking-tight text-zinc-100">
          {phase.title}
        </h3>

        <ul className="space-y-2">
          {phase.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-sm text-zinc-400"
            >
              <div
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  phase.status === "completed" ? "bg-emerald-500/50" : "bg-zinc-700",
                )}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
