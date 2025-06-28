import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
}

export default function Loader({ className }: LoaderProps) {
  return (
    <div
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-warmGray-300 border-t-redCrossRed",
        className
      )}
    />
  );
}

