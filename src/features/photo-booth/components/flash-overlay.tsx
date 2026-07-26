import { motion, AnimatePresence } from "motion/react";

interface FlashOverlayProps {
  isActive: boolean;
}

export function FlashOverlay({ isActive }: FlashOverlayProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 z-40 bg-white"
        />
      )}
    </AnimatePresence>
  );
}
