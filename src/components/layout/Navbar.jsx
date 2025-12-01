import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-md">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-xl font-extrabold tracking-tight">
          Travium
        </span>
      </Link>

      <div className="hidden md:flex gap-4 text-sm">
        <NavLink to="/flights" className="hover:text-emerald-400">
          Vuelos
        </NavLink>
        <NavLink to="/lodging" className="hover:text-emerald-400">
          Alojamiento
        </NavLink>
        <NavLink to="/vehicles" className="hover:text-emerald-400">
          Vehículos
        </NavLink>
        <NavLink to="/experiences" className="hover:text-emerald-400">
          Tiendas & Restaurantes
        </NavLink>
        <NavLink to="/reservations" className="hover:text-emerald-400">
          Mis reservas
        </NavLink>
      </div>

      {/* ⭐ BOTÓN QUE AHORA REDIRIGE AL LOGIN */}
      <Link
        to="/login"
        className="px-3 py-1.5 text-xs sm:text-sm rounded-full bg-emerald-500 hover:bg-emerald-400 font-semibold"
      >
        Iniciar sesión
      </Link>
    </nav>
  )
}
