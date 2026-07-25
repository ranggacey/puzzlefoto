export const siteConfig = {
  name: "Vision Puzzle",
  description:
    "An interactive computer vision web application combining AI-powered photo capture with hand gesture-controlled puzzle gameplay.",
  url: "https://vision-puzzle.dev",
  author: "Vision Puzzle",
  keywords: [
    "computer vision",
    "hand tracking",
    "puzzle",
    "photo booth",
    "mediapipe",
    "ai",
    "web application",
  ],
} as const;

export const navigation = {
  main: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Tech Stack", href: "#tech-stack" },
    { label: "Roadmap", href: "#roadmap" },
  ],
  cta: {
    label: "Try Photo Booth",
    href: "/photo-booth",
  },
} as const;

export type NavItem = (typeof navigation.main)[number];
