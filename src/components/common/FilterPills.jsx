const defaultFilters = ['Vegano', 'Turismo ecológico', 'Pet friendly', 'Lujo', 'Bajo costo']

export default function FilterPills({ filters = defaultFilters }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {filters.map(f => (
        <button
          key={f}
          className="px-3 py-1 rounded-full border border-emerald-500 text-emerald-600 text-xs sm:text-sm
                     hover:bg-emerald-500 hover:text-white transition"
        >
          {f}
        </button>
      ))}
    </div>
  )
}
