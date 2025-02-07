import React from "react";
import {
  Camera,
  EyeIcon,
  Globe2,
  Maximize2,
  Search,
  Sparkles,
  ThermometerSun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ToolbarButton = ({ icon: Icon, label, active, onClick }) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    className={cn(
      "h-8 px-2.5 transition-all duration-200",
      "hover:bg-zinc-800/50",
      active ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"
    )}
  >
    <Icon className="w-4 h-4 mr-1.5" />
    <span className="text-xs font-medium">{label}</span>
  </Button>
);

const Toolbar = ({
  onModeChange,
  activeModes,
  onSearch,
  onCameraToggle,
  isFreeCamera,
}) => {
  const isActive = (mode) => activeModes.includes(mode);

  return (
    <div className="bg-zinc-950/90 border-b border-zinc-800/20 h-12 flex items-center justify-between px-3">
      <div className="flex items-center gap-1.5">
        {/* Camera Control */}
        <ToolbarButton
          icon={Camera}
          label={isFreeCamera ? "Center" : "Free Cam"}
          active={isFreeCamera}
          onClick={onCameraToggle}
        />

        <div className="h-4 w-px bg-zinc-800 mx-1" />

        {/* View Modes */}
        <ToolbarButton
          icon={EyeIcon}
          label="Closest"
          active={isActive("closest")}
          onClick={() => onModeChange("closest")}
        />
        <ToolbarButton
          icon={Sparkles}
          label="Brightest"
          active={isActive("brightest")}
          onClick={() => onModeChange("brightest")}
        />
        <ToolbarButton
          icon={ThermometerSun}
          label="Hottest"
          active={isActive("hottest")}
          onClick={() => onModeChange("hottest")}
        />
        <ToolbarButton
          icon={Maximize2}
          label="Largest"
          active={isActive("largest")}
          onClick={() => onModeChange("largest")}
        />

        <div className="h-4 w-px bg-zinc-800 mx-1" />

        {/* Special Views */}
        <ToolbarButton
          icon={Sparkles}
          label="Constellations"
          active={isActive("constellations")}
          onClick={() => onModeChange("constellations")}
        />
        <ToolbarButton
          icon={Globe2}
          label="Solar"
          active={isActive("solarSystem")}
          onClick={() => onModeChange("solarSystem")}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
          <Search className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <input
          type="text"
          placeholder="Search stars or constellations..."
          className={cn(
            "h-7 w-56 pl-7 pr-3 rounded-md text-xs",
            "bg-zinc-900/90 border border-zinc-800",
            "text-zinc-100 placeholder:text-zinc-500",
            "focus:outline-none focus:ring-1 focus:ring-zinc-700",
            "transition-colors duration-200"
          )}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Toolbar;
