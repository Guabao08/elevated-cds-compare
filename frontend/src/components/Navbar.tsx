import { Link, useLocation } from "react-router-dom";
import { BookOpen, BarChart2, GitCompare, Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCompare } from "../context/CompareContext";

const NAV_LINKS = [
  { to: "/search", label: "Explore Schools", icon: BookOpen },
  { to: "/compare", label: "Compare", icon: GitCompare },
  { to: "/recommend", label: "Get Recommendations", icon: Sparkles },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { compareIds } = useCompare();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-green-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-orange flex items-center justify-center">
              <BarChart2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-base leading-tight">
              Elevated<br />
              <span className="text-green-300 font-normal text-xs tracking-wider uppercase">CDS Dashboard</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const active = pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-green-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                  {to === "/compare" && compareIds.length > 0 && (
                    <span className="bg-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {compareIds.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-green-100 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
