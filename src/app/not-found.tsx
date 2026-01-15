import Link from "next/link";
import Image from "next/image";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/bg/bg-home.webp"
          alt=""
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-amber-900/[0.08]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 text-center">
        {/* Logo */}
        <div className="mb-6 animate-scale-in">
          <Image
            src="/logo/logo-full.png"
            alt="חוקרי STEM"
            width={180}
            height={180}
            className="w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-xl"
            priority
          />
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 max-w-md animate-slide-up">
          {/* 404 Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-amber-100 rounded-full">
              <Search className="w-12 h-12 text-amber-600" />
            </div>
          </div>

          {/* Text */}
          <h1 className="text-6xl md:text-7xl font-rubik font-bold text-primary mb-4">
            404
          </h1>
          <h2 className="text-xl md:text-2xl font-rubik font-semibold text-gray-800 mb-2">
            אופס! הדף לא נמצא
          </h2>
          <p className="text-gray-600 mb-8">
            נראה שהדף שחיפשת לא קיים או שהועבר למקום אחר.
            <br />
            אל דאגה, אפשר לחזור לדף הבית ולהתחיל מחדש!
          </p>

          {/* Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Home size={20} />
            חזרה לדף הבית
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-gray-600">
          חוקרי STEM • מרחב למידה לבית ספר יסודי
        </p>
      </div>
    </div>
  );
}
