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
    status: "completed",
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
    status: "completed",
    items: [
      "Canvas-based puzzle rendering",
      "MediaPipe hand tracking integration",
      "Pinch gesture puzzle interaction",
      "Progress tracking and completion effects",
      "Difficulty configuration",
    ],
  },
  {
    phase: "Phase 4",
    title: "Export & Social",
    status: "planned",
    items: [
      "Save finalized photo to device",
      "Generate challenge links with puzzle configuration",
      "Time tracking and score keeping leaderboards",
    ],
  },
];
