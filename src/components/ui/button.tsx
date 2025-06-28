import * as React from "react";
import { cn } from "@/lib/utils";

export type Variant =
  | "default"
  | "ghost"
  | "subtle"
  | "danger"
  | "soft"
  | "outline"
  | "destructive";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 px-4 py-2";

    const variantClasses: Record<Variant, string> = {
      default:
        "bg-redCrossRed text-white hover:bg-redCrossRed focus:ring-redCrossRed",
      ghost:
        "bg-transparent text-black hover:bg-warmGray-100 border border-warmGray-300 focus:ring-warmGray-300",
      subtle:
        "bg-warmGray-100 text-warmGray-800 hover:bg-warmGray-200 border border-warmGray-300 focus:ring-warmGray-300",
      danger:
        "bg-redCrossRed/10 text-redCrossRed hover:bg-redCrossRed/20 border border-redCrossRed/30 focus:ring-redCrossRed/30",
      soft:
        "bg-white text-warmGray-800 border border-warmGray-200 shadow-sm hover:bg-warmGray-50 focus:ring-warmGray-300",
      outline:
        "border border-redCrossWarmGray text-black hover:bg-redCrossWarmGray-50 focus:ring-redCrossWarmGray",
      destructive: "bg-redCrossRed text-white hover:bg-redCrossRed/80"
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
