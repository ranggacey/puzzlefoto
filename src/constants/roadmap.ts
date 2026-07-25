export interface RoadmapPhase {
  phase: string;
  title: string;
  status: "completed" | "in-progress" | "planned";
  items: string[];
}

export const roadmap: RoadmapPhase[] = [
  {
    phase: "Phase 1",
    title: "Foundation",
    status: "completed",
    items: [
      "Project architecture and design system",
      "Landing page and navigation",
      "Reusable component library",
      "State management infrastructure",
    ],
  },
  {
    phase: "Phase 2",
    title: "Photo Booth",
    status: "in-progress",
    items: [
      "Live camera preview and capture",
      "AI background removal",
      "Virtual background replacement",
      "Portrait mode with depth blur",
      "Professional capture animations",
    ],
  },
  {
    phase: "Phase 3",
    title: "Puzzle Game",
    status: "planned",
    items: [
      "Canvas-based puzzle rendering",
      "MediaPipe hand tracking integration",
      "Pinch gesture puzzle interaction",
      "Progress tracking and completion effects",
      "Difficulty configuration",
    ],
  },
];
