"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Camera,
  Wand2,
  Puzzle,
} from "lucide-react";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { Footer } from "@/components/layout/footer";
import { FeatureCard } from "@/components/shared/feature-card";
import { TechBadge } from "@/components/shared/tech-badge";
import { RoadmapItem } from "@/components/shared/roadmap-item";
import { features } from "@/constants/features";
import { techStack, categoryColors } from "@/constants/tech-stack";
import { roadmap } from "@/constants/roadmap";
import {
  fadeIn,
  fadeInUp,
  staggerContainer,
  staggerItem,
  viewportOnce,
} from "@/lib/animations";

// ============================================================
// Hero Section
// ============================================================

function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-24 text-center">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Computer Vision Meets Interactive Design
          </span>
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mt-6 text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl md:text-7xl"
        >
          Capture. Transform.
          <br />
          <span className="text-gradient-blue">Play.</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          Take AI-enhanced photos and transform them into interactive puzzles
          controlled entirely by hand gestures. A showcase of modern web
          technologies and computer vision.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/photo-booth"
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Try Photo Booth
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#features"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background/50 px-6 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-border/80 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Learn More
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// Features Section
// ============================================================

function FeaturesSection() {
  return (
    <Section id="features">
      <PageHeader
        badge="Features"
        title="Built for the Future of Web Interaction"
        description="Combining cutting-edge computer vision with modern frontend engineering to create experiences that feel native and responsive."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </motion.div>
    </Section>
  );
}

// ============================================================
// How It Works Section
// ============================================================

const steps = [
  {
    icon: Camera,
    step: "01",
    title: "Capture",
    description:
      "Use the AI Photo Booth to take a photo. Choose from multiple capture modes including virtual backgrounds and portrait mode.",
  },
  {
    icon: Wand2,
    step: "02",
    title: "Transform",
    description:
      "Your captured photo is automatically processed and transformed into puzzle pieces using canvas-based rendering.",
  },
  {
    icon: Puzzle,
    step: "03",
    title: "Play",
    description:
      "Solve the puzzle using hand gestures. Pinch to pick up pieces and place them in the correct position.",
  },
];

function HowItWorksSection() {
  return (
    <Section id="how-it-works" className="border-t border-border/50">
      <PageHeader
        badge="How It Works"
        title="Three Steps to Play"
        description="A seamless flow from photo capture to interactive puzzle gameplay."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="grid gap-8 md:grid-cols-3"
      >
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.step}
              variants={staggerItem}
              className="relative text-center"
            >
              {/* Step number */}
              <span className="mb-6 block text-6xl font-bold tracking-tighter text-muted/30">
                {step.step}
              </span>

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-primary">
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="mb-2 text-lg font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}

// ============================================================
// Tech Stack Section
// ============================================================

function TechStackSection() {
  return (
    <Section id="tech-stack" className="border-t border-border/50">
      <PageHeader
        badge="Technology"
        title="Modern Tech Stack"
        description="Built with production-grade tools and frameworks for performance, scalability, and developer experience."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="flex flex-wrap justify-center gap-3"
      >
        {techStack.map((tech) => (
          <TechBadge
            key={tech.name}
            name={tech.name}
            colorClasses={categoryColors[tech.category]}
          />
        ))}
      </motion.div>
    </Section>
  );
}

// ============================================================
// Roadmap Section
// ============================================================

function RoadmapSection() {
  return (
    <Section id="roadmap" className="border-t border-border/50">
      <PageHeader
        badge="Roadmap"
        title="Development Timeline"
        description="A phased approach to building a production-quality computer vision web application."
        align="left"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="ml-2"
      >
        {roadmap.map((phase, index) => (
          <RoadmapItem
            key={phase.phase}
            phase={phase}
            isLast={index === roadmap.length - 1}
          />
        ))}
      </motion.div>
    </Section>
  );
}

// ============================================================
// Landing Page
// ============================================================

export default function LandingPage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TechStackSection />
      <RoadmapSection />
      <Footer />
    </main>
  );
}
