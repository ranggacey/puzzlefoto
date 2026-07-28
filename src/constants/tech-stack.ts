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
  { name: "Next.js 16", category: "Framework" },
  { name: "React 19", category: "Framework" },
  { name: "TypeScript", category: "Language" },
  { name: "Tailwind CSS v4", category: "Styling" },
  { name: "shadcn/ui", category: "Styling" },
  { name: "Motion", category: "Animation" },
  { name: "Zustand", category: "State" },
  { name: "MediaPipe", category: "Computer Vision" },
  { name: "TensorFlow.js", category: "Computer Vision" },
  { name: "Canvas API", category: "Framework" },
];

export const categoryColors: Record<TechCategory, string> = {
  Framework: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  Styling: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  Animation: "bg-amber-400/10 text-amber-700 dark:text-amber-400 border-amber-400/20",
  State: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  "Computer Vision": "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  Language: "bg-amber-400/10 text-amber-700 dark:text-amber-400 border-amber-400/20",
};
