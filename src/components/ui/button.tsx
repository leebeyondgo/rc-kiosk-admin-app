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
      default: "bg-redCrossRed-600 text-white hover:bg-redCrossRed-700 focus:ring-redCrossRed-500",
      ghost: "bg-transparent text-black hover:bg-redCrossWarmGray-100 border border-redCrossWarmGray-300 focus:ring-redCrossWarmGray-300",
      subtle: "bg-redCrossWarmGray-100 text-redCrossWarmGray-800 hover:bg-redCrossWarmGray-200 border border-redCrossWarmGray-300 focus:ring-redCrossWarmGray-300",
      danger: "bg-redCrossRed-100 text-redCrossRed-700 hover:bg-redCrossRed-200 border border-redCrossRed-300 focus:ring-redCrossRed-300",
      soft: "bg-white text-redCrossWarmGray-800 border border-redCrossWarmGray-200 shadow-sm hover:bg-redCrossWarmGray-50 focus:ring-redCrossWarmGray-300"
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
