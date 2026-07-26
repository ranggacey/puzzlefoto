"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { usePuzzleStore } from "@/store/puzzle-store";

export function FloatingPhoto() {
  const { scene, sourceImage } = usePuzzleStore();

  if (!sourceImage) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={
        scene === "freeze" 
          ? { opacity: 1, scale: 1, y: 0 } 
          : { 
              opacity: 1, 
              scale: [1, 1.02, 1],
              y: [0, -10, 0]
            }
      }
      transition={
        scene === "freeze"
          ? { type: "spring", stiffness: 300, damping: 20 }
          : { 
              scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
      }
      className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20"
    >
      <Image
        src={sourceImage.image}
        alt="Processed photo"
        fill
        className="object-cover"
        priority
      />
    </motion.div>
  );
}
