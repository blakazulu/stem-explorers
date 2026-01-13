import { HTMLAttributes, forwardRef } from "react";
import { useRoleStyles } from "@/contexts/ThemeContext";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  /** Adds a role-colored left border accent */
  roleAccent?: boolean;
}

// Theme-aware variant styles using CSS variables
const variantStyles = {
  default: "bg-surface-0 shadow-theme",
  elevated: "bg-surface-0 shadow-theme hover:shadow-lg",
  outlined: "bg-surface-0 border-2 border-surface-3",
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4 md:p-6",
  lg: "p-6 md:p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = "",
      variant = "default",
      interactive = false,
      padding = "md",
      roleAccent = false,
      children,
      ...props
    },
    ref
  ) => {
    const roleStyles = useRoleStyles();

    // Theme-aware base styles - radius and timing come from CSS variables
    const baseStyles = "rounded-theme transition-all duration-theme ease-theme";
    const interactiveStyles = interactive
      ? "cursor-pointer hover:shadow-md active:scale-[0.99]"
      : "";

    // Role accent adds a colored left border
    const accentStyles = roleAccent
      ? `border-r-4 ${roleStyles.border}`
      : "";

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${interactiveStyles} ${accentStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Header component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function CardHeader({
  title,
  description,
  action,
  className = "",
  ...props
}: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`} {...props}>
      <div>
        <h3 className="font-rubik font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// Card Content component
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className = "", children, ...props }: CardContentProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

// Card Footer component
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className = "", children, ...props }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-surface-2 ${className}`} {...props}>
      {children}
    </div>
  );
}
