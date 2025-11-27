export default function SearchBar({ placeholder }) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm sm:text-base
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      />
    </div>
  )
}
