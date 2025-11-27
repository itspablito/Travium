import SearchBar from '../../components/common/SearchBar';
import FilterPills from '../../components/common/FilterPills';

export default function FlightsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Buscar vuelos</h1>
      <p className="text-sm text-slate-500 mb-4">
        Configura tu origen, destino, fechas y preferencias para encontrar el vuelo ideal.
      </p>

      <SearchBar placeholder="Origen, destino o aerolínea..." />
      <FilterPills />

      {/* Aquí luego irán los filtros avanzados y la lista de resultados */}
      <div className="mt-8 text-slate-400 text-sm">
        (Aquí mostraremos los resultados de vuelos con filtros, precios y horarios...)
      </div>
    </div>
  )
}
