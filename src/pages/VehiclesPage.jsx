import SearchBar from '../components/common/SearchBar'

export default function VehiclesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Alquiler de vehículos</h1>
      <p className="text-sm text-slate-500 mb-4">
        Reserva autos, motos o transporte local según tu destino y fechas de viaje.
      </p>

      <SearchBar placeholder="Ciudad de recogida, fechas, tipo de vehículo..." />

      <div className="mt-8 text-slate-400 text-sm">
        (Aquí irán las opciones de vehículos, proveedores, precios y condiciones...)
      </div>
    </div>
  )
}
