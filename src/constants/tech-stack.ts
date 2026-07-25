export interface TechItem {
  name: string;
  category: TechCategory;
}

export type TechCategory =
  | "Framework"
  | "Styling"
  | "Animation"
  | "State"
  | "Computer Vision"
  | "Language";

export const techStack: TechItem[] = [
  { name: "Next.js 15", category: "Framework" },
  { name: "React 19", category: "Framework" },
  { name: "TypeScript", category: "Language" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "shadcn/ui", category: "Styling" },
  { name: "Motion", category: "Animation" },
  { name: "Zustand", category: "State" },
  { name: "MediaPipe", category: "Computer Vision" },
  { name: "TensorFlow.js", category: "Computer Vision" },
  { name: "Canvas API", category: "Framework" },
];

export const categoryColors: Record<TechCategory, string> = {
  Framework: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Styling: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Animation: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  State: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Computer Vision": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Language: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};
