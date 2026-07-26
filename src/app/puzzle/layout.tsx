import { PuzzleCameraProvider } from "@/features/puzzle/providers/puzzle-camera-provider";

export default function PuzzleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PuzzleCameraProvider>
      {children}
    </PuzzleCameraProvider>
  );
}
