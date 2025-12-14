import React, { useEffect, useMemo, useState } from "react";
import { Map, X, Users, CalendarDays, Search } from "lucide-react";
import LodgingMap from "../../components/lodging/lodgingMap";
import { fetchHotelsByCity } from "../../services/overpassApi";
import { searchCities } from "../../services/nominatimApi";

function daysBetweenISO(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 1;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const ms = b.getTime() - a.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Number.isFinite(days) && days > 0 ? days : 1;
}

export default function LodgingPage() {
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

  const nights = useMemo(
    () => daysBetweenISO(checkIn, checkOut),
    [checkIn, checkOut]
  );

  const hasDestination = Boolean(selectedPlace);

  /* =========================
     🔹 AUTOCOMPLETE CIUDADES
     (Nominatim)
  ========================= */
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

  /* =========================
     🔹 BUSCAR HOTELES
     (Overpass)
  ========================= */
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

  const toggleMapMode = () => {
    if (!hasDestination) {
      setAlertMsg(
        "Primero selecciona una ciudad para ver hoteles en el mapa."
      );
      setMapMode(false);
      return;
    }
    setAlertMsg("");
    setMapMode((v) => !v);
  };

  const onSelectHotel = (hotel) => {
    console.log("Seleccionado:", hotel);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Alojamiento
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Encuentra hoteles según tu destino, fechas y personas.
          </p>
        </div>

        <button
          onClick={toggleMapMode}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-sm transition"
        >
          {mapMode ? <X className="w-4 h-4" /> : <Map className="w-4 h-4" />}
          {mapMode ? "Cerrar mapa" : "Buscar por mapa"}
        </button>
      </div>

      {alertMsg && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {alertMsg}
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Destino */}
          <div className="lg:col-span-5 relative">
            <label className="text-xs text-slate-600 font-semibold">
              Destino
            </label>
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
                    <div className="text-xs text-slate-500">
                      {p.country}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Check-in */}
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold">Check-in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          {/* Check-out */}
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold">Check-out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          {/* Personas */}
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

          <div className="lg:col-span-1 text-xs text-slate-600">
            <div className="font-semibold">{nights} noche(s)</div>
            <div>{guests} persona(s)</div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className={`mt-6 grid gap-6 ${mapMode ? "lg:grid-cols-12" : ""}`}>
        {mapMode && hasDestination && (
          <div className="lg:col-span-8">
            <LodgingMap
              hotels={results}
              guests={guests}
              nights={nights}
              onSelectHotel={onSelectHotel}
              focus={selectedPlace}
            />
          </div>
        )}

        <div className={mapMode ? "lg:col-span-4" : ""}>
          <div className="bg-white border rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold">Resultados</h2>

            {loading && (
              <div className="mt-3 text-sm text-slate-600">
                Buscando hoteles…
              </div>
            )}

            {!hasDestination && (
              <div className="mt-3 text-sm text-slate-600">
                Selecciona una ciudad para buscar hoteles.
              </div>
            )}

            {hasDestination && !loading && results.length === 0 && (
              <div className="mt-3 text-sm text-slate-600">
                No se encontraron hoteles.
              </div>
            )}

            <div className="mt-3 space-y-3">
              {results.map((h) => (
                <button
                  key={h.id}
                  onClick={() => onSelectHotel(h)}
                  className="w-full text-left rounded-xl border p-3 hover:bg-slate-50"
                >
                  <div className="font-semibold">{h.name}</div>
                  <div className="text-sm text-slate-600">
                    {h.city} {h.country && `, ${h.country}`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
