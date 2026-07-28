"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PhotoBoothHeroAnimation } from "./photo-booth-hero-animation";
import { fadeIn, fadeInUp } from "@/lib/animations";
import { Section } from "@/components/layout/section";

export function HeroPhotoBooth() {
  return (
    <Section id="photo-booth" className="relative flex w-full items-center justify-center overflow-hidden border-t border-border/50 bg-gradient-soft py-24">
      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-12 items-center">
        
        {/* Left: Animation */}
        <motion.div 
          className="order-2 flex items-center justify-center lg:order-1 lg:justify-start"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <PhotoBoothHeroAnimation />
        </motion.div>

        {/* Right: Copy & CTAs */}
        <div className="order-1 flex flex-col items-center text-center lg:order-2 lg:items-start lg:text-left">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
              Supporting Feature
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl"
          >
            Professional AI <br />
            <span className="text-gradient-blue">Photo Booth.</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Capture beautiful photos before creating your puzzle. 
            Features real-time AI background removal, studio lighting simulation, 
            and various capture layouts including Film Strip and 2x2 Grid.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex"
          >
            <Link
              href="/photo-booth"
              className="group inline-flex h-12 items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-6 text-sm font-medium text-sky-700 dark:text-sky-300 shadow-glow-blue transition-all hover:bg-sky-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Open Photo Booth
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>

      </div>
    </Section>
  );
}
