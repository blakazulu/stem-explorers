"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { UnitTree } from "@/components/pedagogical/UnitTree";
import { Card } from "@/components/ui/Card";
import {
  Lightbulb,
  ArrowRight,
  BookOpen,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { Grade, Unit } from "@/types";

export default function PedagogicalPage() {
  const { session } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(
    session?.user.grade || null
  );
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const isTeacherOrAdmin = session?.user.role === "teacher" || session?.user.role === "admin";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-accent/10 rounded-xl">
          <Lightbulb size={24} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            מודל פדגוגי
          </h1>
          <p className="text-sm text-gray-500">
            צפייה בתכני היחידות ומבואות
          </p>
        </div>
      </div>

      {/* Grade Selector for Teachers/Admins */}
      {isTeacherOrAdmin && (
        <Card>
          <GradeSelector selected={selectedGrade} onSelect={setSelectedGrade} />
        </Card>
      )}

      {/* Unit Selection */}
      {selectedGrade && !selectedUnit && (
        <div className="space-y-4">
          <h2 className="text-lg font-rubik font-semibold text-foreground">
            יחידות לימוד - כיתה {selectedGrade}
          </h2>
          <UnitTree grade={selectedGrade} onSelectUnit={setSelectedUnit} />
        </div>
      )}

      {/* Selected Unit View */}
      {selectedUnit && (
        <div className="space-y-4 animate-slide-up">
          {/* Unit Header */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen size={20} className="text-primary" />
                </div>
                <h2 className="text-lg md:text-xl font-rubik font-bold text-foreground">
                  {selectedUnit.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-foreground cursor-pointer transition-colors"
              >
                <ArrowRight size={18} />
                <span className="text-sm">חזור לרשימה</span>
              </button>
            </div>
          </Card>

          {/* Unit Files */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedUnit.introFileUrl && (
              <a
                href={selectedUnit.introFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card interactive className="h-full">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary/10 rounded-xl">
                      <BookOpen size={24} className="text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-rubik font-semibold text-foreground">מבוא ליחידה</h3>
                      <p className="text-sm text-gray-500">רקע והקדמה לנושא</p>
                    </div>
                    <ExternalLink size={18} className="text-gray-400" />
                  </div>
                </Card>
              </a>
            )}
            {selectedUnit.unitFileUrl && (
              <a
                href={selectedUnit.unitFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card interactive className="h-full">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <FileText size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-rubik font-semibold text-foreground">תוכן היחידה</h3>
                      <p className="text-sm text-gray-500">חומר הלימוד המלא</p>
                    </div>
                    <ExternalLink size={18} className="text-gray-400" />
                  </div>
                </Card>
              </a>
            )}
          </div>

          {/* No files available */}
          {!selectedUnit.introFileUrl && !selectedUnit.unitFileUrl && (
            <Card variant="outlined" className="bg-surface-1/50 text-center py-8">
              <div className="p-3 bg-gray-100 rounded-xl w-fit mx-auto mb-3">
                <FileText size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">אין קבצים זמינים ליחידה זו</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
