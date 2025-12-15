import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-[#ffd7e6] to-[#dbeffd] p-2 shadow-sm">
            <span className="font-black text-xl tracking-tight">Travium</span>
          </div>
          <span className="text-sm text-slate-600">
            Todo en uno · Vuelos · Alojamientos · Movilidad
          </span>
        </div>

        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className="hover:text-sky-700 transition">Inicio</Link>
          <Link to="/flights" className="hover:text-sky-700 transition">Vuelos</Link>
          <Link to="/lodging" className="hover:text-sky-700 transition">Alojamientos</Link>
          <Link to="/vehicles" className="hover:text-sky-700 transition">Vehículos</Link>
          <Link to="/services" className="hover:text-sky-700 transition">Servicios</Link>
          <Link to="/experiences" className="hover:text-sky-700 transition">Experiencias</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/reservations"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition"
          >
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="text-slate-700">Mis viajes</span>
          </Link>

          {user ? (
            <div className="relative">
              <button
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-sky-600 text-white hover:bg-sky-500 transition"
              >
                <User className="w-4 h-4" />
                <span>Hola, {user.username}</span>
              </button>
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-50"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <div className="py-1">
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
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-full text-sm bg-sky-600 text-white hover:bg-sky-500 transition"
            >
              Iniciar sesión
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
