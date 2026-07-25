import {
  Camera,
  Hand,
  Sparkles,
  Puzzle,
  Layers,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: Camera,
    title: "AI Photo Booth",
    description:
      "Capture professional-quality photos with intelligent background removal and real-time virtual background replacement.",
  },
  {
    icon: Hand,
    title: "Hand Gesture Control",
    description:
      "Navigate and interact with the puzzle using natural hand gestures powered by MediaPipe's advanced hand tracking technology.",
  },
  {
    icon: Sparkles,
    title: "AI Background Removal",
    description:
      "Instantly remove or replace backgrounds using on-device machine learning, no cloud processing required.",
  },
  {
    icon: Puzzle,
    title: "Dynamic Puzzle Generation",
    description:
      "Transform any captured photo into a fully interactive puzzle with configurable difficulty levels.",
  },
  {
    icon: Layers,
    title: "Multiple Capture Modes",
    description:
      "Choose from Original, Virtual Background, or Portrait Mode to create the perfect image for your puzzle.",
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    description:
      "All computer vision tasks run directly in the browser at 30+ FPS using WebGL-accelerated inference.",
  },
];
