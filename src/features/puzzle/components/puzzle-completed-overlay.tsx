import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { motionPresets, stagger } from "@/lib/motion";
import { usePuzzleStore } from "@/store/puzzle-store";
import { useRouter } from "next/navigation";
import { InteractionSurface } from "@/features/hand-tracking/components/interaction-surface";

function Confetti() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number; delay: number }[]>([]);

  useEffect(() => {
    const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];
    const p = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8,
      delay: Math.random() * 0.5,
    }));
    setParticles(p);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ y: p.y, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: 720 }}
          transition={{ duration: 2 + Math.random() * 2, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

export function PuzzleCompletedOverlay() {
  const { moveCount, difficulty, elapsedTime, sourceImage, restartPuzzle, reset } = usePuzzleStore();
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formattedTime = formatTime(elapsedTime);

  const handleNewPhoto = () => {
    reset();
  };

  const handleHome = () => {
    reset();
    router.push("/");
  };

  const handleDownload = () => {
    if (sourceImage) {
      const link = document.createElement("a");
      link.download = `puzzle-complete-${Date.now()}.png`;
      link.href = sourceImage.image;
      link.click();
    }
  };

  const handleShare = async () => {
    if (!sourceImage) return;
    try {
      const blob = await (await fetch(sourceImage.image)).blob();
      const file = new File([blob], "puzzle-complete.png", { type: "image/png" });
      await navigator.share({ title: "Puzzle Complete!", files: [file] });
    } catch {
      // Fallback: copy URL
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {}
    }
  };

  const difficultyLabel: Record<string, string> = {
    easy: "Easy 😊",
    medium: "Medium 🤔",
    hard: "Hard 🧩",
    expert: "Expert 🧠",
  };

  return (
    <motion.div 
      variants={motionPresets.overlay}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
    >
      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>

      <motion.div 
        variants={stagger.medium}
        className="relative rounded-3xl bg-gradient-to-b from-black/90 to-emerald-950/90 p-8 w-full max-w-sm text-center border border-emerald-500/20 shadow-2xl flex flex-col items-center overflow-hidden"
      >
        {/* Glow */}
        <div className="pointer-events-none absolute -top-20 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
        
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-3xl"
        >
          🎉
        </motion.div>

        <motion.h2 variants={stagger.item} className="text-3xl font-bold text-white mb-2">
          Puzzle Complete!
        </motion.h2>
        <motion.p variants={stagger.item} className="text-emerald-400 text-sm mb-6 font-medium">
          {difficultyLabel[difficulty] || difficulty}
        </motion.p>
        
        {/* Stats */}
        <motion.div variants={stagger.item} className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl bg-white/5 p-3 border border-white/10">
            <p className="text-xs text-white/50 mb-1">Moves</p>
            <p className="text-xl font-bold text-white">{moveCount}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3 border border-white/10">
            <p className="text-xs text-white/50 mb-1">Time</p>
            <p className="text-xl font-bold text-white">{formattedTime}</p>
          </div>
        </motion.div>

        {/* Preview original photo */}
        {sourceImage && (
          <motion.div variants={stagger.item} className="mb-6 h-16 w-16 rounded-lg overflow-hidden border border-white/10">
            <img src={sourceImage.image} alt="Puzzle" className="h-full w-full object-cover" />
          </motion.div>
        )}

        {/* Actions */}
        <motion.div variants={stagger.item} className="w-full flex flex-col gap-2">
          <InteractionSurface onClick={handleDownload} magnetic className="w-full rounded-xl">
            <motion.button 
              variants={motionPresets.button}
              initial="idle" whileHover="hover" whileTap="press"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-glow"
            >
              📥 Download Photo
            </motion.button>
          </InteractionSurface>

          {typeof navigator.share === "function" && (
            <InteractionSurface onClick={handleShare} magnetic className="w-full rounded-xl">
              <motion.button 
                variants={motionPresets.button}
                initial="idle" whileHover="hover" whileTap="press"
                className="w-full py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
              >
                ↗️ Share
              </motion.button>
            </InteractionSurface>
          )}

          <div className="grid grid-cols-2 gap-2 mt-1">
            <InteractionSurface onClick={restartPuzzle} magnetic className="w-full rounded-xl">
              <motion.button 
                variants={motionPresets.button}
                initial="idle" whileHover="hover" whileTap="press"
                className="w-full py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors text-sm"
              >
                🔄 Play Again
              </motion.button>
            </InteractionSurface>

            <InteractionSurface onClick={handleNewPhoto} magnetic className="w-full rounded-xl">
              <motion.button 
                variants={motionPresets.button}
                initial="idle" whileHover="hover" whileTap="press"
                className="w-full py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors text-sm"
              >
                📸 New Photo
              </motion.button>
            </InteractionSurface>
          </div>

          <InteractionSurface onClick={handleHome} magnetic className="w-full rounded-xl">
            <motion.button 
              variants={motionPresets.button}
              initial="idle" whileHover="hover" whileTap="press"
              className="w-full py-2.5 bg-transparent text-white/40 text-sm rounded-xl hover:bg-white/5 hover:text-white/60 transition-colors"
            >
              Back to Home
            </motion.button>
          </InteractionSurface>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
