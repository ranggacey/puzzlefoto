"use client";

import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { PuzzleHeroAnimation } from "./puzzle-hero-animation";
import { fadeIn, fadeInUp } from "@/lib/animations";

export function HeroPuzzle() {
  const handleStartPuzzle = () => {
    // Temporary placeholder for Sprint 5
    alert("The Puzzle Experience is arriving in Sprint 5! Try the Photo Booth below in the meantime.");
  };

  return (
    <section className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden pt-20">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:gap-8 lg:px-12 items-center">
        
        {/* Left: Copy & CTAs */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Vision Puzzle Experience
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mt-6 text-5xl font-black leading-[1.1] tracking-tight text-foreground sm:text-6xl md:text-7xl"
          >
            Turn Your Memories Into{" "}
            <span className="text-gradient-blue block mt-2">Interactive Puzzles.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Transform your own photos using AI, then solve them immersively 
            using nothing but your hand gestures. The future of interactive gameplay.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
          >
            <button
              onClick={handleStartPuzzle}
              className="group inline-flex h-14 items-center gap-2 rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground shadow-glow transition-all hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Start Puzzle
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => alert("Demo video placeholder")}
              className="group inline-flex h-14 items-center gap-2 rounded-xl border border-border bg-background/50 px-8 text-base font-semibold text-foreground backdrop-blur-sm transition-all hover:border-border/80 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Play className="h-4 w-4 fill-foreground transition-transform group-hover:scale-110" />
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Right: Animation */}
        <motion.div 
          className="flex items-center justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <PuzzleHeroAnimation />
        </motion.div>

      </div>
    </section>
  );
}
