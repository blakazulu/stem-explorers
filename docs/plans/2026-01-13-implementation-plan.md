# STEM Explorers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a learning management platform for elementary schools with role-based access for teachers, parents, and students.

**Architecture:** Next.js 14 App Router with TypeScript, Firebase Firestore for data, Firebase Storage for files, Netlify Functions for serverless backend, Gemini API for AI reports, Botpress for chatbot.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Firebase (Firestore + Storage), Netlify Functions, Google Gemini API, Botpress, Resend (email)

---

## Phase 1: Project Foundation

### Task 1.1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `next.config.js`
- Create: `postcss.config.js`

**Step 1: Create Next.js app with TypeScript and Tailwind**

Run:
```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Project scaffolded with src/app directory structure

**Step 2: Verify setup**

Run: `npm run dev`
Expected: App runs on http://localhost:3000

**Step 3: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js 14 with TypeScript and Tailwind"
```

---

### Task 1.2: Configure RTL and Hebrew Fonts

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/globals.css`

**Step 1: Update layout.tsx for RTL and Hebrew fonts**

```tsx
import type { Metadata } from "next";
import { Rubik, Heebo } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "STEM Explorers - חוקרי STEM",
  description: "מרחב למידה לבית ספר יסודי",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} ${heebo.variable}`}>
      <body className="font-heebo bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

**Step 2: Update globals.css with design system colors**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: #0F766E;
    --color-secondary: #0284C7;
    --color-accent: #F59E0B;
    --color-success: #22C55E;
    --color-error: #EF4444;
    --color-background: #F8FAFC;
    --color-foreground: #1E293B;
  }
}

@layer base {
  body {
    @apply antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-rubik;
  }
}
```

**Step 3: Update tailwind.config.ts**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        success: "var(--color-success)",
        error: "var(--color-error)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
      },
      fontFamily: {
        rubik: ["var(--font-rubik)", "sans-serif"],
        heebo: ["var(--font-heebo)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 4: Verify fonts and RTL work**

Run: `npm run dev`
Expected: Page shows RTL layout with Hebrew fonts

**Step 5: Commit**

```bash
git add .
git commit -m "feat: configure RTL layout and Hebrew fonts (Rubik, Heebo)"
```

---

### Task 1.3: Create TypeScript Types

**Files:**
- Create: `src/types/index.ts`

**Step 1: Create type definitions**

```ts
// User roles
export type UserRole = "admin" | "teacher" | "parent" | "student";

// Hebrew grade levels
export type Grade = "א" | "ב" | "ג" | "ד" | "ה" | "ו";

// User stored in Firestore (document ID is the password)
export interface User {
  name: string;
  role: UserRole;
  grade: Grade | null;
  createdAt: Date;
}

// Learning unit within a grade
export interface Unit {
  id: string;
  gradeId: Grade;
  name: string;
  introFileUrl: string;
  unitFileUrl: string;
  order: number;
  createdAt: Date;
}

// Teacher documentation entry
export interface Documentation {
  id: string;
  unitId: string;
  gradeId: Grade;
  images: string[];
  text: string;
  teacherName: string;
  createdAt: Date;
}

// Student research journal entry
export interface ResearchJournal {
  id: string;
  unitId: string;
  gradeId: Grade;
  studentName: string;
  answers: JournalAnswer[];
  createdAt: Date;
}

export interface JournalAnswer {
  questionId: string;
  answer: string | number | string[];
}

// Question types for research journal
export type QuestionType = "rating" | "single" | "multiple" | "open";

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  target: {
    grades: Grade[];
    units: string[];
  };
  order: number;
}

// AI-generated report
export interface Report {
  id: string;
  unitId: string;
  gradeId: Grade;
  teacherContent: string;
  parentContent: string;
  generatedAt: Date;
}

// Forum post
export type ForumRoom = "requests" | "consultations";

export interface ForumPost {
  id: string;
  room: ForumRoom;
  authorName: string;
  title: string;
  content: string;
  replies: ForumReply[];
  createdAt: Date;
}

export interface ForumReply {
  authorName: string;
  content: string;
  createdAt: Date;
}

// Explanation button configuration
export interface ExplanationButton {
  id: string;
  role: UserRole;
  label: string;
  content: string;
  visible: boolean;
}

// Email configuration
export interface EmailConfig {
  adminEmails: string[];
  frequency: "immediate" | "daily";
  includeContent: boolean;
}

// Report configuration
export interface ReportElement {
  id: string;
  label: string;
  enabledForTeacher: boolean;
  enabledForParent: boolean;
}

export interface ReportConfig {
  elements: ReportElement[];
  aiPromptInstructions: string;
}

// Bot knowledge base entry
export interface BotKnowledge {
  id: string;
  title: string;
  content: string;
  fileUrl?: string;
  createdAt: Date;
}

// Session/Auth context
export interface AuthSession {
  user: User;
  password: string;
}
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions for all data models"
```

---

### Task 1.4: Set Up Firebase Configuration

**Files:**
- Create: `src/lib/firebase.ts`
- Create: `.env.local.example`

**Step 1: Install Firebase**

Run: `npm install firebase`

**Step 2: Create Firebase config file**

```ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

**Step 3: Create environment example file**

```bash
# .env.local.example
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
```

**Step 4: Commit**

```bash
git add src/lib/firebase.ts .env.local.example
git commit -m "feat: add Firebase configuration"
```

---

## Phase 2: Authentication System

### Task 2.1: Create Auth Context

**Files:**
- Create: `src/contexts/AuthContext.tsx`

**Step 1: Create auth context with password-based login**

```tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User, AuthSession, UserRole, Grade } from "@/types";

interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  login: (name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session on mount
    const stored = localStorage.getItem("stem-session");
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        localStorage.removeItem("stem-session");
      }
    }
    setLoading(false);
  }, []);

  const login = async (name: string, password: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", password));

      if (!userDoc.exists()) {
        return { success: false, error: "סיסמה שגויה" };
      }

      const userData = userDoc.data() as Omit<User, "createdAt"> & { createdAt: { toDate: () => Date } };
      const user: User = {
        ...userData,
        name,
        createdAt: userData.createdAt?.toDate() || new Date(),
      };

      const newSession: AuthSession = { user, password };
      setSession(newSession);
      localStorage.setItem("stem-session", JSON.stringify(newSession));

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "שגיאה בהתחברות" };
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("stem-session");
  };

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

**Step 2: Commit**

```bash
git add src/contexts/AuthContext.tsx
git commit -m "feat: add authentication context with password-based login"
```

---

### Task 2.2: Create Login Page

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`

**Step 1: Create Button component**

```tsx
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "font-rubik font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary",
      secondary: "bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary",
      outline: "border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

**Step 2: Create Input component**

```tsx
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full px-4 py-2 border rounded-lg bg-white text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            error ? "border-error" : "border-gray-300"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
```

**Step 3: Create login page**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "שגיאה בהתחברות");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-rubik font-bold text-primary mb-2">
              חוקרי STEM
            </h1>
            <p className="text-gray-600">מרחב למידה לבית ספר יסודי</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="שם מלא"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="הכנס את שמך המלא"
              required
            />

            <Input
              id="password"
              label="סיסמה"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="הכנס סיסמה"
              error={error}
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "מתחבר..." : "כניסה"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/\(auth\)/login/page.tsx src/components/ui/Button.tsx src/components/ui/Input.tsx
git commit -m "feat: add login page with UI components"
```

---

### Task 2.3: Create Dashboard Layout with Role-Based Routing

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx`
- Create: `src/components/dashboard/Sidebar.tsx`
- Create: `src/components/dashboard/Header.tsx`

**Step 1: Create Sidebar component**

```tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: "מודל פדגוגי", href: "/pedagogical", roles: ["admin", "teacher", "parent", "student"] },
  { label: "תוכניות עבודה", href: "/work-plans", roles: ["admin"] },
  { label: "תיעודים", href: "/documentation", roles: ["admin", "teacher", "parent", "student"] },
  { label: "יומן חוקר", href: "/journal", roles: ["student"] },
  { label: "דוחות", href: "/reports", roles: ["admin", "teacher", "parent"] },
  { label: "פורום", href: "/forum", roles: ["admin", "teacher"] },
  { label: "שאלות", href: "/questions", roles: ["admin"] },
  { label: "הגדרות", href: "/settings", roles: ["admin"] },
];

export function Sidebar() {
  const { session } = useAuth();
  const role = session?.user.role;

  const visibleItems = navItems.filter((item) => role && item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-l border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-rubik font-bold text-primary">חוקרי STEM</h2>
      </div>
      <nav className="px-4">
        <ul className="space-y-1">
          {visibleItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
```

**Step 2: Create Header component**

```tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

const roleLabels: Record<string, string> = {
  admin: "מנהל",
  teacher: "מורה",
  parent: "הורה",
  student: "תלמיד",
};

export function Header() {
  const { session, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-gray-600">שלום, </span>
          <span className="font-medium">{session?.user.name}</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-sm text-gray-500">
            {session?.user.role && roleLabels[session.user.role]}
            {session?.user.grade && ` - כיתה ${session.user.grade}`}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          התנתק
        </Button>
      </div>
    </header>
  );
}
```

**Step 3: Create dashboard layout**

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">טוען...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

**Step 4: Create dashboard page**

```tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { session } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-rubik font-bold mb-6">לוח בקרה</h1>
      <p className="text-gray-600">
        ברוך הבא, {session?.user.name}! בחר באחת האפשרויות מהתפריט.
      </p>
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add src/app/\(dashboard\)/layout.tsx src/app/\(dashboard\)/dashboard/page.tsx src/components/dashboard/Sidebar.tsx src/components/dashboard/Header.tsx
git commit -m "feat: add dashboard layout with role-based navigation"
```

---

### Task 2.4: Update Root Layout with AuthProvider

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

**Step 1: Update root layout**

```tsx
import type { Metadata } from "next";
import { Rubik, Heebo } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "STEM Explorers - חוקרי STEM",
  description: "מרחב למידה לבית ספר יסודי",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} ${heebo.variable}`}>
      <body className="font-heebo bg-background text-foreground min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

**Step 2: Create root page with redirect**

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [session, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-primary">טוען...</div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add AuthProvider to root layout and redirect logic"
```

---

## Phase 3: Core Features - Pedagogical Model

### Task 3.1: Create Grade Selection Component

**Files:**
- Create: `src/components/ui/GradeSelector.tsx`

**Step 1: Create grade selector**

```tsx
"use client";

import type { Grade } from "@/types";

const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

interface GradeSelectorProps {
  selected: Grade | null;
  onSelect: (grade: Grade) => void;
  disabled?: boolean;
}

export function GradeSelector({ selected, onSelect, disabled }: GradeSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {grades.map((grade) => (
        <button
          key={grade}
          onClick={() => onSelect(grade)}
          disabled={disabled}
          className={`w-12 h-12 rounded-lg font-rubik font-bold text-lg transition-colors ${
            selected === grade
              ? "bg-primary text-white"
              : "bg-white border-2 border-gray-200 text-foreground hover:border-primary hover:text-primary"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {grade}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ui/GradeSelector.tsx
git commit -m "feat: add grade selector component"
```

---

### Task 3.2: Create Firestore Service for Units

**Files:**
- Create: `src/lib/services/units.ts`

**Step 1: Create units service**

```ts
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Unit, Grade } from "@/types";

const COLLECTION = "units";

export async function getUnitsByGrade(grade: Grade): Promise<Unit[]> {
  const q = query(
    collection(db, COLLECTION),
    where("gradeId", "==", grade),
    orderBy("order", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Unit[];
}

export async function getUnit(id: string): Promise<Unit | null> {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate(),
  } as Unit;
}

export async function createUnit(
  data: Omit<Unit, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateUnit(
  id: string,
  data: Partial<Omit<Unit, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteUnit(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
```

**Step 2: Commit**

```bash
git add src/lib/services/units.ts
git commit -m "feat: add Firestore service for units CRUD"
```

---

### Task 3.3: Create Pedagogical Model Page

**Files:**
- Create: `src/app/(dashboard)/pedagogical/page.tsx`
- Create: `src/components/pedagogical/UnitTree.tsx`
- Create: `src/components/pedagogical/UnitCard.tsx`

**Step 1: Create UnitCard component**

```tsx
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
```

**Step 2: Create UnitTree component**

```tsx
"use client";

import { useState, useEffect } from "react";
import { getUnitsByGrade } from "@/lib/services/units";
import { UnitCard } from "./UnitCard";
import type { Unit, Grade } from "@/types";

interface UnitTreeProps {
  grade: Grade;
  onSelectUnit: (unit: Unit) => void;
}

export function UnitTree({ grade, onSelectUnit }: UnitTreeProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUnits() {
      setLoading(true);
      const data = await getUnitsByGrade(grade);
      setUnits(data);
      setLoading(false);
    }
    loadUnits();
  }, [grade]);

  if (loading) {
    return <div className="text-gray-500">טוען יחידות...</div>;
  }

  if (units.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        אין יחידות לימוד לשכבה זו
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {units.map((unit) => (
        <UnitCard key={unit.id} unit={unit} onSelect={onSelectUnit} />
      ))}
    </div>
  );
}
```

**Step 3: Create pedagogical page**

```tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { UnitTree } from "@/components/pedagogical/UnitTree";
import type { Grade, Unit } from "@/types";

export default function PedagogicalPage() {
  const { session } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(
    session?.user.grade || null
  );
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const isTeacherOrAdmin = session?.user.role === "teacher" || session?.user.role === "admin";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-rubik font-bold">מודל פדגוגי</h1>

      {isTeacherOrAdmin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            בחר שכבה
          </label>
          <GradeSelector selected={selectedGrade} onSelect={setSelectedGrade} />
        </div>
      )}

      {selectedGrade && !selectedUnit && (
        <div>
          <h2 className="text-lg font-rubik font-semibold mb-4">
            יחידות לימוד - כיתה {selectedGrade}
          </h2>
          <UnitTree grade={selectedGrade} onSelectUnit={setSelectedUnit} />
        </div>
      )}

      {selectedUnit && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-rubik font-bold">{selectedUnit.name}</h2>
            <button
              onClick={() => setSelectedUnit(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              חזור לרשימה
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <a
              href={selectedUnit.introFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-secondary/10 rounded-lg text-center hover:bg-secondary/20 transition-colors"
            >
              <span className="font-medium text-secondary">מבוא ליחידה</span>
            </a>
            <a
              href={selectedUnit.unitFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-primary/10 rounded-lg text-center hover:bg-primary/20 transition-colors"
            >
              <span className="font-medium text-primary">תוכן היחידה</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/\(dashboard\)/pedagogical/page.tsx src/components/pedagogical/UnitTree.tsx src/components/pedagogical/UnitCard.tsx
git commit -m "feat: add pedagogical model page with grade selection and unit tree"
```

---

## Phase 4: Documentation Feature

### Task 4.1: Create Image Upload Utility

**Files:**
- Create: `src/lib/utils/imageUpload.ts`

**Step 1: Install sharp for image processing (Netlify Function will handle this)**

For now, create client-side resize utility:

```ts
export async function resizeImage(file: File, maxWidth: number = 800): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        },
        "image/webp",
        0.85
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  const resized = await resizeImage(file);
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, resized);
  return getDownloadURL(storageRef);
}
```

**Step 2: Commit**

```bash
git add src/lib/utils/imageUpload.ts
git commit -m "feat: add image resize and upload utility"
```

---

### Task 4.2: Create Documentation Service

**Files:**
- Create: `src/lib/services/documentation.ts`

**Step 1: Create documentation service**

```ts
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { Documentation, Grade } from "@/types";

const COLLECTION = "documentation";

export async function getDocumentationByUnit(
  unitId: string,
  gradeId: Grade
): Promise<Documentation[]> {
  const q = query(
    collection(db, COLLECTION),
    where("unitId", "==", unitId),
    where("gradeId", "==", gradeId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Documentation[];
}

export async function createDocumentation(
  data: Omit<Documentation, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteDocumentation(
  id: string,
  imageUrls: string[]
): Promise<void> {
  // Delete images from storage
  for (const url of imageUrls) {
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
    } catch (e) {
      console.error("Failed to delete image:", e);
    }
  }

  // Delete document
  await deleteDoc(doc(db, COLLECTION, id));
}
```

**Step 2: Commit**

```bash
git add src/lib/services/documentation.ts
git commit -m "feat: add documentation service for CRUD operations"
```

---

### Task 4.3: Create Documentation Gallery Component

**Files:**
- Create: `src/components/documentation/DocumentationGallery.tsx`
- Create: `src/components/documentation/DocumentationCard.tsx`

**Step 1: Create DocumentationCard**

```tsx
import type { Documentation } from "@/types";

interface DocumentationCardProps {
  doc: Documentation;
  canDelete: boolean;
  onDelete: (doc: Documentation) => void;
}

export function DocumentationCard({ doc, canDelete, onDelete }: DocumentationCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      {doc.images.length > 0 && (
        <div className="aspect-video relative">
          <img
            src={doc.images[0]}
            alt={doc.text || "תיעוד"}
            className="w-full h-full object-cover"
          />
          {doc.images.length > 1 && (
            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              +{doc.images.length - 1} תמונות
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        {doc.text && <p className="text-foreground mb-2">{doc.text}</p>}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{doc.teacherName}</span>
          <span>{doc.createdAt.toLocaleDateString("he-IL")}</span>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(doc)}
            className="mt-2 text-sm text-error hover:underline"
          >
            מחק
          </button>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Create DocumentationGallery**

```tsx
"use client";

import { useState, useEffect } from "react";
import { getDocumentationByUnit, deleteDocumentation } from "@/lib/services/documentation";
import { DocumentationCard } from "./DocumentationCard";
import { useAuth } from "@/contexts/AuthContext";
import type { Documentation, Grade } from "@/types";

interface DocumentationGalleryProps {
  unitId: string;
  gradeId: Grade;
  onAddNew?: () => void;
}

export function DocumentationGallery({
  unitId,
  gradeId,
  onAddNew,
}: DocumentationGalleryProps) {
  const { session } = useAuth();
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user.role === "admin";
  const isTeacher = session?.user.role === "teacher";

  useEffect(() => {
    loadDocs();
  }, [unitId, gradeId]);

  async function loadDocs() {
    setLoading(true);
    const data = await getDocumentationByUnit(unitId, gradeId);
    setDocs(data);
    setLoading(false);
  }

  async function handleDelete(doc: Documentation) {
    if (!confirm("האם למחוק תיעוד זה?")) return;
    await deleteDocumentation(doc.id, doc.images);
    await loadDocs();
  }

  if (loading) {
    return <div className="text-gray-500">טוען תיעודים...</div>;
  }

  return (
    <div className="space-y-4">
      {(isTeacher || isAdmin) && onAddNew && (
        <button
          onClick={onAddNew}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-colors"
        >
          + הוסף תיעוד חדש
        </button>
      )}

      {docs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">אין תיעודים עדיין</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <DocumentationCard
              key={doc.id}
              doc={doc}
              canDelete={isAdmin || (isTeacher && doc.teacherName === session?.user.name)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/documentation/DocumentationGallery.tsx src/components/documentation/DocumentationCard.tsx
git commit -m "feat: add documentation gallery components"
```

---

## Phase 5: Research Journal (Student Feature)

### Task 5.1: Create Questions Service

**Files:**
- Create: `src/lib/services/questions.ts`

**Step 1: Create questions service**

```ts
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Question, Grade } from "@/types";

const COLLECTION = "questions";

export async function getQuestionsForUnit(
  gradeId: Grade,
  unitId: string
): Promise<Question[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy("order", "asc")
  );

  const snapshot = await getDocs(q);
  const questions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Question[];

  // Filter questions that target this grade and unit
  return questions.filter((question) => {
    const targetGrades = question.target.grades;
    const targetUnits = question.target.units;

    const gradeMatch = targetGrades.length === 0 || targetGrades.includes(gradeId);
    const unitMatch = targetUnits.length === 0 || targetUnits.includes(unitId);

    return gradeMatch && unitMatch;
  });
}

export async function getAllQuestions(): Promise<Question[]> {
  const q = query(collection(db, COLLECTION), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Question[];
}

export async function createQuestion(
  data: Omit<Question, "id">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function updateQuestion(
  id: string,
  data: Partial<Omit<Question, "id">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteQuestion(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
```

**Step 2: Commit**

```bash
git add src/lib/services/questions.ts
git commit -m "feat: add questions service for research journal"
```

---

### Task 5.2: Create Research Journal Service

**Files:**
- Create: `src/lib/services/journals.ts`

**Step 1: Create journals service**

```ts
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ResearchJournal, Grade, JournalAnswer } from "@/types";

const COLLECTION = "researchJournals";

export async function getJournalsByUnit(
  unitId: string,
  gradeId: Grade
): Promise<ResearchJournal[]> {
  const q = query(
    collection(db, COLLECTION),
    where("unitId", "==", unitId),
    where("gradeId", "==", gradeId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as ResearchJournal[];
}

export async function submitJournal(data: {
  unitId: string;
  gradeId: Grade;
  studentName: string;
  answers: JournalAnswer[];
}): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
```

**Step 2: Commit**

```bash
git add src/lib/services/journals.ts
git commit -m "feat: add research journal service"
```

---

### Task 5.3: Create Journal Wizard Component

**Files:**
- Create: `src/components/journal/JournalWizard.tsx`
- Create: `src/components/journal/QuestionRenderer.tsx`

**Step 1: Create QuestionRenderer**

```tsx
import type { Question } from "@/types";

interface QuestionRendererProps {
  question: Question;
  value: string | number | string[];
  onChange: (value: string | number | string[]) => void;
}

export function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  switch (question.type) {
    case "rating":
      return (
        <div className="space-y-2">
          <p className="font-medium">{question.text}</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={`w-10 h-10 rounded-full border-2 font-medium transition-colors ${
                  value === n
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300 hover:border-primary"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      );

    case "single":
      return (
        <div className="space-y-2">
          <p className="font-medium">{question.text}</p>
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={value === option}
                  onChange={() => onChange(option)}
                  className="w-4 h-4 text-primary"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "multiple":
      const selectedValues = (value as string[]) || [];
      return (
        <div className="space-y-2">
          <p className="font-medium">{question.text}</p>
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, option]);
                    } else {
                      onChange(selectedValues.filter((v) => v !== option));
                    }
                  }}
                  className="w-4 h-4 text-primary rounded"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "open":
      return (
        <div className="space-y-2">
          <p className="font-medium">{question.text}</p>
          <textarea
            value={value as string || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={4}
          />
        </div>
      );

    default:
      return null;
  }
}
```

**Step 2: Create JournalWizard**

```tsx
"use client";

import { useState } from "react";
import { QuestionRenderer } from "./QuestionRenderer";
import { Button } from "@/components/ui/Button";
import type { Question, JournalAnswer } from "@/types";

interface JournalWizardProps {
  questions: Question[];
  onSubmit: (answers: JournalAnswer[]) => Promise<void>;
  onCancel: () => void;
}

export function JournalWizard({ questions, onSubmit, onCancel }: JournalWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const canProceed = answers[currentQuestion?.id] !== undefined;

  const handleNext = async () => {
    if (isLastStep) {
      setSubmitting(true);
      const journalAnswers: JournalAnswer[] = Object.entries(answers).map(
        ([questionId, answer]) => ({ questionId, answer })
      );
      await onSubmit(journalAnswers);
      setSubmitting(false);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      onCancel();
    }
  };

  if (!currentQuestion) {
    return <div>אין שאלות להצגה</div>;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>שאלה {currentStep + 1} מתוך {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <QuestionRenderer
          question={currentQuestion}
          value={answers[currentQuestion.id]}
          onChange={(value) =>
            setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
          }
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          {currentStep === 0 ? "ביטול" : "חזור"}
        </Button>
        <Button onClick={handleNext} disabled={!canProceed || submitting}>
          {submitting ? "שולח..." : isLastStep ? "שלח" : "הבא"}
        </Button>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/journal/JournalWizard.tsx src/components/journal/QuestionRenderer.tsx
git commit -m "feat: add research journal wizard component"
```

---

### Task 5.4: Create Journal Page

**Files:**
- Create: `src/app/(dashboard)/journal/page.tsx`

**Step 1: Create journal page**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUnitsByGrade } from "@/lib/services/units";
import { getQuestionsForUnit } from "@/lib/services/questions";
import { submitJournal } from "@/lib/services/journals";
import { JournalWizard } from "@/components/journal/JournalWizard";
import { Button } from "@/components/ui/Button";
import type { Unit, Question, JournalAnswer, Grade } from "@/types";

export default function JournalPage() {
  const { session } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const grade = session?.user.grade as Grade;

  useEffect(() => {
    if (grade) {
      loadUnits();
    }
  }, [grade]);

  async function loadUnits() {
    setLoading(true);
    const data = await getUnitsByGrade(grade);
    setUnits(data);
    setLoading(false);
  }

  async function handleSelectUnit(unit: Unit) {
    setSelectedUnit(unit);
    const qs = await getQuestionsForUnit(grade, unit.id);
    setQuestions(qs);
    setShowWizard(true);
  }

  async function handleSubmit(answers: JournalAnswer[]) {
    if (!selectedUnit || !session) return;

    await submitJournal({
      unitId: selectedUnit.id,
      gradeId: grade,
      studentName: session.user.name,
      answers,
    });

    setSubmitted(true);
    setShowWizard(false);
  }

  if (loading) {
    return <div className="text-gray-500">טוען...</div>;
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-rubik font-bold text-success mb-4">
          היומן נשלח בהצלחה!
        </h2>
        <p className="text-gray-600 mb-6">תודה על מילוי יומן החוקר</p>
        <Button onClick={() => setSubmitted(false)}>מלא יומן נוסף</Button>
      </div>
    );
  }

  if (showWizard && selectedUnit) {
    return (
      <div>
        <h1 className="text-2xl font-rubik font-bold mb-6">
          יומן חוקר - {selectedUnit.name}
        </h1>
        <JournalWizard
          questions={questions}
          onSubmit={handleSubmit}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-rubik font-bold">יומן חוקר</h1>
      <p className="text-gray-600">בחר יחידה למילוי יומן חוקר</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => (
          <button
            key={unit.id}
            onClick={() => handleSelectUnit(unit)}
            className="text-right p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-accent hover:shadow-md transition-all"
          >
            <h3 className="font-rubik font-semibold text-lg">{unit.name}</h3>
            <p className="text-sm text-gray-500 mt-1">לחץ למילוי יומן</p>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/\(dashboard\)/journal/page.tsx
git commit -m "feat: add research journal page for students"
```

---

## Phase 6: AI Reports (Gemini Integration)

### Task 6.1: Create Netlify Function for Report Generation

**Files:**
- Create: `netlify/functions/generate-report.ts`

**Step 1: Install Gemini SDK**

Run: `npm install @google/generative-ai`

**Step 2: Create Netlify function**

```ts
import { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { journals, unitName, reportConfig } = JSON.parse(event.body || "{}");

    if (!journals || journals.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No journals provided" }),
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const journalSummary = journals
      .map((j: any, i: number) => `תלמיד ${i + 1}: ${JSON.stringify(j.answers)}`)
      .join("\n");

    const prompt = `
אתה מנתח נתונים חינוכיים. יש לך ${journals.length} יומני חוקר מיחידה "${unitName}".

נתוני היומנים:
${journalSummary}

${reportConfig?.aiPromptInstructions || ""}

צור שני דוחות:
1. דוח למורים - מפורט, כולל ניתוח דפוסים, אתגרים, והמלצות פדגוגיות
2. דוח להורים - תמציתי וידידותי, מתמקד בהישגים והתקדמות

החזר בפורמט JSON:
{
  "teacherContent": "תוכן הדוח למורים בעברית (markdown)",
  "parentContent": "תוכן הדוח להורים בעברית (markdown)"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const reportData = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      body: JSON.stringify(reportData),
    };
  } catch (error) {
    console.error("Report generation error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate report" }),
    };
  }
};
```

**Step 3: Commit**

```bash
git add netlify/functions/generate-report.ts package.json package-lock.json
git commit -m "feat: add Netlify function for AI report generation with Gemini"
```

---

### Task 6.2: Create Reports Service

**Files:**
- Create: `src/lib/services/reports.ts`

**Step 1: Create reports service**

```ts
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Report, Grade, ResearchJournal } from "@/types";

const COLLECTION = "reports";

export async function getReport(
  unitId: string,
  gradeId: Grade
): Promise<Report | null> {
  const q = query(
    collection(db, COLLECTION),
    where("unitId", "==", unitId),
    where("gradeId", "==", gradeId)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    generatedAt: doc.data().generatedAt?.toDate(),
  } as Report;
}

export async function generateReport(
  unitId: string,
  unitName: string,
  gradeId: Grade,
  journals: ResearchJournal[]
): Promise<Report> {
  const response = await fetch("/.netlify/functions/generate-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ journals, unitName }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate report");
  }

  const { teacherContent, parentContent } = await response.json();

  const reportId = `${gradeId}-${unitId}`;
  const report: Omit<Report, "id"> = {
    unitId,
    gradeId,
    teacherContent,
    parentContent,
    generatedAt: new Date(),
  };

  await setDoc(doc(db, COLLECTION, reportId), {
    ...report,
    generatedAt: serverTimestamp(),
  });

  return { id: reportId, ...report };
}
```

**Step 2: Commit**

```bash
git add src/lib/services/reports.ts
git commit -m "feat: add reports service with AI generation"
```

---

### Task 6.3: Create Reports Page

**Files:**
- Create: `src/app/(dashboard)/reports/page.tsx`

**Step 1: Create reports page**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { getUnitsByGrade } from "@/lib/services/units";
import { getReport } from "@/lib/services/reports";
import type { Grade, Unit, Report } from "@/types";

export default function ReportsPage() {
  const { session } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(
    session?.user.grade || null
  );
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  const isTeacherOrAdmin = session?.user.role === "teacher" || session?.user.role === "admin";
  const isParent = session?.user.role === "parent";

  useEffect(() => {
    if (selectedGrade) {
      loadUnits();
    }
  }, [selectedGrade]);

  async function loadUnits() {
    const data = await getUnitsByGrade(selectedGrade!);
    setUnits(data);
  }

  async function loadReport(unit: Unit) {
    setSelectedUnit(unit);
    setLoading(true);
    const data = await getReport(unit.id, selectedGrade!);
    setReport(data);
    setLoading(false);
  }

  const reportContent = report
    ? isParent
      ? report.parentContent
      : report.teacherContent
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-rubik font-bold">דוחות</h1>

      {isTeacherOrAdmin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            בחר שכבה
          </label>
          <GradeSelector selected={selectedGrade} onSelect={setSelectedGrade} />
        </div>
      )}

      {selectedGrade && !selectedUnit && (
        <div>
          <h2 className="text-lg font-rubik font-semibold mb-4">בחר יחידה</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => loadReport(unit)}
                className="text-right p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="font-rubik font-semibold">{unit.name}</h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedUnit && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-rubik font-bold">
              דוח - {selectedUnit.name}
            </h2>
            <button
              onClick={() => {
                setSelectedUnit(null);
                setReport(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              חזור
            </button>
          </div>

          {loading ? (
            <div className="text-gray-500">טוען דוח...</div>
          ) : reportContent ? (
            <div
              className="prose prose-lg max-w-none"
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: reportContent }}
            />
          ) : (
            <p className="text-gray-500">אין דוח זמין ליחידה זו</p>
          )}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/\(dashboard\)/reports/page.tsx
git commit -m "feat: add reports page with role-based content display"
```

---

## Phase 7: Forum Feature

### Task 7.1: Create Forum Service

**Files:**
- Create: `src/lib/services/forum.ts`

**Step 1: Create forum service**

```ts
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ForumPost, ForumRoom, ForumReply } from "@/types";

const COLLECTION = "forum";

export async function getPostsByRoom(room: ForumRoom): Promise<ForumPost[]> {
  const q = query(
    collection(db, COLLECTION),
    where("room", "==", room),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    replies: doc.data().replies?.map((r: any) => ({
      ...r,
      createdAt: r.createdAt?.toDate(),
    })),
  })) as ForumPost[];
}

export async function createPost(
  data: Omit<ForumPost, "id" | "createdAt" | "replies">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    replies: [],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function addReply(
  postId: string,
  reply: Omit<ForumReply, "createdAt">
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, postId), {
    replies: arrayUnion({
      ...reply,
      createdAt: new Date(),
    }),
  });
}

export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
```

**Step 2: Commit**

```bash
git add src/lib/services/forum.ts
git commit -m "feat: add forum service for posts and replies"
```

---

### Task 7.2: Create Forum Page

**Files:**
- Create: `src/app/(dashboard)/forum/page.tsx`
- Create: `src/components/forum/PostCard.tsx`
- Create: `src/components/forum/NewPostForm.tsx`

**Step 1: Create PostCard**

```tsx
"use client";

import { useState } from "react";
import { addReply } from "@/lib/services/forum";
import { Button } from "@/components/ui/Button";
import type { ForumPost } from "@/types";

interface PostCardProps {
  post: ForumPost;
  currentUserName: string;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onReplyAdded: () => void;
}

export function PostCard({
  post,
  currentUserName,
  isAdmin,
  onDelete,
  onReplyAdded,
}: PostCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canDelete = isAdmin || post.authorName === currentUserName;

  async function handleReply() {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    await addReply(post.id, {
      authorName: currentUserName,
      content: replyContent,
    });
    setReplyContent("");
    setShowReplyForm(false);
    setSubmitting(false);
    onReplyAdded();
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-rubik font-semibold text-lg">{post.title}</h3>
          <p className="text-sm text-gray-500">
            {post.authorName} • {post.createdAt.toLocaleDateString("he-IL")}
          </p>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-sm text-error hover:underline"
          >
            מחק
          </button>
        )}
      </div>

      <p className="text-foreground mb-4">{post.content}</p>

      {post.replies.length > 0 && (
        <div className="border-t pt-4 mt-4 space-y-3">
          <h4 className="font-medium text-sm text-gray-600">תגובות</h4>
          {post.replies.map((reply, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm">{reply.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {reply.authorName} • {reply.createdAt?.toLocaleDateString("he-IL")}
              </p>
            </div>
          ))}
        </div>
      )}

      {showReplyForm ? (
        <div className="mt-4 space-y-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="כתוב תגובה..."
            rows={3}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleReply} disabled={submitting}>
              {submitting ? "שולח..." : "שלח"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowReplyForm(false)}
            >
              ביטול
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowReplyForm(true)}
          className="mt-4 text-sm text-primary hover:underline"
        >
          הוסף תגובה
        </button>
      )}
    </div>
  );
}
```

**Step 2: Create NewPostForm**

```tsx
"use client";

import { useState } from "react";
import { createPost } from "@/lib/services/forum";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ForumRoom } from "@/types";

interface NewPostFormProps {
  room: ForumRoom;
  authorName: string;
  onCreated: () => void;
  onCancel: () => void;
}

export function NewPostForm({ room, authorName, onCreated, onCancel }: NewPostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    await createPost({
      room,
      authorName,
      title,
      content,
    });
    setSubmitting(false);
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-rubik font-semibold text-lg">פוסט חדש</h3>

      <Input
        label="כותרת"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          תוכן
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border rounded-lg"
          rows={5}
          required
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "שולח..." : "פרסם"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </form>
  );
}
```

**Step 3: Create forum page**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPostsByRoom, deletePost } from "@/lib/services/forum";
import { PostCard } from "@/components/forum/PostCard";
import { NewPostForm } from "@/components/forum/NewPostForm";
import { Button } from "@/components/ui/Button";
import type { ForumPost, ForumRoom } from "@/types";

const rooms: { id: ForumRoom; label: string }[] = [
  { id: "requests", label: "בקשות" },
  { id: "consultations", label: "התייעצויות" },
];

export default function ForumPage() {
  const { session } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<ForumRoom>("requests");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user.role === "admin";

  useEffect(() => {
    loadPosts();
  }, [selectedRoom]);

  async function loadPosts() {
    setLoading(true);
    const data = await getPostsByRoom(selectedRoom);
    setPosts(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("האם למחוק פוסט זה?")) return;
    await deletePost(id);
    await loadPosts();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-rubik font-bold">פורום</h1>
        <Button onClick={() => setShowNewPost(true)}>פוסט חדש</Button>
      </div>

      <div className="flex gap-2">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRoom === room.id
                ? "bg-primary text-white"
                : "bg-white text-foreground hover:bg-gray-100"
            }`}
          >
            {room.label}
          </button>
        ))}
      </div>

      {showNewPost && (
        <NewPostForm
          room={selectedRoom}
          authorName={session?.user.name || ""}
          onCreated={() => {
            setShowNewPost(false);
            loadPosts();
          }}
          onCancel={() => setShowNewPost(false)}
        />
      )}

      {loading ? (
        <div className="text-gray-500">טוען פוסטים...</div>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">אין פוסטים בחדר זה</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserName={session?.user.name || ""}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onReplyAdded={loadPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/\(dashboard\)/forum/page.tsx src/components/forum/PostCard.tsx src/components/forum/NewPostForm.tsx
git commit -m "feat: add forum page with posts and replies"
```

---

## Phase 8: PWA Configuration

### Task 8.1: Configure PWA

**Files:**
- Create: `public/manifest.json`
- Create: `public/icons/icon-192.png` (placeholder)
- Create: `public/icons/icon-512.png` (placeholder)
- Modify: `src/app/layout.tsx`

**Step 1: Install next-pwa**

Run: `npm install next-pwa`

**Step 2: Create manifest.json**

```json
{
  "name": "STEM Explorers - חוקרי STEM",
  "short_name": "STEM Explorers",
  "description": "מרחב למידה לבית ספר יסודי",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0F766E",
  "background_color": "#F8FAFC",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Step 3: Update next.config.js**

```js
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withPWA(nextConfig);
```

**Step 4: Add manifest link to layout**

Update metadata in `src/app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: "STEM Explorers - חוקרי STEM",
  description: "מרחב למידה לבית ספר יסודי",
  manifest: "/manifest.json",
  themeColor: "#0F766E",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};
```

**Step 5: Commit**

```bash
git add public/manifest.json next.config.js src/app/layout.tsx package.json package-lock.json
git commit -m "feat: configure PWA with manifest and next-pwa"
```

---

## Summary

This implementation plan covers:

1. **Phase 1: Project Foundation** - Next.js setup, RTL, fonts, types, Firebase config
2. **Phase 2: Authentication** - Context, login page, dashboard layout
3. **Phase 3: Pedagogical Model** - Grade selection, unit tree, unit display
4. **Phase 4: Documentation** - Image upload, gallery, CRUD
5. **Phase 5: Research Journal** - Questions, journal wizard, submission
6. **Phase 6: AI Reports** - Gemini integration, report generation
7. **Phase 7: Forum** - Posts, replies, rooms
8. **Phase 8: PWA** - Manifest, service worker

**Remaining features (follow same pattern):**
- Admin panels (work plans, questions, settings management)
- Explanation pages
- Botpress chatbot integration
- Email notifications (Resend)
- Firestore security rules

---
