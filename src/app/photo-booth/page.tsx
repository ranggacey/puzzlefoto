import { Container } from "@/components/layout/container";

export default function PhotoBoothPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Container className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          Photo Booth
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          Coming soon. The AI-powered photo capture experience will be built
          here.
        </p>
      </Container>
    </main>
  );
}
