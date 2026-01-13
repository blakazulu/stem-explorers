import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { LucideIcon, Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  loading?: boolean;
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      loading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-rubik font-medium rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary/90 focus:ring-primary shadow-sm hover:shadow-md",
      secondary:
        "bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary shadow-sm hover:shadow-md",
      outline:
        "border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary",
      ghost:
        "text-foreground hover:bg-surface-2 focus:ring-primary",
      destructive:
        "bg-error text-white hover:bg-error/90 focus:ring-error shadow-sm hover:shadow-md",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    const iconSizes = {
      sm: 14,
      md: 18,
      lg: 20,
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 size={iconSizes[size]} className="animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {LeftIcon && <LeftIcon size={iconSizes[size]} />}
            {children}
            {RightIcon && <RightIcon size={iconSizes[size]} />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// Icon-only button variant
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  label: string; // For accessibility
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className = "",
      variant = "ghost",
      size = "md",
      icon: Icon,
      label,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.95]";

    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary/90 focus:ring-primary",
      secondary:
        "bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary",
      outline:
        "border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary",
      ghost:
        "text-foreground hover:bg-surface-2 focus:ring-primary",
      destructive:
        "bg-error text-white hover:bg-error/90 focus:ring-error",
    };

    const sizes = {
      sm: "p-1.5",
      md: "p-2",
      lg: "p-3",
    };

    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24,
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        aria-label={label}
        title={label}
        {...props}
      >
        <Icon size={iconSizes[size]} />
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
