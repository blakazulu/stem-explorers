import { ReactNode } from "react";
import { Icon, IconName, stemIcons } from "./Icon";
import { Button } from "./Button";

type ActionConfig = { label: string; onClick: () => void };

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ActionConfig | ReactNode;
  children?: ReactNode;
  variant?: "default" | "compact" | "stem";
}

// Type guard to check if action is ActionConfig
function isActionConfig(action: ActionConfig | ReactNode): action is ActionConfig {
  return (
    typeof action === "object" &&
    action !== null &&
    "label" in action &&
    "onClick" in action
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  variant = "default",
}: EmptyStateProps) {
  if (variant === "stem") {
    return (
      <StemEmptyState
        title={title}
        description={description}
        action={action}
      />
    );
  }

  const sizeClasses = variant === "compact" ? "py-6" : "py-12";
  const iconSize = variant === "compact" ? "lg" : "xl";

  return (
    <div className={`text-center ${sizeClasses}`}>
      {icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-2 mb-4">
          <Icon name={icon} size={iconSize} className="text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-rubik font-semibold text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 max-w-md mx-auto mb-4">{description}</p>
      )}
      {action &&
        (isActionConfig(action) ? (
          <Button onClick={action.onClick} variant="primary">
            {action.label}
          </Button>
        ) : (
          action
        ))}
      {children}
    </div>
  );
}

// Special STEM-themed empty state with floating icons
function StemEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ActionConfig | ReactNode;
}) {
  return (
    <div className="relative py-16 overflow-hidden">
      {/* Floating STEM icons */}
      <div className="absolute inset-0 pointer-events-none">
        {stemIcons.slice(0, 4).map((iconName, i) => (
          <div
            key={iconName}
            className="absolute text-primary/10 animate-bounce"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
              animationDelay: `${i * 200}ms`,
              animationDuration: "3s",
            }}
          >
            <Icon name={iconName} size={32 + i * 8} />
          </div>
        ))}
        {stemIcons.slice(4).map((iconName, i) => (
          <div
            key={iconName}
            className="absolute text-secondary/10 animate-bounce"
            style={{
              top: `${25 + i * 15}%`,
              right: `${10 + i * 20}%`,
              animationDelay: `${(i + 4) * 200}ms`,
              animationDuration: "3s",
            }}
          >
            <Icon name={iconName} size={28 + i * 8} />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-6">
          <Icon name="rocket" size="xl" className="text-primary" />
        </div>
        <h3 className="text-xl font-rubik font-bold text-foreground mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-gray-500 max-w-md mx-auto mb-6">{description}</p>
        )}
        {action &&
          (isActionConfig(action) ? (
            <Button onClick={action.onClick} variant="primary" size="lg">
              {action.label}
            </Button>
          ) : (
            action
          ))}
      </div>
    </div>
  );
}

// Preset empty states for common scenarios
export function NoDataEmptyState({
  onAction,
  actionLabel = "הוסף חדש",
}: {
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <EmptyState
      icon="file-text"
      title="אין נתונים להצגה"
      description="עדיין לא נוספו פריטים. לחץ על הכפתור להוספת הראשון."
      action={onAction ? { label: actionLabel, onClick: onAction } : undefined}
    />
  );
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon="search"
      title="לא נמצאו תוצאות"
      description={`לא נמצאו פריטים התואמים ל"${query}". נסה חיפוש אחר.`}
    />
  );
}

export function ErrorEmptyState({
  onRetry,
  message = "אירעה שגיאה בטעינת הנתונים",
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <EmptyState
      icon="alert-circle"
      title="שגיאה"
      description={message}
      action={onRetry ? { label: "נסה שוב", onClick: onRetry } : undefined}
    />
  );
}
