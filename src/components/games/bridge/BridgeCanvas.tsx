"use client";

import { useState, useMemo, useCallback } from "react";
import { Trash2, Car, AlertTriangle } from "lucide-react";
import type { BridgeMaterial } from "@/types/games";

// Bridge segment placed by player
export interface BridgeSegment {
  id: string;
  position: number; // 0-based position in the bridge
  material: BridgeMaterial;
}

interface BridgeCanvasProps {
  gapWidth: number;
  segments: BridgeSegment[];
  selectedMaterial: BridgeMaterial | null;
  vehicleWeight: number;
  isTestMode: boolean;
  testProgress: number; // 0-100 for vehicle crossing animation
  testResult: "success" | "failure" | null;
  failurePoint: number | null; // Position where bridge collapsed
  onAddSegment: (position: number) => void;
  onRemoveSegment: (segmentId: string) => void;
  disabled?: boolean;
}

// Material colors for visual display
const materialColors: Record<string, { fill: string; stroke: string }> = {
  wood: { fill: "#D97706", stroke: "#92400E" },
  steel: { fill: "#64748B", stroke: "#334155" },
  rope: { fill: "#CA8A04", stroke: "#854D0E" },
  concrete: { fill: "#6B7280", stroke: "#374151" },
  bamboo: { fill: "#65A30D", stroke: "#3F6212" },
  plastic: { fill: "#3B82F6", stroke: "#1D4ED8" },
  stone: { fill: "#78716C", stroke: "#44403C" },
  carbon: { fill: "#3F3F46", stroke: "#18181B" },
};

// Hebrew names for materials
const materialNames: Record<string, string> = {
  wood: "עץ",
  steel: "פלדה",
  rope: "חבל",
  concrete: "בטון",
  bamboo: "במבוק",
  plastic: "פלסטיק",
  stone: "אבן",
  carbon: "סיב פחמן",
};

/**
 * Visual canvas for building and testing the bridge.
 */
export function BridgeCanvas({
  gapWidth,
  segments,
  selectedMaterial,
  vehicleWeight,
  isTestMode,
  testProgress,
  testResult,
  failurePoint,
  onAddSegment,
  onRemoveSegment,
  disabled = false,
}: BridgeCanvasProps) {
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Calculate number of positions based on gap width
  const numPositions = useMemo(() => {
    // Each segment covers a portion of the gap
    return Math.max(3, Math.ceil(gapWidth / 20));
  }, [gapWidth]);

  // Get segment at a position
  const getSegmentAt = useCallback((position: number): BridgeSegment | null => {
    return segments.find((s) => s.position === position) || null;
  }, [segments]);

  // Check if bridge is complete (all positions filled)
  const isBridgeComplete = useMemo(() => {
    for (let i = 0; i < numPositions; i++) {
      if (!getSegmentAt(i)) return false;
    }
    return true;
  }, [numPositions, getSegmentAt]);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 300;
  const groundY = 240;
  const gapStartX = 100;
  const gapEndX = 500;
  const segmentWidth = (gapEndX - gapStartX) / numPositions;

  // Vehicle position during test
  const vehicleX = useMemo(() => {
    if (!isTestMode) return gapStartX - 60;
    const travelDistance = gapEndX - gapStartX + 100;
    return gapStartX - 60 + (testProgress / 100) * travelDistance;
  }, [isTestMode, testProgress, gapStartX, gapEndX]);

  // Render position slots
  const renderSlots = () => {
    const slots = [];

    for (let i = 0; i < numPositions; i++) {
      const segment = getSegmentAt(i);
      const x = gapStartX + i * segmentWidth;
      const isHovered = hoveredPosition === i;
      const isCollapsed = failurePoint !== null && i >= failurePoint;

      if (segment) {
        // Filled slot
        const colors = materialColors[segment.material.type] || materialColors.wood;
        const isSegmentHovered = hoveredSegment === segment.id;

        slots.push(
          <g key={`segment-${i}`}>
            <rect
              x={x}
              y={isCollapsed ? groundY + 20 : groundY - 20}
              width={segmentWidth - 2}
              height={20}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={2}
              rx={2}
              className={`transition-all duration-300 ${isCollapsed ? "opacity-50" : ""}`}
              style={{
                transform: isCollapsed ? "rotate(15deg)" : "none",
                transformOrigin: `${x + segmentWidth / 2}px ${groundY}px`,
              }}
            />
            {!isTestMode && !disabled && (
              <g
                className="cursor-pointer"
                onMouseEnter={() => setHoveredSegment(segment.id)}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => onRemoveSegment(segment.id)}
              >
                <rect
                  x={x}
                  y={groundY - 20}
                  width={segmentWidth - 2}
                  height={20}
                  fill="transparent"
                />
                {isSegmentHovered && (
                  <>
                    <rect
                      x={x}
                      y={groundY - 20}
                      width={segmentWidth - 2}
                      height={20}
                      fill="rgba(239, 68, 68, 0.3)"
                      rx={2}
                    />
                    <g transform={`translate(${x + segmentWidth / 2 - 8}, ${groundY - 18})`}>
                      <circle cx={8} cy={8} r={10} fill="rgba(239, 68, 68, 0.8)" />
                      <Trash2 x={2} y={2} size={12} color="white" />
                    </g>
                  </>
                )}
              </g>
            )}
          </g>
        );
      } else if (!isTestMode) {
        // Empty slot
        slots.push(
          <g key={`slot-${i}`}>
            <rect
              x={x}
              y={groundY - 20}
              width={segmentWidth - 2}
              height={20}
              fill={isHovered && selectedMaterial ? "rgba(251, 146, 60, 0.4)" : "rgba(209, 213, 219, 0.5)"}
              stroke={isHovered && selectedMaterial ? "#F97316" : "#9CA3AF"}
              strokeWidth={2}
              strokeDasharray={isHovered && selectedMaterial ? "0" : "4 4"}
              rx={2}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredPosition(i)}
              onMouseLeave={() => setHoveredPosition(null)}
              onClick={() => selectedMaterial && !disabled && onAddSegment(i)}
            />
            {isHovered && selectedMaterial && (
              <text
                x={x + segmentWidth / 2}
                y={groundY - 5}
                textAnchor="middle"
                fill="#F97316"
                fontSize="10"
                fontWeight="bold"
              >
                +
              </text>
            )}
          </g>
        );
      }
    }

    return slots;
  };

  return (
    <div className="bg-gradient-to-b from-sky-100 to-sky-200 rounded-xl p-4 shadow-lg border-2 border-orange-200 overflow-hidden">
      {/* Header info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-white/80 rounded-lg text-sm">
            <span className="text-gray-600">רוחב: </span>
            <span className="font-bold text-orange-600">{gapWidth}m</span>
          </div>
          <div className="px-3 py-1 bg-white/80 rounded-lg text-sm">
            <span className="text-gray-600">משקל רכב: </span>
            <span className="font-bold text-orange-600">{vehicleWeight}kg</span>
          </div>
        </div>
        {!isBridgeComplete && !isTestMode && (
          <div className="flex items-center gap-1 text-amber-600 text-sm">
            <AlertTriangle size={16} />
            <span>השלם את הגשר</span>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto"
        style={{ minHeight: "200px" }}
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#skyGradient)" />

        {/* Left cliff */}
        <path
          d={`M 0 ${groundY} L ${gapStartX} ${groundY} L ${gapStartX} ${svgHeight} L 0 ${svgHeight} Z`}
          fill="#8B4513"
          stroke="#5D3A1A"
          strokeWidth={2}
        />
        <rect x="0" y={groundY - 10} width={gapStartX} height="15" fill="#228B22" />

        {/* Right cliff */}
        <path
          d={`M ${gapEndX} ${groundY} L ${svgWidth} ${groundY} L ${svgWidth} ${svgHeight} L ${gapEndX} ${svgHeight} Z`}
          fill="#8B4513"
          stroke="#5D3A1A"
          strokeWidth={2}
        />
        <rect x={gapEndX} y={groundY - 10} width={svgWidth - gapEndX} height="15" fill="#228B22" />

        {/* Water */}
        <rect
          x={gapStartX}
          y={groundY + 30}
          width={gapEndX - gapStartX}
          height={svgHeight - groundY - 30}
          fill="url(#waterGradient)"
        />
        {/* Water waves */}
        <path
          d={`M ${gapStartX} ${groundY + 50} Q ${gapStartX + 50} ${groundY + 40} ${gapStartX + 100} ${groundY + 50} T ${gapStartX + 200} ${groundY + 50} T ${gapStartX + 300} ${groundY + 50} T ${gapEndX} ${groundY + 50}`}
          fill="none"
          stroke="#7DD3FC"
          strokeWidth={2}
          opacity={0.6}
        />

        {/* Bridge segments */}
        {renderSlots()}

        {/* Vehicle */}
        <g
          transform={`translate(${vehicleX}, ${
            testResult === "failure" && failurePoint !== null
              ? groundY + 40
              : groundY - 45
          })`}
          className="transition-all duration-100"
        >
          {/* Car body */}
          <rect x="0" y="15" width="50" height="20" rx="3" fill="#EF4444" stroke="#B91C1C" strokeWidth={2} />
          <rect x="5" y="5" width="30" height="15" rx="2" fill="#60A5FA" stroke="#1E40AF" strokeWidth={1} />
          {/* Wheels */}
          <circle cx="12" cy="35" r="6" fill="#374151" stroke="#1F2937" strokeWidth={2} />
          <circle cx="38" cy="35" r="6" fill="#374151" stroke="#1F2937" strokeWidth={2} />
        </g>

        {/* Failure indicator */}
        {testResult === "failure" && failurePoint !== null && (
          <g>
            <text
              x={gapStartX + failurePoint * segmentWidth + segmentWidth / 2}
              y={groundY - 40}
              textAnchor="middle"
              fill="#DC2626"
              fontSize="14"
              fontWeight="bold"
            >
              קריסה!
            </text>
            {/* Crack lines */}
            <path
              d={`M ${gapStartX + failurePoint * segmentWidth + segmentWidth / 2} ${groundY - 20}
                  L ${gapStartX + failurePoint * segmentWidth + segmentWidth / 2 - 10} ${groundY - 10}
                  L ${gapStartX + failurePoint * segmentWidth + segmentWidth / 2 + 5} ${groundY - 5}
                  L ${gapStartX + failurePoint * segmentWidth + segmentWidth / 2 - 5} ${groundY + 10}`}
              stroke="#DC2626"
              strokeWidth={3}
              fill="none"
            />
          </g>
        )}

        {/* Success indicator */}
        {testResult === "success" && (
          <text
            x={svgWidth / 2}
            y={50}
            textAnchor="middle"
            fill="#16A34A"
            fontSize="24"
            fontWeight="bold"
            className="animate-pulse"
          >
            הגשר עמד בניסיון!
          </text>
        )}
      </svg>

      {/* Legend */}
      {segments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {Array.from(new Set(segments.map((s) => s.material.type))).map((type) => {
            const colors = materialColors[type] || materialColors.wood;
            return (
              <div key={type} className="flex items-center gap-1 text-xs bg-white/60 px-2 py-1 rounded">
                <div
                  className="w-4 h-3 rounded"
                  style={{ backgroundColor: colors.fill, border: `1px solid ${colors.stroke}` }}
                />
                <span>{materialNames[type] || type}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
