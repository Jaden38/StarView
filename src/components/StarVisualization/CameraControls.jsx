import React, { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight, Mouse, Gamepad2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ControlRow = ({ keys, description }) => (
  <div className="flex items-center space-x-3 text-sm mb-2 last:mb-0">
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <Badge
          key={index}
          variant="outline"
          className="bg-zinc-900 border-zinc-700 text-zinc-300 px-2 py-0.5 min-w-[24px] text-center font-mono text-xs"
        >
          {key}
        </Badge>
      ))}
    </div>
    <span className="text-zinc-400">{description}</span>
  </div>
);

const CameraControls = ({ isFreeCamera }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isFreeCamera) {
      setIsVisible(true);
    }
  }, [isFreeCamera]);

  if (!isFreeCamera) return null;

  const content = (
    <div className="flex items-stretch">
      {!isVisible ? (
        <Button
          size="sm"
          variant="ghost"
          className="text-zinc-400 hover:text-zinc-300"
          onClick={() => setIsVisible(true)}
        >
          <Gamepad2 className="w-4 h-4 mr-2" />
          Show Controls
        </Button>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Gamepad2 className="w-4 h-4 text-zinc-400 mr-2" />
              <h3 className="text-sm font-medium text-zinc-300">Camera Controls</h3>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-zinc-400 hover:text-zinc-300"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-zinc-500 mb-2">MOVEMENT</h4>
              <ControlRow
                keys={['Z', 'Q', 'S', 'D']}
                description="Move forward, left, back, right"
              />
              <ControlRow
                keys={['⇧']}
                description="Hold to move faster"
              />
            </div>

            <div>
              <h4 className="text-xs font-medium text-zinc-500 mb-2">CAMERA</h4>
              <ControlRow
                keys={['↑', '↓']}
                description="Move up/down"
              />
              <ControlRow
                keys={['←', '→']}
                description="Rotate view"
              />
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className="bg-zinc-900 border-zinc-700 text-zinc-300 px-2"
                  >
                    <Mouse className="w-3 h-3" />
                  </Badge>
                </div>
                <span className="text-zinc-400">Look around</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="absolute left-0 right-0 top-0 flex justify-start pt-4">
      <Card 
        className={cn(
          "bg-zinc-950/90 border-zinc-800/20 backdrop-blur-sm shadow-2xl ml-4",
          isVisible && "animate-in fade-in slide-in-from-left-4 duration-300"
        )}
      >
        {content}
      </Card>
    </div>
  );
};

export default CameraControls;