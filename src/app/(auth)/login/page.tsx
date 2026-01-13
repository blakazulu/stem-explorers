"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { User, Lock, LogIn, Atom, Lightbulb, Cog, Rocket, FlaskConical, Zap } from "lucide-react";

// Floating STEM icon component
function FloatingIcon({
  icon: IconComponent,
  className,
  style,
}: {
  icon: typeof Atom;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute text-white/10 animate-bounce ${className}`}
      style={{ animationDuration: "4s", ...style }}
    >
      <IconComponent size={48} strokeWidth={1.5} />
    </div>
  );
}

export default function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(name, password);

    if (result.success && result.role) {
      router.push(`/${result.role}`);
    } else {
      setError(result.error || "שגיאה בהתחברות");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-stretch">
      {/* Left side - Illustration (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-secondary relative overflow-hidden">
        {/* Floating STEM icons */}
        <FloatingIcon icon={Atom} style={{ top: "10%", left: "15%", animationDelay: "0s" }} />
        <FloatingIcon icon={Lightbulb} style={{ top: "25%", right: "20%", animationDelay: "0.5s" }} />
        <FloatingIcon icon={Cog} style={{ top: "50%", left: "10%", animationDelay: "1s" }} />
        <FloatingIcon icon={Rocket} style={{ top: "60%", right: "15%", animationDelay: "1.5s" }} />
        <FloatingIcon icon={FlaskConical} style={{ top: "80%", left: "25%", animationDelay: "2s" }} />
        <FloatingIcon icon={Zap} style={{ top: "15%", right: "35%", animationDelay: "2.5s" }} />

        {/* Decorative circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="text-center max-w-md">
            {/* Logo */}
            <div className="mb-6 animate-scale-in">
              <Image
                src="/icons/logo-full.png"
                alt="חוקרי STEM"
                width={200}
                height={200}
                className="w-48 h-48 object-contain mx-auto drop-shadow-2xl"
                priority
              />
            </div>

            <p className="text-xl text-white/80 mb-8 animate-slide-up stagger-1">
              מרחב למידה לבית ספר יסודי
            </p>

            {/* Features */}
            <div className="space-y-4 text-right animate-slide-up stagger-2">
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <p className="font-medium">למידה חקרנית</p>
                  <p className="text-sm text-white/70">יומן חוקר אינטראקטיבי לתלמידים</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FlaskConical size={20} />
                </div>
                <div>
                  <p className="font-medium">מודל פדגוגי</p>
                  <p className="text-sm text-white/70">תכנים מובנים לפי שכבות גיל</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="font-medium">דוחות AI</p>
                  <p className="text-sm text-white/70">ניתוח אוטומטי של התקדמות הלמידה</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center bg-background p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/icons/logo-full.png"
              alt="חוקרי STEM"
              width={150}
              height={150}
              className="w-32 h-32 object-contain mx-auto mb-2"
              priority
            />
            <p className="text-gray-500">מרחב למידה לבית ספר יסודי</p>
          </div>

          {/* Login card */}
          <div className="bg-surface-0 rounded-2xl shadow-xl p-6 md:p-8 border border-surface-2 animate-scale-in">
            <div className="hidden lg:block text-center mb-6">
              <h2 className="text-2xl font-rubik font-bold text-foreground mb-2">
                ברוכים הבאים
              </h2>
              <p className="text-gray-500">התחברו כדי להמשיך למרחב הלמידה</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Input
                  id="name"
                  label="שם מלא"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="הכנס את שמך המלא"
                  required
                  className="pr-10"
                />
                <User
                  size={18}
                  className="absolute right-3 top-9 text-gray-400"
                />
              </div>

              <div className="relative">
                <Input
                  id="password"
                  label="סיסמה"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הכנס סיסמה"
                  error={error}
                  required
                  className="pr-10"
                />
                <Lock
                  size={18}
                  className="absolute right-3 top-9 text-gray-400"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
                loadingText="מתחבר..."
                leftIcon={LogIn}
              >
                כניסה למערכת
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-surface-2 text-center">
              <p className="text-sm text-gray-400">
                שכחת את הסיסמה? פנה למנהל המערכת
              </p>
            </div>
          </div>

          {/* STEM icons decoration (mobile) */}
          <div className="lg:hidden flex items-center justify-center gap-4 mt-8 text-gray-300">
            <Icon name="flask" size="md" />
            <Icon name="lightbulb" size="md" />
            <Icon name="cog" size="md" />
            <Icon name="atom" size="md" />
            <Icon name="rocket" size="md" />
          </div>
        </div>
      </div>
    </div>
  );
}
