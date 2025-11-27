import SearchBar from '../components/common/SearchBar'
import FilterPills from '../components/common/FilterPills'

export default function ExperiencesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">
        Tiendas, restaurantes y experiencias
      </h1>
      <p className="text-sm text-slate-500 mb-4">
        Filtra por vegano, turismo ecológico, comida local, lujo u otras categorías.
      </p>

      <SearchBar placeholder="Nombre del lugar, tipo de comida o experiencia..." />
      <FilterPills />

      <div className="mt-8 text-slate-400 text-sm">
        (Aquí irán las tarjetas de restaurantes, tiendas y actividades según tus filtros...)
      </div>
    </div>
  )
}
