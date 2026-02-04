import { useEffect, useState } from "react";

export default function ThemeToggleButton() {
  const [dark, setDark] = useState(false);

  // initialize from localStorage or system
  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);

    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  return (
   <button
  onClick={toggleTheme}
  className="w-10 h-4 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 transition"
>
  <div
    className={`w-2 h-2 bg-white rounded-full shadow-md transform transition ${
      dark ? "translate-x-6" : ""
    }`}
  />
</button>

  );
}
