import SearchBar from '../components/common/SearchBar'
import FilterPills from '../components/common/FilterPills'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <section className="max-w-6xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-2 items-center">
        {/* Hero */}
        <div className="space-y-4">
          <p className="text-emerald-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em]">
            Plataforma de reservas inteligentes
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
            Planifica tus vuelos, alojamientos y experiencias en un solo lugar.
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Travium te ayuda a encontrar vuelos, hoteles, vehículos de alquiler y restaurantes
            alineados con tu estilo de viaje: vegano, ecológico, low cost o de lujo.
          </p>

          <div className="space-y-3">
            <SearchBar placeholder="Buscar ciudad, país o destino..." />
            <FilterPills />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/flights"
              className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-sm font-semibold"
            >
              Buscar vuelos
            </Link>
            <Link
              to="/lodging"
              className="px-4 py-2 rounded-full border border-slate-500 text-sm hover:border-emerald-400"
            >
              Ver alojamientos
            </Link>
          </div>
        </div>

        {/* Cards resumen secciones */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FeatureCard title="Vuelos" description="Explora rutas y compara precios en tiempo real." />
          <FeatureCard title="Alojamiento" description="Hoteles, hostales y estancias eco-friendly." />
          <FeatureCard title="Vehículos" description="Alquila autos o transporte local al instante." />
          <FeatureCard title="Tiendas & restaurantes" description="Encuentra opciones veganas, locales y sostenibles." />
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ title, description }) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-700 p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-300">{description}</p>
    </div>
  )
}
