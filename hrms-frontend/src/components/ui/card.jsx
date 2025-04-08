import React from "react";

export function Card({ children }) {
  return (
    <div className="rounded-2xl p-4 border shadow-md bg-white dark:bg-gray-800 dark:border-gray-700">
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div className="p-2 text-gray-900 dark:text-gray-100">{children}</div>;
}
