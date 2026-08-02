import { useState } from "react";

function Header() {
  const [open, setOpen] = useState(false);
  const[theme, setTheme] = useState("light")
  return (
    <div className={`${theme} min-h-screen text-slate-900 dark:bg-background dark:text-primary`}>
      {/*Navbar*/}
      <div className="flex items-center justify-between p-4">
        <div className="font-bold">Logo</div>

        {/* Desktop Nav*/}
        <div className="hidden sm:flex gap-2">
          <span>Home</span>
          <span>About</span>
          <span>Contact</span>
                          <button className="text-xl cursor-pointer" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                    {theme === "light" ? "💡" : "☀️"}
                </button>
        </div>

        <button className="text-xl cursor-pointer sm:hidden" onClick={() => setOpen(!open)}>=</button>
      </div>

      {/*Mobile Nav*/}
      {open && (
          <div className="flex flex-col items-center p-4 gap-2 text-slate-900  dark:text-white sm:hidden">
                <span>Home</span>
                <span>About</span>
                <span>Contact</span>
                <button className="text-xl cursor-pointer sm:hidden" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                    {theme === "light" ? "💡" : "☀️"}
                </button>
            </div>
    )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 dark:bg-slate-900 text-white p-6 gap-6 text-center font-semibold text-5xl sm:text-sm">
        <div className="bg-slate-500 p-4 rounded hover:bg-slate-600 hover:scale-105 transition-all duration-300">
          Feature one
        </div>
        <div className="bg-slate-500 p-4 rounded hover:bg-slate-600 hover:scale-105">
          Feature Two
        </div>
        <div className="bg-slate-500 p-4 rounded hover:bg-slate-600">
          Feature Three
        </div>
        <div className="bg-slate-500 p-4 rounded hover:bg-slate-600">
          Feature Four
        </div>
        <div className="bg-slate-500 p-4 rounded hover:bg-slate-600">
          Feature Five
        </div>
        <div className="bg-slate-500 p-4 rounded hover:bg-slate-600">
          Feature Six
        </div>
      </div>
    </div>
  );
}

export default Header;
