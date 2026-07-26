import { CaptureModeConfig } from "@/types";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeCardProps {
  config: CaptureModeConfig;
  isSelected: boolean;
  onSelect: () => void;
}

export function ModeCard({ config, isSelected, onSelect }: ModeCardProps) {
  
  // Renders a visual mockup based on the previewLayout
  const renderMockup = () => {
    switch (config.previewLayout) {
      case "single":
        return (
          <div className="relative h-full w-full overflow-hidden rounded-md bg-muted/50 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          </div>
        );
      case "grid":
        return (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-full w-full rounded bg-muted/50 shadow-inner">
                <div className="h-full w-full bg-gradient-to-br from-primary/5 to-transparent" />
              </div>
            ))}
          </div>
        );
      case "filmStrip":
        return (
          <div className="flex h-full w-24 flex-col gap-1.5 rounded-sm bg-white p-1.5 shadow-sm">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex-1 rounded-sm bg-muted/50 shadow-inner">
                 <div className="h-full w-full bg-gradient-to-br from-primary/5 to-transparent" />
              </div>
            ))}
            <div className="h-2 w-full" />
          </div>
        );
    }
  };

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-3xl border-2 bg-card text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-sm",
        isSelected 
          ? "border-primary shadow-[0_8px_32px_rgba(var(--primary),0.2)]"
          : "border-border hover:border-primary/50 hover:shadow-xl"
      )}
    >
      {/* Mockup Section */}
      <div className="flex h-48 w-full items-center justify-center bg-secondary/30 p-6">
        <div className={cn(
          "flex items-center justify-center transition-transform duration-500 group-hover:scale-105",
          config.previewLayout === "single" ? "aspect-[4/3] w-full max-w-[200px]" : "",
          config.previewLayout === "grid" ? "aspect-square h-full" : "",
          config.previewLayout === "filmStrip" ? "h-full" : ""
        )}>
          {renderMockup()}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {config.title}
          </h3>
          {isSelected && (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Check className="h-4 w-4" />
            </motion.div>
          )}
        </div>
        
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {config.description}
        </p>

        <span className="inline-flex self-start rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {config.requiredPhotos} {config.requiredPhotos === 1 ? "Photo" : "Photos"}
        </span>
      </div>

      {/* Decorative gradient overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          isSelected ? "bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-100" : ""
        )}
      />
    </motion.button>
  );
}
