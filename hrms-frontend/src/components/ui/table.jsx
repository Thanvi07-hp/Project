import React from "react";

export const Table = ({ children, className = "" }) => {
  return <table className={`w-full border-collapse ${className}`}>{children}</table>;
};

export const TableHeader = ({ children }) => {
  return <thead className="dark:bg-gray-800 dark:text-white">{children}</thead>;
};

export const TableRow = ({ children, className = "" }) => {
  return <tr className={`border-b ${className}`}>{children}</tr>;
};

export const TableHead = ({ children, className = "" }) => {
  return <th className={`px-4 py-2 text-left font-semibold ${className}`}>{children}</th>;
};

export const TableBody = ({ children }) => {
  return <tbody>{children}</tbody>;
};

export const TableCell = ({ children, className = "" }) => {
  return <td className={`px-4 py-2 ${className}`}>{children}</td>;
};
