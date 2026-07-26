"use client";

import { motion } from "motion/react";
import {
  Camera,
  Wand2,
  Puzzle,
  Hand,
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
import { HeroPuzzle } from "@/features/landing/components/hero-puzzle";
import { HeroPhotoBooth } from "@/features/landing/components/hero-photo-booth";
import {
  staggerContainer,
  staggerItem,
  viewportOnce,
} from "@/lib/animations";



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
      "Take a picture in the Photo Booth. Choose from multiple layout modes.",
  },
  {
    icon: Wand2,
    step: "02",
    title: "Enhance",
    description:
      "Use AI to automatically remove the background and apply professional studio colors.",
  },
  {
    icon: Hand,
    step: "03",
    title: "Track",
    description:
      "Your webcam tracks your hand gestures in real-time without controllers.",
  },
  {
    icon: Puzzle,
    step: "04",
    title: "Play",
    description:
      "Solve the puzzle using pinch gestures. Assemble the pieces to reveal your memory.",
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
        className="grid gap-8 md:grid-cols-4"
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
      <HeroPuzzle />
      <HowItWorksSection />
      <HeroPhotoBooth />
      <FeaturesSection />
      <TechStackSection />
      <RoadmapSection />
      <Footer />
    </main>
  );
}
