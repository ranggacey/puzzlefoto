import { PhotoBoothCameraProvider } from "@/features/photo-booth/providers/photo-booth-camera-provider";

export default function PhotoBoothLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PhotoBoothCameraProvider>
      {children}
    </PhotoBoothCameraProvider>
  );
}
