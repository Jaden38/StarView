import React from "react";
import { Star, Ruler, Sun, Sparkles, Binary } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const InfoRow = ({ icon: Icon, label, value, className }) => (
  <div className="flex items-center space-x-3 text-sm">
    <div className="flex items-center space-x-2 min-w-[140px]">
      <Icon className="w-4 h-4 text-zinc-400" />
      <span className="text-zinc-400">{label}:</span>
    </div>
    <span className={cn("text-zinc-100 font-medium", className)}>{value}</span>
  </div>
);

const StarInfoPanel = ({ selectedStar }) => {
  if (!selectedStar) return null;

  return (
    <Card className="fixed bottom-4 left-4 bg-zinc-950/90 border-zinc-800/20 backdrop-blur-sm shadow-2xl w-80 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-zinc-100">
              {selectedStar.proper || `Star ${selectedStar.id}`}
            </h3>
            <div className="flex items-center mt-1 space-x-2">
              {selectedStar.con && (
                <Badge
                  variant="outline"
                  className="bg-zinc-900/50 text-zinc-400 border-zinc-800 text-xs"
                >
                  {selectedStar.con}
                </Badge>
              )}
              <Badge
                variant="outline"
                className="bg-zinc-900/50 text-zinc-400 border-zinc-800 text-xs"
              >
                ID: {selectedStar.id}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-800/50 my-3" />

        {/* Details */}
        <div className="space-y-2.5">
          <InfoRow
            icon={Ruler}
            label="Distance"
            value={`${selectedStar.dist.toFixed(2)} parsecs`}
          />
          <InfoRow
            icon={Star}
            label="Magnitude"
            value={selectedStar.mag.toFixed(2)}
          />
          <InfoRow
            icon={Binary}
            label="Spectral Type"
            value={selectedStar.spect || "Unknown"}
            className={!selectedStar.spect ? "text-zinc-500 italic" : ""}
          />
          {selectedStar.lum && (
            <InfoRow
              icon={Sun}
              label="Luminosity"
              value={`${selectedStar.lum.toFixed(2)} × Sun`}
            />
          )}
        </div>

        {/* Visual Indicator */}
        <div className="absolute -top-1 left-4 right-4 h-px bg-gradient-to-r from-transparent via-zinc-400/20 to-transparent" />
      </CardContent>
    </Card>
  );
};

export default StarInfoPanel;
