
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "subtle" | "danger" | "outline" | "secondary";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 px-5 py-2.5 border";

    const variantClasses = {
      default: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md border-transparent",
      ghost: "bg-white text-gray-800 hover:bg-gray-50 border-gray-300 focus:ring-gray-300 shadow-sm",
      subtle: "bg-gray-200 text-gray-800 hover:bg-gray-300 border-gray-300 focus:ring-gray-400 shadow-sm",
      danger: "bg-red-100 text-red-700 hover:bg-red-200 border-red-300 focus:ring-red-300 shadow-sm",
      outline: "bg-transparent text-red-600 hover:bg-red-50 border-red-600 focus:ring-red-500 shadow-sm",
      secondary: "bg-blue-600 text-white hover:bg-blue-700 border-transparent focus:ring-blue-500 shadow-md"
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
