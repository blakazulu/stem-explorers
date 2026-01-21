"use client";

import { Package, Shield, Coins } from "lucide-react";
import type { BridgeMaterial } from "@/types/games";

interface MaterialPaletteProps {
  materials: BridgeMaterial[];
  selectedMaterial: BridgeMaterial | null;
  onSelectMaterial: (material: BridgeMaterial) => void;
  disabled?: boolean;
}

// Material type to icon/color mapping
const materialStyles: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  wood: { color: "text-amber-700", bgColor: "bg-amber-100", borderColor: "border-amber-400" },
  steel: { color: "text-slate-600", bgColor: "bg-slate-100", borderColor: "border-slate-400" },
  rope: { color: "text-yellow-700", bgColor: "bg-yellow-100", borderColor: "border-yellow-400" },
  concrete: { color: "text-gray-600", bgColor: "bg-gray-200", borderColor: "border-gray-400" },
  bamboo: { color: "text-lime-700", bgColor: "bg-lime-100", borderColor: "border-lime-400" },
  plastic: { color: "text-blue-600", bgColor: "bg-blue-100", borderColor: "border-blue-400" },
  stone: { color: "text-stone-600", bgColor: "bg-stone-200", borderColor: "border-stone-400" },
  carbon: { color: "text-zinc-700", bgColor: "bg-zinc-200", borderColor: "border-zinc-400" },
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
 * Palette of available materials for building the bridge.
 */
export function MaterialPalette({
  materials,
  selectedMaterial,
  onSelectMaterial,
  disabled = false,
}: MaterialPaletteProps) {
  if (!materials || materials.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border-2 border-orange-200">
      <div className="flex items-center gap-2 mb-3">
        <Package className="text-orange-500" size={20} />
        <span className="font-rubik font-bold text-gray-700">חומרים זמינים</span>
      </div>

      <div className="space-y-2">
        {materials.map((material) => {
          const style = materialStyles[material.type] || materialStyles.wood;
          const isSelected = selectedMaterial?.type === material.type;

          return (
            <button
              key={material.type}
              onClick={() => !disabled && onSelectMaterial(material)}
              disabled={disabled}
              className={`
                w-full p-3 rounded-lg border-2 transition-all duration-200
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"}
                ${isSelected
                  ? `${style.bgColor} ${style.borderColor} ring-2 ring-offset-1 ring-orange-400`
                  : `bg-gray-50 border-gray-200 hover:${style.bgColor} hover:${style.borderColor}`
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md ${style.bgColor} border ${style.borderColor}`} />
                  <span className={`font-medium ${isSelected ? style.color : "text-gray-700"}`}>
                    {materialNames[material.type] || material.type}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-emerald-600" title="חוזק">
                    <Shield size={14} />
                    <span className="text-xs font-bold">{material.strength}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600" title="מחיר">
                    <Coins size={14} />
                    <span className="text-xs font-bold">{material.cost}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedMaterial && (
        <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200 text-center">
          <span className="text-sm text-orange-700">
            לחץ על הגשר כדי להוסיף קטע מ{materialNames[selectedMaterial.type] || selectedMaterial.type}
          </span>
        </div>
      )}
    </div>
  );
}
