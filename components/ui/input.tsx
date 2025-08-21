// components/ui/input.tsx
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { className?: string };

export function Input({ className = "", ...props }: Props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${className}`}
    />
  );
}
