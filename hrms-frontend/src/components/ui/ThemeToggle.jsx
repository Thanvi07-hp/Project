// components/ThemeToggle.jsx
import { useTheme } from "./ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-md border  bg-gray-100  border-gray-300 dark:bg-gray-900 border-gray-700 mb-5 "
    >
      {theme === "light" ? "🌕 Dark " : "💡Light"}
    </button>
  );
};

export default ThemeToggle;
