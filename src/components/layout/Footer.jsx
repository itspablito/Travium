export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs sm:text-sm py-4 mt-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} Travium. Todos los derechos reservados.</span>
        <span className="text-slate-400">
          Proyecto académico - Gestión de reservas de viajes.
        </span>
      </div>
    </footer>
  )
}
