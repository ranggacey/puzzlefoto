import { CameraProvider } from "@/components/providers/camera-provider";

export default function PhotoBoothLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CameraProvider>
      {children}
    </CameraProvider>
  );
}
