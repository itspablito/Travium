import React, { useState, useEffect } from "react";
import { Plane, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { searchFlights, addFlight, updateFlight, deleteFlight } from "../../services/flightsApi";

/**
 * Componente para administrar vuelos
 * Permite crear, editar, eliminar y visualizar vuelos
 */
export default function FlightsAdmin() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Formulario de nuevo vuelo
  const [formData, setFormData] = useState({
    airline: "",
    airline_code: "",
    origin_code: "",
    destination_code: "",
    depart_time: "",
    arrive_time: "",
    duration_minutes: "",
    stops: 0,
    benefits: "",
    basic: "",
    standard: "",
    flexible: "",
    premium: "",
  });

  useEffect(() => {
    loadFlights();
  }, []);

  async function loadFlights() {
    setLoading(true);
    try {
      // Cargar vuelos de ejemplo BOG → MAD
      const data = await searchFlights("BOG", "MAD");
      setFlights(data);
      setError(null);
    } catch (err) {
      setError("Error cargando vuelos. Asegúrate de que el servidor esté corriendo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const flightData = {
        airline: formData.airline,
        airline_code: formData.airline_code,
        origin_code: formData.origin_code,
        destination_code: formData.destination_code,
        depart_time: formData.depart_time,
        arrive_time: formData.arrive_time,
        duration_minutes: parseInt(formData.duration_minutes),
        stops: parseInt(formData.stops),
        benefits: formData.benefits.split(",").map((b) => b.trim()).filter(Boolean),
        fares: {
          basic: parseInt(formData.basic),
          standard: parseInt(formData.standard),
          flexible: parseInt(formData.flexible),
          premium: parseInt(formData.premium),
        },
      };

      if (editingId) {
        await updateFlight(editingId, flightData);
        setEditingId(null);
      } else {
        await addFlight(flightData);
      }

      // Resetear formulario
      setFormData({
        airline: "",
        airline_code: "",
        origin_code: "",
        destination_code: "",
        depart_time: "",
        arrive_time: "",
        duration_minutes: "",
        stops: 0,
        benefits: "",
        basic: "",
        standard: "",
        flexible: "",
        premium: "",
      });

      setShowAddForm(false);
      loadFlights();
      setError(null);
    } catch (err) {
      setError("Error guardando vuelo: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Seguro que quieres eliminar este vuelo?")) return;

    setLoading(true);
    try {
      await deleteFlight(id);
      loadFlights();
      setError(null);
    } catch (err) {
      setError("Error eliminando vuelo: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(flight) {
    setEditingId(flight.id);
    setFormData({
      airline: flight.airline,
      airline_code: flight.airline_code || "",
      origin_code: flight.origin_code,
      destination_code: flight.destination_code,
      depart_time: flight.depart_time,
      arrive_time: flight.arrive_time,
      duration_minutes: flight.duration_minutes.toString(),
      stops: flight.stops.toString(),
      benefits: flight.benefits?.join(", ") || "",
      basic: flight.fares?.basic?.price?.toString() || "",
      standard: flight.fares?.standard?.price?.toString() || "",
      flexible: flight.fares?.flexible?.price?.toString() || "",
      premium: flight.fares?.premium?.price?.toString() || "",
    });
    setShowAddForm(true);
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Administración de Vuelos</h1>
          <p className="text-slate-600 mt-1">Gestiona las opciones de vuelos disponibles</p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setFormData({
              airline: "",
              airline_code: "",
              origin_code: "",
              destination_code: "",
              depart_time: "",
              arrive_time: "",
              duration_minutes: "",
              stops: 0,
              benefits: "",
              basic: "",
              standard: "",
              flexible: "",
              premium: "",
            });
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
        >
          {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showAddForm ? "Cancelar" : "Agregar Vuelo"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Formulario de Agregar/Editar */}
      {showAddForm && (
        <div className="mb-8 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            {editingId ? "Editar Vuelo" : "Nuevo Vuelo"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Aerolínea *
                </label>
                <input
                  type="text"
                  value={formData.airline}
                  onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                  placeholder="ej: LATAM, Viva Air, Iberia"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Código Aerolínea
                </label>
                <input
                  type="text"
                  value={formData.airline_code}
                  onChange={(e) => setFormData({ ...formData, airline_code: e.target.value })}
                  placeholder="ej: LTM, VVA, IBE"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Origen (código IATA) *
                </label>
                <input
                  type="text"
                  value={formData.origin_code}
                  onChange={(e) => setFormData({ ...formData, origin_code: e.target.value.toUpperCase() })}
                  placeholder="ej: BOG"
                  maxLength={3}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Destino (código IATA) *
                </label>
                <input
                  type="text"
                  value={formData.destination_code}
                  onChange={(e) => setFormData({ ...formData, destination_code: e.target.value.toUpperCase() })}
                  placeholder="ej: MAD"
                  maxLength={3}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hora de Salida *
                </label>
                <input
                  type="time"
                  value={formData.depart_time}
                  onChange={(e) => setFormData({ ...formData, depart_time: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hora de Llegada *
                </label>
                <input
                  type="time"
                  value={formData.arrive_time}
                  onChange={(e) => setFormData({ ...formData, arrive_time: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Duración (minutos) *
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  placeholder="ej: 327"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Escalas
                </label>
                <input
                  type="number"
                  value={formData.stops}
                  onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
                  min="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Beneficios (separados por coma)
                </label>
                <input
                  type="text"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="ej: Equipaje mano, Asiento estándar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Tarifas */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Tarifas (COP)</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Basic *
                  </label>
                  <input
                    type="number"
                    value={formData.basic}
                    onChange={(e) => setFormData({ ...formData, basic: e.target.value })}
                    placeholder="258000"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Estándar *
                  </label>
                  <input
                    type="number"
                    value={formData.standard}
                    onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                    placeholder="275000"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Flexible *
                  </label>
                  <input
                    type="number"
                    value={formData.flexible}
                    onChange={(e) => setFormData({ ...formData, flexible: e.target.value })}
                    placeholder="308000"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Premium *
                  </label>
                  <input
                    type="number"
                    value={formData.premium}
                    onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
                    placeholder="426000"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? "Guardando..." : editingId ? "Actualizar" : "Guardar Vuelo"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                }}
                className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Vuelos */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Vuelos Disponibles</h2>
          <p className="text-sm text-slate-600 mt-1">
            {loading ? "Cargando..." : `${flights.length} vuelo(s) encontrado(s)`}
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {flights.length === 0 && !loading ? (
            <div className="p-8 text-center text-slate-500">
              <Plane className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No hay vuelos disponibles. Agrega uno nuevo.</p>
            </div>
          ) : (
            flights.map((flight) => (
              <div key={flight.id} className="p-6 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{flight.airline}</h3>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
                        {flight.airline_code}
                      </span>
                      {flight.stops === 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          Directo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                      <span className="font-semibold">
                        {flight.origin_code} → {flight.destination_code}
                      </span>
                      <span>•</span>
                      <span>
                        {flight.depart_time} - {flight.arrive_time}
                      </span>
                      <span>•</span>
                      <span>{Math.floor(flight.duration_minutes / 60)}h {flight.duration_minutes % 60}m</span>
                      <span>•</span>
                      <span>{flight.stops} escala(s)</span>
                    </div>

                    {flight.benefits && flight.benefits.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {flight.benefits.map((benefit, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-sky-50 text-sky-700 text-xs rounded"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-xs text-slate-600 mb-1">Basic</div>
                        <div className="font-bold text-slate-900">
                          {formatPrice(flight.fares?.basic?.price || 0)}
                        </div>
                      </div>
                      <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                        <div className="text-xs text-sky-600 mb-1">Estándar</div>
                        <div className="font-bold text-sky-900">
                          {formatPrice(flight.fares?.standard?.price || 0)}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-xs text-slate-600 mb-1">Flexible</div>
                        <div className="font-bold text-slate-900">
                          {formatPrice(flight.fares?.flexible?.price || 0)}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-xs text-slate-600 mb-1">Premium</div>
                        <div className="font-bold text-slate-900">
                          {formatPrice(flight.fares?.premium?.price || 0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(flight)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(flight.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
