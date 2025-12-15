import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Settings, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md backdrop-blur-sm border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white/70 p-2 shadow-md hover:scale-105 transition-transform">
            <span className="font-extrabold text-xl tracking-tight text-sky-700">Travium</span>
          </div>
          <span className="hidden sm:inline text-sm text-slate-700">
            Explora · Vuela · Descubre
          </span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          {["Inicio", "Vuelos", "Alojamientos", "Vehículos", "Servicios", "Experiencias"].map((item, idx) => (
            <Link
              key={idx}
              to={`/${item.toLowerCase()}`}
              className="relative hover:text-sky-700 transition-colors after:content-[''] after:block after:h-0.5 after:w-0 after:bg-sky-700 after:transition-all hover:after:w-full"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/reservations"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-white/80 backdrop-blur-sm shadow hover:bg-white transition"
          >
            <Calendar className="w-4 h-4 text-sky-700" />
            <span className="text-sky-700 font-medium">Mis viajes</span>
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-sky-600 text-white hover:bg-sky-500 transition shadow-md"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Hola, {user.username}</span>
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden animate-fadeIn scale-up origin-top-right z-50">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                  >
                    <User className="w-4 h-4" />
                    Perfil
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Settings className="w-4 h-4" />
                    Configuración
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-full text-sm bg-sky-600 text-white hover:bg-sky-500 transition shadow-md"
            >
              Iniciar sesión
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-white/30 transition"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden px-6 pb-4 flex flex-col gap-3 text-slate-700 font-medium animate-slideDown">
          {["Inicio", "Vuelos", "Alojamientos", "Vehículos", "Servicios", "Experiencias"].map((item, idx) => (
            <Link
              key={idx}
              to={`/${item.toLowerCase()}`}
              className="px-4 py-2 rounded-lg hover:bg-white/50 transition"
            >
              {item}
            </Link>
          ))}
        </nav>
      )}

      {/* Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {opacity: 0; transform: scale(0.95);}
            to {opacity: 1; transform: scale(1);}
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }

          @keyframes slideDown {
            from {opacity: 0; transform: translateY(-10px);}
            to {opacity: 1; transform: translateY(0);}
          }
          .animate-slideDown { animation: slideDown 0.25s ease-out forwards; }
        `}
      </style>
    </header>
  );
}
