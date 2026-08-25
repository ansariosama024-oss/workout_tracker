import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { cn } from "../../utils/cn";

const VARIANT_CONFIG = {
  error: {
    container: "border-danger/20 bg-danger-subtle text-danger",
    icon: AlertTriangle,
    role: "alert",
  },
  info: {
    container: "border-primary/20 bg-primary-subtle text-primary",
    icon: Info,
    role: "status",
  },
  success: {
    container: "border-success/20 bg-success-subtle text-success",
    icon: CheckCircle2,
    role: "status",
  },
};

/**
 * Small inline banner for form-level and backend-error messaging (e.g.
 * "invalid credentials", "email already registered", "server
 * unavailable"). Used by the auth pages so error rendering is consistent
 * and never duplicated per-form.
 *
 * @param {"error"|"info"|"success"} [variant]
 */
export function InlineAlert({ variant = "info", className, children }) {
  const { container, icon: Icon, role } = VARIANT_CONFIG[variant];

  return (
    <div
      role={role}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
        container,
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
