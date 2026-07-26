import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function BackgroundRemovalPlaceholderPage() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background p-6">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-10 w-10" />
        </div>
        
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          AI Background Removal
        </h1>
        
        <p className="mb-8 text-lg text-muted-foreground">
          This feature will be implemented in Sprint 4. The captured photos will be processed here to remove the background securely on-device using MediaPipe.
        </p>

        <Link
          href="/photo-booth"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-secondary px-6 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Photo Booth
        </Link>
      </div>
    </main>
  );
}
