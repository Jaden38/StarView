import React, { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Mouse, Gamepad2, X, Plus, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
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
          className="bg-gray-800 border-gray-600 text-gray-300 px-2 py-0.5 min-w-[24px] text-center font-mono text-xs"
        >
          {key}
        </Badge>
      ))}
    </div>
    <span className="text-gray-400">{description}</span>
  </div>
);

const CameraControls = ({ isFreeCamera }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [sensitivity, setSensitivity] = useState(1.0); // Sensibilité par défaut

  useEffect(() => {
    if (!isFreeCamera) {
      setIsVisible(true);
    }
  }, [isFreeCamera]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "+") {
        setSensitivity((prev) => Math.min(prev + 0.1, 5.0));
      } else if (event.key === "-") {
        setSensitivity((prev) => Math.max(prev - 0.1, 0.1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!isFreeCamera) return null;

  const increaseSensitivity = () => {
    setSensitivity((prev) => Math.min(prev + 0.1, 5.0));
  };

  const decreaseSensitivity = () => {
    setSensitivity((prev) => Math.max(prev - 0.1, 0.1));
  };

  return (
    <div className="absolute left-0 right-0 top-0 flex justify-start pt-4">
      <Card
        className={cn(
          "bg-gray-900/90 border-gray-800/50 backdrop-blur-md shadow-xl ml-4 p-4 rounded-lg",
          isVisible && "animate-in fade-in slide-in-from-left-4 duration-300"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Gamepad2 className="w-4 h-4 text-gray-400 mr-2" />
            <h3 className="text-sm font-semibold text-gray-300">Camera Controls</h3>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-gray-400 hover:text-gray-300"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">MOVEMENT</h4>
            <ControlRow keys={['Z', 'Q', 'S', 'D']} description="Move forward, left, back, right" />
            <ControlRow keys={['⇧']} description="Hold to move faster" />
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">CAMERA</h4>
            <ControlRow keys={['↑', '↓']} description="Move up/down" />
            <ControlRow keys={['←', '→']} description="Rotate view" />
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-gray-800 border-gray-600 text-gray-300 px-2">
                  <Mouse className="w-3 h-3" />
                </Badge>
              </div>
              <span className="text-gray-400">Look around</span>
            </div>
          </div>

          {/* Sensitivity Controls */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">SENSITIVITY</h4>

              <span className="text-gray-300 text-sm font-mono px-4 py-1 bg-gray-700 rounded-md shadow-inner">
                {sensitivity.toFixed(1)}
              </span>

            <p className="text-gray-500 text-xs mt-2 text-center">
              Use <kbd className="bg-gray-700 px-1 rounded">+</kbd> and <kbd className="bg-gray-700 px-1 rounded">-</kbd> on keyboard to adjust
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CameraControls;
