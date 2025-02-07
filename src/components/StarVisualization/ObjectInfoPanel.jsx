import React from "react";
import {
  Sun,
  ThermometerSun,
  Circle,
  Scale,
  Orbit,
  Satellite,
  Ruler,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const formatNumber = (num) => {
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toFixed(1);
};

const InfoRow = ({ icon: Icon, label, value, className }) => (
  <div className="flex items-center space-x-3 text-sm">
    <div className="flex items-center space-x-2 min-w-[140px]">
      <Icon className="w-4 h-4 text-zinc-400" />
      <span className="text-zinc-400">{label}:</span>
    </div>
    <span className={cn("text-zinc-100 font-medium", className)}>{value}</span>
  </div>
);

const ObjectInfoPanel = ({ selectedObject }) => {
  if (!selectedObject) return null;

  const isStar = selectedObject.objectType === "sun";

  return (
    <Card className="fixed bottom-4 left-4 bg-zinc-950/90 border-zinc-800/20 backdrop-blur-sm shadow-2xl w-80 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-zinc-100">
              {selectedObject.name}
            </h3>
            <Badge
              variant="outline"
              className={cn(
                "mt-1 bg-zinc-900/50 border-zinc-800 text-xs",
                isStar ? "text-yellow-400" : "text-blue-400"
              )}
            >
              {isStar ? "Star" : "Planet"}
            </Badge>
          </div>
        </div>

        <Separator className="bg-zinc-800/50 my-3" />

        {/* Details */}
        <div className="space-y-2.5">
          {isStar ? (
            <>
              <InfoRow
                icon={Sun}
                label="Spectral Type"
                value={selectedObject.type}
              />
              <InfoRow
                icon={ThermometerSun}
                label="Temperature"
                value={`${formatNumber(selectedObject.temperature)}K`}
              />
              <InfoRow
                icon={Circle}
                label="Radius"
                value={`${formatNumber(selectedObject.radius)} km`}
              />
              <InfoRow
                icon={Scale}
                label="Mass"
                value={`${selectedObject.mass} solar masses`}
              />
            </>
          ) : (
            <>
              <InfoRow
                icon={Ruler}
                label="Distance"
                value={`${formatNumber(
                  selectedObject.distance / 1e6
                )} million km`}
              />
              <InfoRow
                icon={ThermometerSun}
                label="Temperature"
                value={`${selectedObject.temperature}K`}
              />
              <InfoRow
                icon={Circle}
                label="Radius"
                value={`${formatNumber(selectedObject.radius)} km`}
              />
              <InfoRow
                icon={Scale}
                label="Mass"
                value={`${selectedObject.mass} Earth masses`}
              />
              <InfoRow
                icon={Orbit}
                label="Orbital Period"
                value={`${selectedObject.orbitalPeriod} Earth days`}
              />
              <InfoRow
                icon={Satellite}
                label="Moons"
                value={selectedObject.moons}
              />
            </>
          )}
        </div>

        {/* Visual Indicator */}
        <div className="absolute -top-1 left-4 right-4 h-px bg-gradient-to-r from-transparent via-zinc-400/20 to-transparent" />
      </CardContent>
    </Card>
  );
};

export default ObjectInfoPanel;
