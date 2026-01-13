import type { Unit } from "@/types";

interface UnitCardProps {
  unit: Unit;
  onSelect: (unit: Unit) => void;
}

export function UnitCard({ unit, onSelect }: UnitCardProps) {
  return (
    <button
      onClick={() => onSelect(unit)}
      className="w-full text-right p-4 bg-white rounded-lg border-2 border-gray-100 hover:border-primary hover:shadow-md transition-all"
    >
      <h3 className="font-rubik font-semibold text-lg text-foreground">
        {unit.name}
      </h3>
      <p className="text-sm text-gray-500 mt-1">
        לחץ לצפייה במבוא ובתוכן היחידה
      </p>
    </button>
  );
}
