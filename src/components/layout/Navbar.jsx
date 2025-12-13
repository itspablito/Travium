import React from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

export default function Navbar() {
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
          <Link to="/experiences" className="hover:text-sky-700 transition">Experiencias</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/bookings"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition"
          >
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="text-slate-700">Mis viajes</span>
          </Link>

          <Link
            to="/login"
            className="px-3 py-1.5 rounded-full text-sm bg-sky-600 text-white hover:bg-sky-500 transition"
          >
            Iniciar sesión
          </Link>
        </div>

      </div>
    </header>
  );
}
