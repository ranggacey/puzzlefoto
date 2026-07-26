import { motion, AnimatePresence } from "motion/react";

interface CountdownOverlayProps {
  value: number | null;
}

export function CountdownOverlay({ value }: CountdownOverlayProps) {
  return (
    <AnimatePresence>
      {value !== null && (
        <motion.div
          key={value}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
        >
          <span className="text-9xl font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            {value}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
