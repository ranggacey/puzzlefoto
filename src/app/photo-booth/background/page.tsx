"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Lazy load the heavy ML engine so it doesn't inflate the landing page or initial bundle
const BackgroundStudio = dynamic(
  () => import("@/features/background-studio/components/background-studio").then((mod) => mod.BackgroundStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-bold tracking-tight">Loading AI Engine...</h2>
      </div>
    ),
  }
);

export default function BackgroundStudioPage() {
  return <BackgroundStudio />;
}
