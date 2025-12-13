import React, { useMemo, useState } from "react";
import { Map, X, Users, CalendarDays, Search } from "lucide-react";
import LodgingMap from "../../components/lodging/lodgingMap";

/** Datos mock (luego los cambias por backend) */
const HOTELS = [
  { id: 1, name: "Skyline Suites", city: "New York", country: "USA", lat: 40.758, lng: -73.9855, pricePerNightPerPerson: 100 },
  { id: 2, name: "Centro Histórico Inn", city: "Bogotá", country: "Colombia", lat: 4.7109, lng: -74.0721, pricePerNightPerPerson: 35 },
  { id: 3, name: "Ocean Breeze Hotel", city: "Cancún", country: "México", lat: 21.1619, lng: -86.8515, pricePerNightPerPerson: 60 },
  { id: 4, name: "Eiffel Stay", city: "Paris", country: "France", lat: 48.8566, lng: 2.3522, pricePerNightPerPerson: 85 },
];

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
  const [showSuggestions, setShowSuggestions] = useState(false);

  // fechas y personas
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  // modo mapa
  const [mapMode, setMapMode] = useState(false);

  const nights = useMemo(() => daysBetweenISO(checkIn, checkOut), [checkIn, checkOut]);

  // sugerencias simples (puedes reemplazar por tu API)
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [
      "New York",
      "Bogotá",
      "Cancún",
      "Paris",
      "Hoteles ecológicos",
      "Cerca del centro",
    ];
    const base = ["New York", "Bogotá", "Cancún", "Paris", "Hoteles ecológicos", "Cerca del centro"];
    return base.filter((s) => s.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  // “búsqueda” mock: filtra por ciudad o texto en nombre
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? HOTELS
      : HOTELS.filter((h) =>
          `${h.name} ${h.city} ${h.country}`.toLowerCase().includes(q)
        );

    // calcula total
    return filtered.map((h) => ({
      ...h,
      total: Math.max(1, guests) * Math.max(1, nights) * h.pricePerNightPerPerson,
    }));
  }, [query, guests, nights]);

  const onSelectHotel = (hotel) => {
    // aquí luego puedes navegar a detalle /checkout etc.
    console.log("Seleccionado:", hotel);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Alojamiento</h1>
          <p className="text-sm text-slate-600 mt-1">
            Encuentra hoteles, hostales o estancias ecológicas que se ajusten a tu presupuesto y estilo.
          </p>
        </div>

        <button
          onClick={() => setMapMode((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-sm transition"
        >
          {mapMode ? <X className="w-4 h-4" /> : <Map className="w-4 h-4" />}
          {mapMode ? "Cerrar mapa" : "Buscar por mapa"}
        </button>
      </div>

      {/* Barra tipo Airbnb: destino + fechas + personas */}
      <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-3 sm:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Destino */}
          <div className="lg:col-span-5 relative">
            <label className="text-xs text-slate-600 font-semibold">Destino</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-500">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                placeholder="Ciudad, zona o tipo de alojamiento..."
                className="w-full outline-none text-sm text-slate-900 placeholder-slate-400"
              />
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setQuery(s);
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="text-slate-900 font-medium">{s}</div>
                    <div className="text-xs text-slate-500">Sugerencia</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Check-in */}
          <div className="lg:col-span-2">
            <label className="text-xs text-slate-600 font-semibold inline-flex items-center gap-1">
              <CalendarDays className="w-4 h-4" /> Check-in
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Check-out */}
          <div className="lg:col-span-2">
            <label className="text-xs text-slate-600 font-semibold inline-flex items-center gap-1">
              <CalendarDays className="w-4 h-4" /> Check-out
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Personas */}
          <div className="lg:col-span-2">
            <label className="text-xs text-slate-600 font-semibold inline-flex items-center gap-1">
              <Users className="w-4 h-4" /> Personas
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value || 1))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1 flex lg:justify-end">
            <div className="text-xs text-slate-600">
              <div className="font-semibold text-slate-900">{nights} noche(s)</div>
              <div>{guests} persona(s)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido: Mapa + listado */}
      <div className={`mt-6 grid gap-6 ${mapMode ? "lg:grid-cols-12" : ""}`}>
        {mapMode && (
          <div className="lg:col-span-8">
            <LodgingMap
              hotels={results}
              guests={guests}
              nights={nights}
              onSelectHotel={onSelectHotel}
            />
            <p className="mt-2 text-xs text-slate-500">
              Tip: haz zoom para explorar. Las burbujas muestran el <b>total</b> según noches y personas.
            </p>
          </div>
        )}

        <div className={mapMode ? "lg:col-span-4" : ""}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Resultados</h2>
              <span className="text-xs text-slate-500">{results.length} encontrados</span>
            </div>

            <div className="mt-4 space-y-3">
              {results.map((h) => (
                <button
                  key={h.id}
                  onClick={() => onSelectHotel(h)}
                  className="w-full text-left rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition"
                >
                  <div className="font-semibold text-slate-900">{h.name}</div>
                  <div className="text-sm text-slate-600">{h.city}, {h.country}</div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="text-xs text-slate-500">
                      ${h.pricePerNightPerPerson}/noche/persona · {guests}p · {nights}n
                    </div>
                    <div className="font-bold text-slate-900">${h.total}</div>
                  </div>
                </button>
              ))}

              {results.length === 0 && (
                <div className="text-sm text-slate-600">
                  No hay resultados para tu búsqueda.
                </div>
              )}
            </div>
          </div>

          {!mapMode && (
            <div className="mt-4 text-sm text-slate-500">
              (Aquí luego puedes poner tus filtros avanzados y tarjetas pro.)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
