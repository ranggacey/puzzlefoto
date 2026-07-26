import { Paintbrush, Eraser, Image as ImageIcon, RotateCcw } from "lucide-react";
import type { BackgroundConfig, BackgroundType } from "../types";
import { Button } from "@/components/ui/button";

interface BackgroundToolbarProps {
  config: BackgroundConfig;
  onChange: (config: BackgroundConfig) => void;
}

const PRESET_COLORS = ["#ffffff", "#000000", "#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"];
const PRESET_GRADIENTS = [
  { colorStart: "#ff9a9e", colorEnd: "#fecfef", angle: 90 },
  { colorStart: "#a18cd1", colorEnd: "#fbc2eb", angle: 45 },
  { colorStart: "#84fab0", colorEnd: "#8fd3f4", angle: 135 },
];

export function BackgroundToolbar({ config, onChange }: BackgroundToolbarProps) {
  const setType = (type: BackgroundType) => {
    onChange({ ...config, type });
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-t-3xl bg-card p-6 shadow-2xl">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button 
          variant={config.type === "original" ? "default" : "outline"}
          onClick={() => setType("original")}
          className="flex-shrink-0"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Original
        </Button>
        <Button 
          variant={config.type === "transparent" ? "default" : "outline"}
          onClick={() => setType("transparent")}
          className="flex-shrink-0"
        >
          <Eraser className="mr-2 h-4 w-4" />
          Transparent
        </Button>
        <Button 
          variant={config.type === "solid" ? "default" : "outline"}
          onClick={() => onChange({ type: "solid", color: PRESET_COLORS[0] })}
          className="flex-shrink-0"
        >
          <Paintbrush className="mr-2 h-4 w-4" />
          Solid Color
        </Button>
        <Button 
          variant={config.type === "gradient" ? "default" : "outline"}
          onClick={() => onChange({ type: "gradient", gradient: PRESET_GRADIENTS[0] })}
          className="flex-shrink-0"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Gradient
        </Button>
      </div>

      {config.type === "solid" && (
        <div className="flex gap-3 overflow-x-auto">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={`h-10 w-10 flex-shrink-0 rounded-full border-2 transition-all ${
                config.color === color ? "border-primary scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onChange({ type: "solid", color })}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      )}

      {config.type === "gradient" && (
        <div className="flex gap-3 overflow-x-auto">
          {PRESET_GRADIENTS.map((grad, i) => (
            <button
              key={i}
              className={`h-10 w-10 flex-shrink-0 rounded-full border-2 transition-all ${
                config.gradient === grad ? "border-primary scale-110" : "border-transparent"
              }`}
              style={{ background: `linear-gradient(${grad.angle}deg, ${grad.colorStart}, ${grad.colorEnd})` }}
              onClick={() => onChange({ type: "gradient", gradient: grad })}
              aria-label={`Select gradient ${i}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
