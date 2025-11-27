import SearchBar from '../components/common/SearchBar'
import FilterPills from '../components/common/FilterPills'

export default function LodgingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Alojamiento</h1>
      <p className="text-sm text-slate-500 mb-4">
        Encuentra hoteles, hostales o estancias ecológicas que se ajusten a tu presupuesto y estilo.
      </p>

      <SearchBar placeholder="Ciudad, zona o tipo de alojamiento..." />
      <FilterPills />

      <div className="mt-8 text-slate-400 text-sm">
        (Aquí irán las tarjetas de alojamientos, con fotos, precios y puntuaciones...)
      </div>
    </div>
  )
}
