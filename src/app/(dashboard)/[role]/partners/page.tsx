// src/app/(dashboard)/[role]/partners/page.tsx
"use client";

import { useState } from "react";
import { Handshake, ExternalLink, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Image from "next/image";

export default function PartnersPage() {
  const [showVoiceImage, setShowVoiceImage] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-parent/10 rounded-xl">
          <Handshake size={24} className="text-role-parent" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            שותפים לדרך
          </h1>
          <p className="text-sm text-gray-500">
            הצטרפו אלינו לקהילת STEM
          </p>
        </div>
      </div>

      {/* Intro Section */}
      <Card variant="outlined" padding="lg">
        <p className="text-foreground leading-relaxed text-center">
          {/* Placeholder intro text - will be filled later */}
          ברוכים הבאים לעמוד השותפים שלנו. כאן תוכלו למצוא מידע על הזדמנויות שיתוף פעולה ודרכים להצטרף לקהילת STEM שלנו.
        </p>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {/* קול קורא Button */}
        <Button
          size="lg"
          variant="primary"
          leftIcon={Megaphone}
          onClick={() => setShowVoiceImage(true)}
          className="w-full sm:w-auto px-8 py-4 text-lg"
        >
          קול קורא
        </Button>

        {/* הירשמו כאן Link */}
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfqwOeiAmxmCpEZOICxXFXmT4OfcrBveed0fQ4FhmAfSLobTQ/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto"
        >
          <Button
            size="lg"
            variant="outline"
            rightIcon={ExternalLink}
            className="w-full px-8 py-4 text-lg"
          >
            הירשמו כאן
          </Button>
        </a>
      </div>

      {/* Voice Image Modal */}
      {showVoiceImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowVoiceImage(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setShowVoiceImage(false)}
              className="absolute -top-12 left-0 p-2 text-white hover:text-gray-300 transition-colors"
              aria-label="סגור"
            >
              <X size={32} />
            </button>

            {/* Image */}
            <div className="relative w-full h-auto">
              <Image
                src="/voice.png"
                alt="קול קורא"
                width={1200}
                height={1600}
                className="w-full h-auto object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
