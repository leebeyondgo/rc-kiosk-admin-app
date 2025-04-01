import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "subtle" | "danger" | "soft";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 px-4 py-2";

    const variantClasses = {
      default: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      ghost: "bg-transparent text-black hover:bg-gray-100 border border-gray-300 focus:ring-gray-300",
      subtle: "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 focus:ring-gray-300",
      danger: "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 focus:ring-red-300",
      soft: "bg-white text-gray-800 border border-gray-200 shadow-sm hover:bg-gray-50 focus:ring-gray-300"
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
