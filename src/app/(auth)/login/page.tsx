"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Lock, LogIn, Eye, EyeOff, ArrowRight } from "lucide-react";

type LoginType = "student" | "parent" | "staff";

// Shared login form component
function LoginForm({
  variant,
  onSubmit,
  name,
  setName,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  loading,
}: {
  variant: LoginType;
  onSubmit: (e: React.FormEvent) => void;
  name: string;
  setName: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  error: string;
  loading: boolean;
}) {
  const variantStyles = {
    student: {
      title: "שלום חוקר!",
      subtitle: "הכנס את הפרטים שלך כדי להתחיל לחקור",
      buttonClass: "bg-emerald-500 hover:bg-emerald-600",
      focusRing: "focus:ring-emerald-500",
    },
    parent: {
      title: "שלום להורים!",
      subtitle: "התחברו כדי לעקוב אחר ההתקדמות",
      buttonClass: "bg-amber-500 hover:bg-amber-600",
      focusRing: "focus:ring-amber-500",
    },
    staff: {
      title: "שלום לצוות!",
      subtitle: "התחברו למרחב הניהול והמעקב",
      buttonClass: "bg-blue-500 hover:bg-blue-600",
      focusRing: "focus:ring-blue-500",
    },
  };

  const styles = variantStyles[variant];

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-rubik font-bold text-foreground mb-2">
          {styles.title}
        </h2>
        <p className="text-gray-500">{styles.subtitle}</p>
      </div>

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
        <User size={18} className="absolute right-3 top-9 text-gray-400" />
      </div>

      <div className="relative">
        <Input
          id="password"
          label="סיסמה"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="הכנס סיסמה"
          error={error}
          required
          className="pr-10 pl-10"
        />
        <Lock size={18} className="absolute right-3 top-9 text-gray-400" />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute left-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <Button
        type="submit"
        className={`w-full ${styles.buttonClass}`}
        size="lg"
        loading={loading}
        loadingText="מתחבר..."
        leftIcon={LogIn}
      >
        כניסה למערכת
      </Button>

      <div className="pt-4 border-t border-surface-2 text-center">
        <p className="text-sm text-gray-400">שכחת את הסיסמה? פנה למנהל המערכת</p>
      </div>
    </form>
  );
}

// Student Layout - Glass card floating over full-bleed background
function StudentLayout(props: {
  onSubmit: (e: React.FormEvent) => void;
  name: string;
  setName: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  error: string;
  loading: boolean;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-bleed background */}
      <div className="absolute inset-0">
        <Image
          src="/bg/bg-student.webp"
          alt=""
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-emerald-900/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Back button */}
        <Link
          href="/"
          className="absolute top-4 right-4 flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition-colors bg-white/80 backdrop-blur-sm rounded-full px-4 py-2"
        >
          <ArrowRight size={20} />
          <span className="font-medium">חזרה</span>
        </Link>

        {/* Logo */}
        <div className="mb-6 animate-scale-in">
          <Image
            src="/logo/logo-full.png"
            alt="חוקרי STEM"
            width={120}
            height={120}
            className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-xl"
            priority
          />
        </div>

        {/* Glass card */}
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-emerald-200/50 animate-slide-up">
          <LoginForm variant="student" {...props} />
        </div>
      </div>
    </div>
  );
}

// Parent Layout - Side by side
function ParentLayout(props: {
  onSubmit: (e: React.FormEvent) => void;
  name: string;
  setName: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  error: string;
  loading: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Image (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/bg/bg-parents.webp"
          alt=""
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-amber-900/20 to-transparent" />

        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center max-w-sm">
            <Image
              src="/logo/logo-full.png"
              alt="חוקרי STEM"
              width={150}
              height={150}
              className="w-32 h-32 object-contain mx-auto mb-4"
              priority
            />
            <h2 className="text-xl font-rubik font-bold text-amber-800 mb-2">
              ברוכים הבאים להורים
            </h2>
            <p className="text-amber-700">
              עקבו אחר ההתקדמות של ילדיכם במסע הלמידה
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-8 min-h-screen lg:min-h-0">
        {/* Back button */}
        <Link
          href="/"
          className="absolute top-4 right-4 flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors"
        >
          <ArrowRight size={20} />
          <span className="font-medium">חזרה</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/logo/logo-full.png"
              alt="חוקרי STEM"
              width={120}
              height={120}
              className="w-28 h-28 object-contain mx-auto mb-2"
              priority
            />
          </div>

          {/* Login card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-amber-200 animate-scale-in">
            <LoginForm variant="parent" {...props} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Staff Layout - Integrated with background
function StaffLayout(props: {
  onSubmit: (e: React.FormEvent) => void;
  name: string;
  setName: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  error: string;
  loading: boolean;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-bleed background */}
      <div className="absolute inset-0">
        <Image
          src="/bg/bg-teachers.webp"
          alt=""
          fill
          className="object-cover object-right lg:object-center"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-blue-900/5" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center p-4">
        {/* Back button */}
        <Link
          href="/"
          className="absolute top-4 right-4 flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors bg-white/80 backdrop-blur-sm rounded-full px-4 py-2"
        >
          <ArrowRight size={20} />
          <span className="font-medium">חזרה</span>
        </Link>

        {/* Form positioned in the left empty space */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:mr-auto lg:ml-16 xl:ml-24">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-6">
            <Image
              src="/logo/logo-full.png"
              alt="חוקרי STEM"
              width={100}
              height={100}
              className="w-24 h-24 object-contain mx-auto"
              priority
            />
          </div>

          {/* Login card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-blue-200/50 animate-slide-up">
            {/* Logo for desktop */}
            <div className="hidden lg:block text-center mb-4">
              <Image
                src="/logo/logo-full.png"
                alt="חוקרי STEM"
                width={80}
                height={80}
                className="w-20 h-20 object-contain mx-auto"
                priority
              />
            </div>
            <LoginForm variant="staff" {...props} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Default Layout - for when no type is specified
function DefaultLayout(props: {
  onSubmit: (e: React.FormEvent) => void;
  name: string;
  setName: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  error: string;
  loading: boolean;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-50 to-teal-50">
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Back button */}
        <Link
          href="/"
          className="absolute top-4 right-4 flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowRight size={20} />
          <span className="font-medium">חזרה</span>
        </Link>

        {/* Logo */}
        <div className="mb-6 animate-scale-in">
          <Image
            src="/logo/logo-full.png"
            alt="חוקרי STEM"
            width={150}
            height={150}
            className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-xl"
            priority
          />
        </div>

        {/* Login card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-surface-2 animate-slide-up">
          <form onSubmit={props.onSubmit} className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-rubik font-bold text-foreground mb-2">
                ברוכים הבאים
              </h2>
              <p className="text-gray-500">התחברו כדי להמשיך למרחב הלמידה</p>
            </div>

            <div className="relative">
              <Input
                id="name"
                label="שם מלא"
                type="text"
                value={props.name}
                onChange={(e) => props.setName(e.target.value)}
                placeholder="הכנס את שמך המלא"
                required
                className="pr-10"
              />
              <User size={18} className="absolute right-3 top-9 text-gray-400" />
            </div>

            <div className="relative">
              <Input
                id="password"
                label="סיסמה"
                type={props.showPassword ? "text" : "password"}
                value={props.password}
                onChange={(e) => props.setPassword(e.target.value)}
                placeholder="הכנס סיסמה"
                error={props.error}
                required
                className="pr-10 pl-10"
              />
              <Lock size={18} className="absolute right-3 top-9 text-gray-400" />
              <button
                type="button"
                onClick={() => props.setShowPassword(!props.showPassword)}
                className="absolute left-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={props.showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              >
                {props.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={props.loading}
              loadingText="מתחבר..."
              leftIcon={LogIn}
            >
              כניסה למערכת
            </Button>

            <div className="pt-4 border-t border-surface-2 text-center">
              <p className="text-sm text-gray-400">שכחת את הסיסמה? פנה למנהל המערכת</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const loginType = searchParams.get("type") as LoginType | null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(name, password);

    if (result.success && result.role) {
      // Admins can login from anywhere
      if (result.role === "admin") {
        router.push(`/${result.role}`);
        setLoading(false);
        return;
      }

      // Validate role matches the login type (if type is specified)
      if (loginType) {
        const allowedRoles: Record<LoginType, string[]> = {
          student: ["student"],
          parent: ["parent"],
          staff: ["teacher", "admin"],
        };

        if (!allowedRoles[loginType].includes(result.role)) {
          const errorMessages: Record<LoginType, string> = {
            student: "כניסה זו מיועדת לתלמידים בלבד",
            parent: "כניסה זו מיועדת להורים בלבד",
            staff: "כניסה זו מיועדת לצוות בלבד",
          };
          setError(errorMessages[loginType]);
          setLoading(false);
          return;
        }
      }

      router.push(`/${result.role}`);
    } else {
      setError(result.error || "שגיאה בהתחברות");
    }

    setLoading(false);
  };

  const formProps = {
    onSubmit: handleSubmit,
    name,
    setName,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    loading,
  };

  // Render the appropriate layout based on login type
  switch (loginType) {
    case "student":
      return <StudentLayout {...formProps} />;
    case "parent":
      return <ParentLayout {...formProps} />;
    case "staff":
      return <StaffLayout {...formProps} />;
    default:
      return <DefaultLayout {...formProps} />;
  }
}
