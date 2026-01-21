"use client";

import { Trash2, Plus, X } from "lucide-react";
import type { BridgeContent, BridgeMaterial } from "@/types/games";

interface BridgeContentEditorProps {
  content: BridgeContent;
  onEdit: (updates: Partial<BridgeContent>) => void;
  onDelete: () => void;
  isNew: boolean;
}

// Available material types
const MATERIAL_TYPES = [
  { type: "wood", nameHe: "עץ" },
  { type: "steel", nameHe: "פלדה" },
  { type: "rope", nameHe: "חבל" },
  { type: "concrete", nameHe: "בטון" },
  { type: "bamboo", nameHe: "במבוק" },
  { type: "plastic", nameHe: "פלסטיק" },
  { type: "stone", nameHe: "אבן" },
  { type: "carbon", nameHe: "סיב פחמן" },
];

export function BridgeContentEditor({
  content,
  onEdit,
  onDelete,
  isNew,
}: BridgeContentEditorProps) {
  // Handle gap width change
  const handleGapWidthChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      onEdit({ gapWidth: num });
    }
  };

  // Handle budget change
  const handleBudgetChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      onEdit({ budget: num });
    }
  };

  // Handle vehicle weight change
  const handleVehicleWeightChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      onEdit({ vehicleWeight: num });
    }
  };

  // Handle material type change
  const handleMaterialTypeChange = (index: number, value: string) => {
    const newMaterials = [...(content.materials || [])];
    newMaterials[index] = { ...newMaterials[index], type: value };
    onEdit({ materials: newMaterials });
  };

  // Handle material cost change
  const handleMaterialCostChange = (index: number, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      const newMaterials = [...(content.materials || [])];
      newMaterials[index] = { ...newMaterials[index], cost: num };
      onEdit({ materials: newMaterials });
    }
  };

  // Handle material strength change
  const handleMaterialStrengthChange = (index: number, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      const newMaterials = [...(content.materials || [])];
      newMaterials[index] = { ...newMaterials[index], strength: num };
      onEdit({ materials: newMaterials });
    }
  };

  // Handle adding a new material
  const handleAddMaterial = () => {
    const currentMaterials = content.materials || [];
    // Find a material type not yet used
    const usedTypes = currentMaterials.map((m) => m.type);
    const availableType = MATERIAL_TYPES.find((t) => !usedTypes.includes(t.type));

    if (!availableType && currentMaterials.length >= MATERIAL_TYPES.length) {
      return; // All material types already in use
    }

    const newMaterial: BridgeMaterial = {
      type: availableType?.type || "wood",
      cost: 20,
      strength: 50,
    };
    onEdit({ materials: [...currentMaterials, newMaterial] });
  };

  // Handle removing a material
  const handleRemoveMaterial = (index: number) => {
    const currentMaterials = content.materials || [];
    if (currentMaterials.length <= 1) return; // Keep at least one material
    const newMaterials = currentMaterials.filter((_, i) => i !== index);
    onEdit({ materials: newMaterials });
  };

  return (
    <div
      className={`
        p-4 rounded-xl border-2
        ${isNew ? "border-orange-300 bg-orange-50/30" : "border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          {/* Basic settings row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Gap width */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                רוחב פער (מטר):
              </label>
              <input
                type="number"
                value={content.gapWidth || ""}
                onChange={(e) => handleGapWidthChange(e.target.value)}
                min="20"
                max="150"
                placeholder="40"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                dir="ltr"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                תקציב:
              </label>
              <input
                type="number"
                value={content.budget || ""}
                onChange={(e) => handleBudgetChange(e.target.value)}
                min="50"
                max="1000"
                placeholder="200"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                dir="ltr"
              />
            </div>

            {/* Vehicle weight */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                משקל רכב (ק&quot;ג):
              </label>
              <input
                type="number"
                value={content.vehicleWeight || ""}
                onChange={(e) => handleVehicleWeightChange(e.target.value)}
                min="10"
                max="500"
                placeholder="50"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                dir="ltr"
              />
            </div>
          </div>

          {/* Materials section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              חומרים זמינים ({(content.materials || []).length}):
            </label>
            <div className="space-y-2">
              {(content.materials || []).map((material, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  {/* Material type */}
                  <select
                    value={material.type}
                    onChange={(e) => handleMaterialTypeChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    dir="rtl"
                  >
                    {MATERIAL_TYPES.map((mt) => (
                      <option key={mt.type} value={mt.type}>
                        {mt.nameHe}
                      </option>
                    ))}
                  </select>

                  {/* Cost */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">מחיר:</span>
                    <input
                      type="number"
                      value={material.cost}
                      onChange={(e) => handleMaterialCostChange(index, e.target.value)}
                      min="1"
                      max="500"
                      className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      dir="ltr"
                    />
                  </div>

                  {/* Strength */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">חוזק:</span>
                    <input
                      type="number"
                      value={material.strength}
                      onChange={(e) => handleMaterialStrengthChange(index, e.target.value)}
                      min="1"
                      max="500"
                      className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      dir="ltr"
                    />
                  </div>

                  {/* Remove button */}
                  {(content.materials || []).length > 1 && (
                    <button
                      onClick={() => handleRemoveMaterial(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      title="הסר חומר"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}

              {/* Add material button */}
              {(content.materials || []).length < MATERIAL_TYPES.length && (
                <button
                  onClick={handleAddMaterial}
                  className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/50 transition-all duration-150 flex items-center justify-center gap-1"
                >
                  <Plus size={14} />
                  הוסף חומר
                </button>
              )}
            </div>
          </div>

          {/* Validation hints */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>* וודא שלפחות חומר אחד חזק מספיק לשאת את משקל הרכב</p>
            <p>* התקציב צריך לאפשר בניית גשר שלם (רוחב/20 קטעים לפחות)</p>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="מחק אתגר"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {isNew && (
        <div className="mt-3 text-xs text-orange-600 font-medium">
          אתגר חדש - יישמר כשתלחץ על &quot;שמור שינויים&quot;
        </div>
      )}
    </div>
  );
}
