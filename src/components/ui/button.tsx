import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "subtle" | "danger";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 px-5 py-2.5";

    const variantClasses = {
      default: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md",
      ghost:
        "bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 focus:ring-gray-300 shadow-[0_2px_4px_rgba(0,0,0,0.05),_0_6px_12px_rgba(0,0,0,0.1),_0_12px_24px_rgba(0,0,0,0.2)]",
      subtle:
        "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300 focus:ring-gray-400 shadow-sm",
      danger:
        "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 focus:ring-red-300 shadow-sm",
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
