import React, { useState } from "react";
import { Star, Thermometer, Ruler, ChevronLeft, Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const CollapsedIcon = ({ icon: Icon, label, value, active, onClick }) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "p-2 rounded-lg transition-all duration-300 ease-out cursor-pointer",
            "hover:bg-zinc-800/80 group",
            active && "bg-zinc-800/50"
          )}
          onClick={onClick}
        >
          <div className="flex flex-col items-center">
            <Icon
              className={cn(
                "w-5 h-5 transition-all duration-300",
                "text-zinc-400 group-hover:text-zinc-300",
                active && "text-zinc-300"
              )}
            />
            <span
              className={cn(
                "mt-1.5 text-[10px] font-medium transition-all duration-300",
                "text-zinc-500 group-hover:text-zinc-400",
                active && "text-zinc-400"
              )}
            >
              {value}
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="bg-zinc-900 border-zinc-800"
        sideOffset={20}
      >
        <p className="text-zinc-300">{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const ExpandedSection = ({ icon: Icon, label, children }) => (
  <div className="mb-8 last:mb-0 animate-in slide-in-from-left duration-500">
    <div className="flex items-center mb-4 group">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-900/80 transition-colors group-hover:bg-zinc-800">
        <Icon className="w-4 h-4 text-zinc-400 transition-colors group-hover:text-zinc-300" />
      </div>
      <span className="ml-3 text-sm font-medium text-zinc-400 transition-colors group-hover:text-zinc-300">
        {label}
      </span>
    </div>
    <div className="animate-in fade-in duration-700 delay-150">{children}</div>
  </div>
);

const getOrbitalSpeedDescription = (speed) => {
  if (speed === 0) return "Paused";
  if (speed <= 2) return "Fast Orbit, Slow Rotation";
  if (speed <= 5) return "Normal";
  if (speed <= 8) return "Slow Orbit, Fast Rotation";
  return "Very Slow Orbit, Very Fast Rotation";
};

const Sidebar = ({ filters, onFilterChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  const getTemperatureColor = (temp) => {
    if (temp < 3500) return "bg-red-500/10 text-red-500";
    if (temp < 10000) return "bg-yellow-500/10 text-yellow-500";
    return "bg-blue-500/10 text-blue-500";
  };

  const getMagnitudeDescription = (mag) => {
    if (mag < -5) return "Extremely Bright";
    if (mag < 0) return "Very Bright";
    if (mag < 5) return "Visible to Eye";
    return "Dim";
  };

  return (
    <div
      className={cn(
        "relative bg-zinc-950/90 border-r border-zinc-800/20 shadow-2xl backdrop-blur-sm",
        "transition-all duration-500 ease-in-out",
        isCollapsed ? "w-20" : "w-96"
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "absolute -right-3 top-6 p-1 h-6 w-6",
          "bg-zinc-900 border border-zinc-800 rounded-full shadow-xl",
          "hover:bg-zinc-800 hover:text-zinc-300 transition-all duration-300",
          "hover:scale-110 active:scale-95"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <ChevronLeft
          className={cn(
            "h-3 w-3 text-zinc-400 transition-all duration-500",
            isCollapsed && "rotate-180"
          )}
        />
      </Button>

      <div
        className={cn("p-6 transition-all duration-500", isCollapsed && "p-3")}
      >
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-zinc-200 mb-8 animate-in fade-in slide-in-from-left duration-500">
            Stellar Filters
          </h2>
        )}

        {isCollapsed ? (
          <div className="space-y-6 pt-8 animate-in slide-in-from-left duration-500">
            <CollapsedIcon
              icon={Star}
              label="Magnitude"
              value={`${filters.magnitude.toFixed(1)}m`}
              active={activeSection === "magnitude"}
              onClick={() => setActiveSection("magnitude")}
            />
            <CollapsedIcon
              icon={Thermometer}
              label="Temperature"
              value={`${(filters.minTemp / 1000).toFixed(1)}K`}
              active={activeSection === "temperature"}
              onClick={() => setActiveSection("temperature")}
            />
            <CollapsedIcon
              icon={Ruler}
              label="Distance"
              value={`${filters.maxDistance}pc`}
              active={activeSection === "distance"}
              onClick={() => setActiveSection("distance")}
            />
            <CollapsedIcon
              icon={Clock}
              label="Orbital Speed"
              value={`${
                filters.orbitalSpeed !== undefined ? filters.orbitalSpeed : 5
              }x`}
              active={activeSection === "orbitalSpeed"}
              onClick={() => setActiveSection("orbitalSpeed")}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <ExpandedSection icon={Star} label="Magnitude">
              <div className="space-y-4">
                <Select
                  value={filters.magnitudeType}
                  onValueChange={(value) =>
                    onFilterChange("magnitudeType", value)
                  }
                >
                  <SelectTrigger className="w-full bg-zinc-900/80 border-zinc-800/50 text-zinc-400 hover:bg-zinc-800 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="apparent" className="text-zinc-300">
                      Apparent
                    </SelectItem>
                    <SelectItem value="absolute" className="text-zinc-300">
                      Absolute
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <Slider
                    min={filters.magnitudeType === "absolute" ? -15 : -27}
                    max={15}
                    step={0.1}
                    value={[filters.magnitude]}
                    onValueChange={([value]) =>
                      onFilterChange("magnitude", value)
                    }
                    className="transition-all hover:opacity-100"
                  />
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="bg-zinc-900/80 text-zinc-400 border-zinc-800/50 transition-colors hover:border-zinc-700"
                    >
                      {filters.magnitude.toFixed(1)} mag
                    </Badge>
                    <span className="text-xs text-zinc-500">
                      {getMagnitudeDescription(filters.magnitude)}
                    </span>
                  </div>
                </div>
              </div>
            </ExpandedSection>

            <ExpandedSection icon={Thermometer} label="Temperature">
              <div className="space-y-2">
                <Slider
                  min={2000}
                  max={30000}
                  step={100}
                  value={[filters.minTemp]}
                  onValueChange={([value]) => onFilterChange("minTemp", value)}
                />
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`${getTemperatureColor(
                      filters.minTemp
                    )} border-0`}
                  >
                    {filters.minTemp.toLocaleString()}K
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/80 transition-transform hover:scale-110" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/80 transition-transform hover:scale-110" />
                    <div className="w-2 h-2 rounded-full bg-blue-500/80 transition-transform hover:scale-110" />
                  </div>
                </div>
              </div>
            </ExpandedSection>

            <ExpandedSection icon={Ruler} label="Distance">
              <div className="space-y-2">
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={[filters.maxDistance]}
                  onValueChange={([value]) =>
                    onFilterChange("maxDistance", value)
                  }
                />
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="bg-zinc-900/80 text-zinc-400 border-zinc-800/50 transition-colors hover:border-zinc-700"
                  >
                    {filters.maxDistance} pc
                  </Badge>
                  <span className="text-xs text-zinc-500">
                    {(filters.maxDistance * 3.26).toLocaleString()} ly
                  </span>
                </div>
              </div>
            </ExpandedSection>

            <ExpandedSection icon={Clock} label="Orbital Speed">
              <div className="space-y-2">
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[
                    filters.orbitalSpeed !== undefined
                      ? filters.orbitalSpeed
                      : 5,
                  ]}
                  onValueChange={([value]) =>
                    onFilterChange("orbitalSpeed", value)
                  }
                />
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="bg-zinc-900/80 text-zinc-400 border-zinc-800/50 transition-colors hover:border-zinc-700"
                  >
                    {filters.orbitalSpeed !== undefined
                      ? filters.orbitalSpeed
                      : 5}
                    x
                  </Badge>
                  <span className="text-xs text-zinc-500">
                    {getOrbitalSpeedDescription(
                      filters.orbitalSpeed !== undefined
                        ? filters.orbitalSpeed
                        : 5
                    )}
                  </span>
                </div>
              </div>
            </ExpandedSection>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
