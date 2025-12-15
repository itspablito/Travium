import React, { useEffect, useMemo, useState } from "react";
import { Map, X, Search, Check } from "lucide-react";
import LodgingMap from "../../components/lodging/lodgingMap";
import { fetchHotelsByCity } from "../../services/overpassApi";
import { searchCities } from "../../services/nominatimApi";
import { useAuth } from "../../contexts/AuthContext";
import { createLodgingReservation } from "../../services/reservationsApi";
import { createLodgingInvoice } from "../../services/invoicesApi";
import PaymentModal from "../../components/common/PaymentModal";

function daysBetweenISO(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 1;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const ms = b.getTime() - a.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Number.isFinite(days) && days > 0 ? days : 1;
}

export default function LodgingPage() {
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState(null);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const [mapMode, setMapMode] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelTotalPrice, setHotelTotalPrice] = useState(0);

  const nights = useMemo(
    () => daysBetweenISO(checkIn, checkOut),
    [checkIn, checkOut]
  );

  const hasDestination = Boolean(selectedPlace);

  // =========================
  // AUTOCOMPLETE CIUDADES (Nominatim)
  // =========================
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;

    async function loadCities() {
      try {
        const data = await searchCities(query);
        if (!cancelled) setSuggestions(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setSuggestions([]);
      }
    }

    loadCities();
    return () => {
      cancelled = true;
    };
  }, [query]);

  // =========================
  // CARGAR HOTELES (Overpass)
  // =========================
  useEffect(() => {
    if (!selectedPlace) {
      setResults([]);
      return;
    }

    let cancelled = false;

    async function loadHotels() {
      setLoading(true);
      try {
        const hotels = await fetchHotelsByCity(selectedPlace.city);
        if (!cancelled) setResults(hotels);
      } catch (err) {
        console.error(err);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHotels();
    return () => {
      cancelled = true;
    };
  }, [selectedPlace]);

  // =========================
  // MAP MODE
  // =========================
  const toggleMapMode = () => {
    if (!hasDestination) {
      setAlertMsg("Primero selecciona una ciudad para ver hoteles en el mapa.");
      setMapMode(false);
      return;
    }
    setAlertMsg("");
    setMapMode((v) => !v);
  };

  // =========================
  // RESERVAR HOTEL
  // =========================
  const onReserveHotel = async (hotel) => {
    if (!user) {
      alert("Debes iniciar sesión para reservar.");
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Debes seleccionar fechas de check-in y check-out.");
      return;
    }

    const totalPrice = (hotel.basePrice || 50) * nights;
    setSelectedHotel(hotel);
    setHotelTotalPrice(totalPrice);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    setShowPaymentModal(false);
    
    try {
      // 1. Crear la reserva
      const reservation = await createLodgingReservation({
        userId: user.id,
        lodging: {
          id: selectedHotel.osm_id || selectedHotel.osmId,
          name: selectedHotel.name,
          city: selectedHotel.city,
          country: selectedHotel.country || "desconocido",
          address: selectedHotel.address || selectedHotel.name,
          lat: selectedHotel.lat,
          lng: selectedHotel.lon || selectedHotel.lng,
          osm_type: selectedHotel.osm_type || selectedHotel.osmType,
          osm_id: selectedHotel.osm_id || selectedHotel.osmId,
        },
        checkIn,
        checkOut,
        guests,
        totalPrice: hotelTotalPrice,
      });

      // 2. Crear la factura
      await createLodgingInvoice({
        reservation,
        paymentData,
        lodgingData: {
          name: selectedHotel.name,
          city: selectedHotel.city,
          country: selectedHotel.country || "desconocido",
          checkIn,
          checkOut,
          nights,
        },
      });

      alert(`¡Reserva y factura creadas exitosamente! Total: $${hotelTotalPrice} (${nights} noches)`);
    } catch (err) {
      console.error(err);
      alert("Error creando reserva. Por favor intenta de nuevo.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Alojamientos</h1>
          <p className="text-slate-600 mt-1">
            Encuentra hoteles según tu destino, fechas y número de personas.
          </p>
        </div>
        <button
          onClick={toggleMapMode}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-sm transition"
        >
          {mapMode ? <X className="w-4 h-4" /> : <Map className="w-4 h-4" />}
          {mapMode ? "Cerrar mapa" : "Ver en mapa"}
        </button>
      </div>

      {alertMsg && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {alertMsg}
        </div>
      )}

      {/* ========================= */}
      {/* BARRA DE BÚSQUEDA */}
      {/* ========================= */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* DESTINO */}
          <div className="lg:col-span-5 relative">
            <label className="text-xs text-slate-600 font-semibold">Destino</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedPlace(null);
                  setMapMode(false);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                placeholder="Ciudad o destino..."
                className="w-full outline-none text-sm"
              />
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border bg-white shadow">
                {suggestions.map((p) => (
                  <button
                    key={`${p.lat}-${p.lon}`}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedPlace(p);
                      setQuery(`${p.city}, ${p.country}`);
                      setShowSuggestions(false);
                      setMapMode(true);
                      setAlertMsg("");
                    }}
                  >
                    <div className="font-medium">{p.city}</div>
                    <div className="text-xs text-slate-500">{p.country}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CHECK-IN */}
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold">Check-in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          {/* CHECK-OUT */}
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold">Check-out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          {/* PERSONAS */}
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold">Personas</label>
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value || 1))}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          {/* INFO NOCHE / PERSONAS */}
          <div className="lg:col-span-1 text-xs text-slate-600">
            <div className="font-semibold">{nights} noche(s)</div>
            <div>{guests} persona(s)</div>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* RESULTADOS */}
      {/* ========================= */}
      <div className={`grid gap-6 ${mapMode ? "lg:grid-cols-12" : ""}`}>
        {mapMode && hasDestination && (
          <div className="lg:col-span-8">
            <LodgingMap
              hotels={results}
              guests={guests}
              nights={nights}
              onSelectHotel={(h) => console.log("Seleccionado:", h)}
              focus={selectedPlace}
            />
          </div>
        )}

        <div className={mapMode ? "lg:col-span-4" : ""}>
          <div className="grid gap-4">
            {loading && <p className="text-slate-600">Buscando hoteles...</p>}
            {!hasDestination && !loading && <p className="text-slate-600">Selecciona una ciudad para buscar hoteles.</p>}
            {hasDestination && !loading && results.length === 0 && <p className="text-slate-600">No se encontraron hoteles.</p>}

            {results.map((h) => (
              <div key={h.id} className="bg-white border rounded-2xl p-4 shadow hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg">{h.name}</h3>
                  <p className="text-sm text-slate-600">{h.city}{h.country && `, ${h.country}`}</p>
                  <p className="text-sm text-slate-600 mt-1">Precio base: COP {h.basePrice}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => onReserveHotel(h)}
                    className="px-3 py-1 rounded-lg bg-sky-600 text-white hover:bg-sky-500 text-sm"
                  >
                    Reservar
                  </button>
                  <a
                    href={`https://www.openstreetmap.org/${h.osm_type}/${h.osm_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                  >
                    Ver alojamiento
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={hotelTotalPrice}
        onPaymentSuccess={handlePaymentSuccess}
        purchaseData={{
          type: 'alojamiento',
          description: selectedHotel ? `${selectedHotel.name} - ${selectedHotel.city} - ${nights} noche${nights > 1 ? 's' : ''}` : '',
        }}
      />
    </div>
  );
}
