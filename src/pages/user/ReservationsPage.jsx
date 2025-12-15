import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllReservations } from '../../services/reservationsApi';

export default function ReservationsPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('todas');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReservations();
  }, [user]);

  const loadReservations = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getAllReservations({ user_id: user.id });
      setReservations(data || []);
    } catch (err) {
      console.error('Error cargando reservas:', err);
      setError('No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = activeFilter === 'todas'
    ? reservations
    : reservations.filter(r => {
        if (activeFilter === 'vuelos') return r.tipo_reserva === 'vuelo';
        if (activeFilter === 'alojamiento') return r.tipo_reserva === 'alojamiento';
        if (activeFilter === 'vehiculos') return r.tipo_reserva === 'vehiculo';
        return true;
      });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (estado) => {
    const colors = {
      'confirmada': 'bg-green-100 text-green-800',
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'cancelada': 'bg-red-100 text-red-800',
      'completada': 'bg-blue-100 text-blue-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (tipo) => {
    if (tipo === 'vuelo') return '✈️';
    if (tipo === 'alojamiento') return '🏨';
    if (tipo === 'vehiculo') return '🚗';
    return '📋';
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-500">Debes iniciar sesión para ver tus reservas</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Mis Reservas</h1>
      <p className="text-sm text-slate-500 mb-6">
        Aquí verás el resumen de tus vuelos, alojamientos, vehículos y experiencias reservadas.
      </p>

      {/* Filtros */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['todas', 'vuelos', 'alojamiento', 'vehiculos'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full capitalize ${
              activeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Estados de carga */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">Cargando reservas...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button onClick={loadReservations} className="ml-4 underline">
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de Reservas */}
      {!loading && !error && (
        <>
          {filteredReservations.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
              <p className="text-lg">No tienes reservas {activeFilter !== 'todas' && `de ${activeFilter}`}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredReservations.map((reserva) => (
                <div
                  key={reserva.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTypeIcon(reserva.tipo_reserva)}</span>
                      <span className="font-semibold text-gray-700 capitalize">
                        {reserva.tipo_reserva}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reserva.estado)}`}>
                      {reserva.estado}
                    </span>
                  </div>

                  {/* Producto */}
                  <h3 className="text-lg font-bold mb-2 text-gray-900">
                    {reserva.nombre_producto || 'Sin nombre'}
                  </h3>

                  {/* Detalles */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Código:</span>
                      <span className="font-mono text-xs">{reserva.codigo_reserva}</span>
                    </div>
                    
                    {reserva.fecha_inicio && (
                      <div className="flex justify-between">
                        <span>Inicio:</span>
                        <span className="font-medium">{formatDate(reserva.fecha_inicio)}</span>
                      </div>
                    )}
                    
                    {reserva.fecha_fin && (
                      <div className="flex justify-between">
                        <span>Fin:</span>
                        <span className="font-medium">{formatDate(reserva.fecha_fin)}</span>
                      </div>
                    )}

                    {reserva.cantidad_personas && (
                      <div className="flex justify-between">
                        <span>Personas:</span>
                        <span className="font-medium">{reserva.cantidad_personas}</span>
                      </div>
                    )}
                  </div>

                  {/* Precio */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(reserva.total_price)}
                      </span>
                    </div>
                  </div>

                  {/* Fecha de creación */}
                  <div className="mt-3 text-xs text-gray-400 text-right">
                    Reservado el {formatDate(reserva.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
