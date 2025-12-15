import React, { useMemo, useState, useEffect } from "react";
import {
  ArrowLeftRight,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Clock,
  Filter,
  MapPin,
  Plane,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  Users,
  Bell,
  BadgeDollarSign,
  ArrowRight,
  X,
  Plus,
  Check,
} from "lucide-react";
import { searchFlights } from "../../services/flightsApi";
import { createFlightReservation } from "../../services/reservationsApi";
import { createFlightInvoice } from "../../services/invoicesApi";
import PaymentModal from "../../components/common/PaymentModal";

/* =========================================================
   MOCK DATA (luego lo reemplazas por tu backend)
========================================================= */

const AIRPORTS = [
  { code: "BOG", city: "Bogotá", name: "El Dorado", country: "Colombia" },
  { code: "MDE", city: "Medellín", name: "José María Córdova", country: "Colombia" },
  { code: "CLO", city: "Cali", name: "Alfonso Bonilla Aragón", country: "Colombia" },
  { code: "CTG", city: "Cartagena", name: "Rafael Núñez", country: "Colombia" },
  { code: "MIA", city: "Miami", name: "Miami Intl", country: "USA" },
  { code: "JFK", city: "New York", name: "JFK", country: "USA" },
  { code: "LAX", city: "Los Angeles", name: "LAX", country: "USA" },
  { code: "MAD", city: "Madrid", name: "Barajas", country: "España" },
  { code: "BCN", city: "Barcelona", name: "El Prat", country: "España" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "Francia" },
  { code: "CUN", city: "Cancún", name: "Cancún Intl", country: "México" },
];

const AIRLINES = [
  { id: "AVA", name: "Avianca" },
  { id: "LTM", name: "LATAM" },
  { id: "VVA", name: "Viva Air" },
  { id: "AMX", name: "Aeroméxico" },
  { id: "IBE", name: "Iberia" },
  { id: "DLT", name: "Delta" },
];

const PROMOS = [
  { id: 1, from: "BOG", to: "CUN", label: "Más barato", tag: "🔥", priceFrom: 180, months: "Mar - Abr" },
  { id: 2, from: "BOG", to: "MIA", label: "Oferta", tag: "💸", priceFrom: 220, months: "Feb - Mar" },
  { id: 3, from: "CLO", to: "MAD", label: "Recomendado", tag: "⭐", priceFrom: 540, months: "Abr - May" },
  { id: 4, from: "MDE", to: "JFK", label: "Más barato", tag: "🔥", priceFrom: 310, months: "Mar - May" },
];

function formatAirport(a) {
  if (!a) return "";
  return `${a.city} (${a.code}) · ${a.name}`;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(d) {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysBetweenISO(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 1;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const ms = b.getTime() - a.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Number.isFinite(days) && days > 0 ? days : 1;
}

function money(n) {
  return `$${Math.round(n)}`;
}

/* =========================================================
   GENERADOR MOCK: precios por día y resultados
========================================================= */

function generatePriceGrid(monthBaseDate, seed = 1) {
  const year = monthBaseDate.getFullYear();
  const month = monthBaseDate.getMonth();
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay(); // 0 domingo
  const start = addDays(first, -startWeekday);

  const grid = [];
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i);
    const dayFactor = (d.getDate() * 17 + (month + 1) * 19 + seed * 23) % 100;
    const base = 120 + dayFactor * 4;
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 60 : 0;
    const price = base + weekend;
    min = Math.min(min, price);
    max = Math.max(max, price);
    grid.push({ date: d, iso: toISODate(d), price });
  }

  return { grid, min, max };
}

function mockFlightResults({ from, to, departDate, returnDate, passengers, cabin, nonStopOnly }) {
  const base = 150 + (from?.code?.charCodeAt(0) ?? 60) + (to?.code?.charCodeAt(0) ?? 80);
  const pax = Math.max(1, passengers.total);

  const cabinMultiplier =
    cabin === "Economy" ? 1 :
    cabin === "Premium Economy" ? 1.35 :
    cabin === "Business" ? 2.2 :
    3.2;

  const daysToDepart = departDate
    ? Math.max(1, Math.round((new Date(departDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 20;

  const urgency = daysToDepart < 10 ? 1.18 : daysToDepart < 25 ? 1.0 : 0.92;

  const list = [];
  for (let i = 0; i < 10; i++) {
    const airline = AIRLINES[i % AIRLINES.length];
    const stops = nonStopOnly ? 0 : (i % 4 === 0 ? 0 : i % 4 === 1 ? 1 : 2);
    const durationMin = 240 + i * 22 + stops * 65;
    const depHour = 6 + (i * 2) % 16;
    const dep = `${String(depHour).padStart(2, "0")}:${i % 2 === 0 ? "15" : "45"}`;
    const arr = `${String((depHour + Math.floor(durationMin / 60)) % 24).padStart(2, "0")}:${durationMin % 2 === 0 ? "10" : "35"}`;

    const stopsPenalty = stops === 0 ? 1.0 : stops === 1 ? 0.92 : 0.85;
    const random = 0.88 + ((i * 7) % 10) / 50;

    const total =
      base *
      pax *
      cabinMultiplier *
      urgency *
      stopsPenalty *
      random;

    const tags = [];
    if (i === 0) tags.push({ kind: "best", text: "Mejor opción" });
    if (stops === 0 && i < 4) tags.push({ kind: "fast", text: "Más rápido" });
    if (total < base * pax * cabinMultiplier * 0.95) tags.push({ kind: "cheap", text: "Mejor precio" });

    list.push({
      id: `${airline.id}-${i}`,
      airline: airline.name,
      from: from?.code ?? "—",
      to: to?.code ?? "—",
      depart: dep,
      arrive: arr,
      durationMin,
      stops,
      benefits: stops === 0 ? ["Equipaje mano", "Asiento estándar"] : ["Equipaje mano"],
      fareTiers: {
        basic: total * 0.94,
        standard: total,
        flexible: total * 1.12,
        premium: total * 1.55,
      },
      total,
      tags,
    });
  }
  return list.sort((a, b) => a.total - b.total);
}

/* =========================================================
   MULTIDEST: helpers
========================================================= */

function newLeg() {
  return {
    from: null,
    to: null,
    date: "",
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function FlightsPage() {
  const [tripType, setTripType] = useState("roundtrip"); // oneway | roundtrip | multidest

  // Single route state (oneway/roundtrip)
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [departDate, setDepartDate] = useState(toISODate(addDays(new Date(), 21)));
  const [returnDate, setReturnDate] = useState(toISODate(addDays(new Date(), 28)));

  // Multidest state (list of legs)
  const [legs, setLegs] = useState([
    { from: null, to: null, date: toISODate(addDays(new Date(), 21)) },
    { from: null, to: null, date: toISODate(addDays(new Date(), 25)) },
  ]);

  // Shared state
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [cabin, setCabin] = useState("Economy");

  const [showFromSug, setShowFromSug] = useState(false);
  const [showToSug, setShowToSug] = useState(false);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState("depart"); // depart | return
  const [showCheapestMonth, setShowCheapestMonth] = useState(false);

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filters
  const [priceMax, setPriceMax] = useState(5000000); // Aumentado para vuelos internacionales
  const [durationMax, setDurationMax] = useState(24); // horas
  const [stopsFilter, setStopsFilter] = useState("any"); // any | nonstop | onestop | twoplus
  const [selectedAirlines, setSelectedAirlines] = useState(new Set());
  const [timeBand, setTimeBand] = useState("any"); // any | morning | afternoon | night

  // Money saving feature
  const [priceAlert, setPriceAlert] = useState(false);

  // Real flights from database
  const [realFlights, setRealFlights] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [availableAirports, setAvailableAirports] = useState([]);

  // Get unique airlines from real flights
  const availableAirlines = useMemo(() => {
    const airlines = new Set();
    realFlights.forEach(flight => {
      if (flight.aerolinea) {
        airlines.add(flight.aerolinea);
      }
    });
    return Array.from(airlines).map(name => ({ id: name.toLowerCase(), name }));
  }, [realFlights]);

  const paxTotal = passengers.adults + passengers.children + passengers.infants;

  const fromSuggestions = useMemo(() => {
    const q = fromQuery.trim().toLowerCase();
    const airportsToUse = availableAirports.length > 0 ? availableAirports : AIRPORTS;
    
    if (!q) return airportsToUse.slice(0, 7);
    return airportsToUse
      .filter((a) => `${a.code} ${a.city} ${a.name} ${a.country}`.toLowerCase().includes(q))
      .slice(0, 7);
  }, [fromQuery, availableAirports]);

  const toSuggestions = useMemo(() => {
    const q = toQuery.trim().toLowerCase();
    const airportsToUse = availableAirports.length > 0 ? availableAirports : AIRPORTS;
    
    if (!q) return airportsToUse.slice(0, 7);
    return airportsToUse
      .filter((a) => `${a.code} ${a.city} ${a.name} ${a.country}`.toLowerCase().includes(q))
      .slice(0, 7);
  }, [toQuery, availableAirports]);

  // Which route is used to generate mock results?
  // In Multidest we use the first leg as "reference" until backend exists.
  const activeFrom = tripType === "multidest" ? legs?.[0]?.from : from;
  const activeTo = tripType === "multidest" ? legs?.[0]?.to : to;
  const activeDepartDate = tripType === "multidest" ? legs?.[0]?.date : departDate;
  const activeReturnDate = tripType === "roundtrip" ? returnDate : null;

  // Load real flights from database
  useEffect(() => {
    async function loadFlights() {
      setLoadingFlights(true);
      try {
        let flights;
        if (!activeFrom?.code && !activeTo?.code) {
          // Si no hay origen ni destino, traer todos los vuelos
          const response = await fetch('http://localhost:3002/api/flights');
          const data = await response.json();
          flights = data.flights;
        } else if (activeFrom?.code && activeTo?.code) {
          // Si hay origen y destino, buscar específicamente
          flights = await searchFlights(activeFrom.code, activeTo.code);
        } else {
          // Si solo hay uno de los dos, no buscar nada
          flights = [];
        }
        setRealFlights(flights || []);
      } catch (error) {
        console.error("Error cargando vuelos:", error);
        setRealFlights([]);
      } finally {
        setLoadingFlights(false);
      }
    }

    loadFlights();
  }, [activeFrom?.code, activeTo?.code]);

  // Load all flights to get available airports
  useEffect(() => {
    async function loadAirports() {
      try {
        const response = await fetch('http://localhost:3002/api/flights');
        const data = await response.json();
        
        // Extract unique airports from flights
        const airportsMap = new Map();
        
        data.flights.forEach(flight => {
          // Add origin airport
          if (flight.aeropuerto_origen && flight.ciudad_origen) {
            const key = flight.aeropuerto_origen;
            if (!airportsMap.has(key)) {
              airportsMap.set(key, {
                code: flight.aeropuerto_origen,
                city: flight.ciudad_origen,
                name: flight.aeropuerto_origen,
                country: flight.pais_origen || ''
              });
            }
          }
          
          // Add destination airport
          if (flight.aeropuerto_destino && flight.ciudad_destino) {
            const key = flight.aeropuerto_destino;
            if (!airportsMap.has(key)) {
              airportsMap.set(key, {
                code: flight.aeropuerto_destino,
                city: flight.ciudad_destino,
                name: flight.aeropuerto_destino,
                country: flight.pais_destino || ''
              });
            }
          }
        });
        
        setAvailableAirports(Array.from(airportsMap.values()));
      } catch (error) {
        console.error("Error cargando aeropuertos:", error);
      }
    }

    loadAirports();
  }, []);

  const calendar = useMemo(
    () =>
      generatePriceGrid(
        calendarMonth,
        (activeFrom?.code?.charCodeAt(0) ?? 1) + (activeTo?.code?.charCodeAt(0) ?? 2)
      ),
    [calendarMonth, activeFrom, activeTo]
  );

  const cheapInsight = useMemo(() => {
    return "Este vuelo suele ser más barato si viajas un martes o miércoles.";
  }, []);

  const nonStopOnly = stopsFilter === "nonstop";

  // Convert real flights from DB to the format expected by the UI
  const resultsRaw = useMemo(() => {
    if (realFlights.length > 0) {
      // Use real flights from database (tabla vuelos)
      const flights = realFlights.map((flight) => ({
        id: `flight-${flight.id}`,
        dbId: flight.id, // ID numérico real de la base de datos
        airline: flight.aerolinea || "Aerolínea",
        from: flight.aeropuerto_origen || activeFrom?.code,
        to: flight.aeropuerto_destino || activeTo?.code,
        depart: flight.hora_salida || "00:00",
        arrive: flight.hora_llegada || "00:00",
        durationMin: flight.duracion_minutos || 0,
        stops: flight.numero_escalas || 0,
        benefits: flight.beneficios ? (Array.isArray(flight.beneficios) ? flight.beneficios : [flight.beneficios]) : [],
        fareTiers: {
          basic: flight.precio_basico || 0,
          standard: flight.precio_estandar || 0,
          flexible: flight.precio_flexible || 0,
          premium: flight.precio_premium || 0,
        },
        total: flight.precio_estandar || 0,
        tags: [],
      }));

      // Agregar tags según los criterios
      if (flights.length > 0) {
        // Encontrar el más barato
        const cheapest = flights.reduce((min, flight) => 
          flight.total < min.total ? flight : min
        );
        
        // Encontrar el más rápido
        const fastest = flights.reduce((min, flight) => 
          flight.durationMin < min.durationMin ? flight : min
        );
        
        // Agregar tags
        flights.forEach(flight => {
          if (flight.id === cheapest.id) {
            flight.tags.push({ kind: "cheap", text: "Más barato" });
          }
          if (flight.id === fastest.id) {
            flight.tags.push({ kind: "fast", text: "Más rápido" });
          }
          if (flight.stops === 0) {
            flight.tags.push({ kind: "direct", text: "Directo" });
          }
        });
        
        // El primer vuelo (ordenado por precio) es "Mejor opción"
        if (flights[0]) {
          flights[0].tags.unshift({ kind: "best", text: "Mejor opción" });
        }
      }

      return flights;
    }

    // Fallback to mock data if no real flights
    return mockFlightResults({
      from: activeFrom,
      to: activeTo,
      departDate: activeDepartDate,
      returnDate: activeReturnDate,
      passengers: { total: paxTotal },
      cabin,
      nonStopOnly,
    });
  }, [realFlights, activeFrom, activeTo, activeDepartDate, activeReturnDate, paxTotal, cabin, nonStopOnly]);

  const resultsFiltered = useMemo(() => {
    return resultsRaw.filter((r) => {
      // Filtro de precio (convertir a miles para comparar correctamente)
      const priceToCompare = r.total;
      if (priceToCompare > priceMax * 1000) return false;

      // Filtro de duración
      const durH = r.durationMin / 60;
      if (durH > durationMax) return false;

      // Filtro de escalas
      if (stopsFilter === "nonstop" && r.stops !== 0) return false;
      if (stopsFilter === "onestop" && r.stops !== 1) return false;
      if (stopsFilter === "twoplus" && r.stops < 2) return false;

      // Filtro de aerolíneas
      if (selectedAirlines.size > 0 && !selectedAirlines.has(r.airline)) return false;

      // Filtro de horario
      if (timeBand !== "any") {
        const timeParts = r.depart.split(":");
        if (timeParts.length > 0) {
          const hour = Number(timeParts[0]);
          const band = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "night";
          if (band !== timeBand) return false;
        }
      }

      return true;
    });
  }, [resultsRaw, priceMax, durationMax, stopsFilter, selectedAirlines, timeBand]);

  function swapRoute() {
    const tmp = from;
    setFrom(to);
    setTo(tmp);
  }

  function setAirlineToggle(name) {
    setSelectedAirlines((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function openCalendar(mode) {
    setCalendarMode(mode);
    setShowCalendar(true);
  }

  function chooseDate(iso) {
    if (calendarMode === "depart") {
      setDepartDate(iso);
      if (tripType === "roundtrip") setCalendarMode("return");
      else setShowCalendar(false);
    } else {
      setReturnDate(iso);
      setShowCalendar(false);
    }
  }

  const travelSummary = useMemo(() => {
    const nights = tripType === "roundtrip" ? daysBetweenISO(departDate, returnDate) : null;
    return {
      paxTotal,
      nights,
      cabin,
    };
  }, [paxTotal, departDate, returnDate, tripType, cabin]);

  // ===== Trip type change handler (keeps states coherent)
  function handleTripTypeChange(next) {
    setTripType(next);

    // If switching to multidest, ensure at least 2 legs
    if (next === "multidest") {
      setLegs((prev) => {
        const safe = Array.isArray(prev) ? prev : [];
        if (safe.length >= 2) return safe;

        // Build from current single route
        return [
          { from, to, date: departDate },
          { from: to, to: AIRPORTS.find((a) => a.code === "CDG") ?? null, date: toISODate(addDays(new Date(departDate), 3)) },
        ];
      });
    }

    // If leaving multidest, sync single route to first leg (nice UX)
    if (next !== "multidest") {
      const first = legs?.[0];
      if (first?.from) setFrom(first.from);
      if (first?.to) setTo(first.to);
      if (first?.date) setDepartDate(first.date);
    }
  }

  // ===== Multidest handlers
  function addLeg() {
    setLegs((prev) => [...prev, newLeg()]);
  }
  function removeLeg(index) {
    setLegs((prev) => prev.filter((_, i) => i !== index));
  }
  function updateLeg(index, field, value) {
    setLegs((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Buscar vuelos</h1>
          <p className="text-sm text-slate-600 mt-1">
            Encuentra el vuelo ideal y descubre fechas más baratas con recomendaciones inteligentes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPriceAlert((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition ${
              priceAlert
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Bell className="w-4 h-4" />
            {priceAlert ? "Alerta activada" : "Alerta de precios"}
          </button>

          <button
            onClick={() => setShowCheapestMonth(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-sm transition"
          >
            <BadgeDollarSign className="w-4 h-4" />
            Mes más barato
          </button>
        </div>
      </div>

      {/* Trip Type selector */}
      <div className="mt-6">
        <Segmented
          value={tripType}
          onChange={handleTripTypeChange}
          options={[
            { value: "oneway", label: "Ida" },
            { value: "roundtrip", label: "Ida y vuelta" },
            { value: "multidest", label: "Multidestino" },
          ]}
        />
      </div>

      {/* Search Card */}
      <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5">
        {/* ========== MULTIDESTINO UI ========== */}
        {tripType === "multidest" ? (
          <div className="space-y-4">
            <div className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Multidestino:</span> define los tramos de tu itinerario.
              <div className="text-xs text-slate-500 mt-1">
                (Resultados mock se basan en el primer tramo mientras conectas backend.)
              </div>
            </div>

            {legs.map((leg, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end border border-slate-200 rounded-2xl p-4"
              >
                <div className="lg:col-span-5 relative">
                  <label className="text-xs text-slate-600 font-semibold">Origen</label>
                  <AirportAutocomplete
                    value={leg.from}
                    placeholder="Ciudad o aeropuerto..."
                    onPick={(a) => updateLeg(idx, "from", a)}
                  />
                </div>

                <div className="lg:col-span-5 relative">
                  <label className="text-xs text-slate-600 font-semibold">Destino</label>
                  <AirportAutocomplete
                    value={leg.to}
                    placeholder="Ciudad o aeropuerto..."
                    icon="plane"
                    onPick={(a) => updateLeg(idx, "to", a)}
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="text-xs text-slate-600 font-semibold">Fecha</label>
                  <input
                    type="date"
                    value={leg.date}
                    onChange={(e) => updateLeg(idx, "date", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                </div>

                <div className="lg:col-span-12 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">
                    Tramo {idx + 1}:{" "}
                    <span className="font-semibold text-slate-700">
                      {leg.from?.code ?? "—"} → {leg.to?.code ?? "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {legs.length > 2 && (
                      <button
                        onClick={() => removeLeg(idx)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold transition"
                        title="Eliminar tramo"
                      >
                        <X className="w-4 h-4" />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addLeg}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              Agregar otro tramo
            </button>

            {/* Passengers & Cabin (still available) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200">
              <PassengerPicker passengers={passengers} setPassengers={setPassengers} />
              <CabinPicker cabin={cabin} setCabin={setCabin} />
            </div>

            <button
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 transition shadow"
              onClick={() => window.scrollTo({ top: 520, behavior: "smooth" })}
            >
              <Sparkles className="w-5 h-5" />
              Buscar itinerario
            </button>
          </div>
        ) : (
          /* ========== ONEWAY / ROUNDTRIP (ORIGINAL PRO) ========== */
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
              {/* FROM */}
              <div className="lg:col-span-4 relative">
                <label className="text-xs text-slate-600 font-semibold">Origen</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-500">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <input
                    value={showFromSug ? fromQuery : formatAirport(from)}
                    onChange={(e) => {
                      setFromQuery(e.target.value);
                      setShowFromSug(true);
                    }}
                    onFocus={() => {
                      setFromQuery("");
                      setShowFromSug(true);
                    }}
                    onBlur={() => setTimeout(() => setShowFromSug(false), 120)}
                    placeholder="Ciudad o aeropuerto..."
                    className="w-full outline-none text-sm text-slate-900 placeholder-slate-400"
                  />
                </div>

                {showFromSug && (
                  <Suggestions
                    items={fromSuggestions}
                    onPick={(a) => {
                      setFrom(a);
                      setShowFromSug(false);
                    }}
                  />
                )}
              </div>

              {/* SWAP */}
              <div className="lg:col-span-1 flex justify-center">
                <button
                  onClick={swapRoute}
                  className="w-11 h-11 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition inline-flex items-center justify-center"
                  title="Intercambiar origen/destino"
                >
                  <ArrowLeftRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>

              {/* TO */}
              <div className="lg:col-span-4 relative">
                <label className="text-xs text-slate-600 font-semibold">Destino</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-500">
                  <Plane className="w-4 h-4 text-slate-500" />
                  <input
                    value={showToSug ? toQuery : formatAirport(to)}
                    onChange={(e) => {
                      setToQuery(e.target.value);
                      setShowToSug(true);
                    }}
                    onFocus={() => {
                      setToQuery("");
                      setShowToSug(true);
                    }}
                    onBlur={() => setTimeout(() => setShowToSug(false), 120)}
                    placeholder="Ciudad o aeropuerto..."
                    className="w-full outline-none text-sm text-slate-900 placeholder-slate-400"
                  />
                </div>

                {showToSug && (
                  <Suggestions
                    items={toSuggestions}
                    onPick={(a) => {
                      setTo(a);
                      setShowToSug(false);
                    }}
                  />
                )}
              </div>

              {/* DATES */}
              <div className="lg:col-span-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-semibold">Salida</label>
                  <button
                    onClick={() => openCalendar("depart")}
                    className="mt-1 w-full inline-flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:bg-slate-50 transition"
                  >
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-slate-500" />
                      {departDate}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                <div className={`${tripType !== "roundtrip" ? "opacity-50 pointer-events-none" : ""}`}>
                  <label className="text-xs text-slate-600 font-semibold">Regreso</label>
                  <button
                    onClick={() => openCalendar("return")}
                    className="mt-1 w-full inline-flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:bg-slate-50 transition"
                  >
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-slate-500" />
                      {returnDate}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* PASSENGERS & CABIN */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 lg:mt-0">
                <PassengerPicker passengers={passengers} setPassengers={setPassengers} />
                <CabinPicker cabin={cabin} setCabin={setCabin} />
              </div>

              {/* SEARCH */}
              <div className="lg:col-span-4 mt-2 lg:mt-0">
                <button
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 transition shadow"
                  onClick={() => window.scrollTo({ top: 520, behavior: "smooth" })}
                >
                  <Sparkles className="w-5 h-5" />
                  Buscar vuelos
                </button>
              </div>
            </div>

            {/* Smart tips */}
            <div className="mt-4 p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <div className="mt-0.5">
                <CircleAlert className="w-5 h-5 text-sky-700" />
              </div>
              <div className="text-sm text-slate-700">
                <div className="font-semibold text-slate-900">Tip para ahorrar</div>
                <div className="text-slate-600">{cheapInsight}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Chip onClick={() => setTimeBand("morning")} active={timeBand === "morning"}>
                    🌅 Mañana
                  </Chip>
                  <Chip onClick={() => setStopsFilter("nonstop")} active={stopsFilter === "nonstop"}>
                    Directo
                  </Chip>
                  <Chip onClick={() => setPriceMax(700)} active={priceMax === 700}>
                    Presupuesto $700
                  </Chip>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Promos */}
      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Ofertas desde tu ciudad</h2>
          <p className="text-sm text-slate-600">
            Basado en tu origen actual: <span className="font-semibold">{activeFrom?.city ?? "—"}</span>
          </p>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PROMOS.map((p) => (
            <PromoCard
              key={p.id}
              promo={p}
              onPick={() => {
                const f = AIRPORTS.find((a) => a.code === p.from);
                const t = AIRPORTS.find((a) => a.code === p.to);
                if (tripType === "multidest") {
                  setLegs((prev) => {
                    const next = [...prev];
                    if (!next[0]) next[0] = newLeg();
                    next[0] = { ...next[0], from: f ?? next[0].from, to: t ?? next[0].to };
                    return next;
                  });
                } else {
                  if (f) setFrom(f);
                  if (t) setTo(t);
                }
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))}
        </div>
      </div>

      {/* Results section */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filters (desktop) */}
        <aside className="hidden lg:block lg:col-span-4">
          <FilterPanel
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            durationMax={durationMax}
            setDurationMax={setDurationMax}
            stopsFilter={stopsFilter}
            setStopsFilter={setStopsFilter}
            selectedAirlines={selectedAirlines}
            setAirlineToggle={setAirlineToggle}
            timeBand={timeBand}
            setTimeBand={setTimeBand}
            availableAirlines={availableAirlines}
          />
        </aside>

        {/* Main */}
        <section className="lg:col-span-8">
          {/* Top bar results */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-slate-600">
              {loadingFlights ? (
                <span className="font-semibold text-sky-600">Cargando vuelos...</span>
              ) : (
                <>
                  <span className="font-semibold text-slate-900">{resultsFiltered.length}</span> opciones · {travelSummary.paxTotal} pasajero(s) ·{" "}
                  {travelSummary.cabin}
                  {tripType === "roundtrip" && <span> · {travelSummary.nights} días</span>}
                  {tripType === "multidest" && <span> · {legs.length} tramo(s)</span>}
                  {realFlights.length > 0 && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Base de datos</span>}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition"
                onClick={() => setShowFiltersMobile(true)}
              >
                <Filter className="w-4 h-4" />
                Filtros
              </button>

              <SortPills />
            </div>
          </div>

          {/* Fare comparison strip */}
          <div className="mt-3">
            <FareComparisonStrip best={resultsFiltered[0]} />
          </div>

          {/* Results list */}
          <div className="mt-4 space-y-3">
            {loadingFlights ? (
              <div className="p-8 rounded-2xl border border-slate-200 bg-white text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-3"></div>
                <div className="font-semibold text-slate-900">Buscando vuelos...</div>
                <div className="text-sm text-slate-600 mt-1">Consultando opciones disponibles en la base de datos</div>
              </div>
            ) : (
              <>
                {resultsFiltered.map((r, idx) => (
                  <FlightCard key={r.id} flight={r} highlight={idx === 0} paxTotal={paxTotal} />
                ))}

                {!resultsFiltered.length && (
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white text-slate-700">
                    <div className="font-semibold">No hay resultados con estos filtros.</div>
                    <div className="text-sm text-slate-600 mt-1">
                      {realFlights.length === 0 
                        ? "No hay vuelos disponibles para esta ruta en la base de datos." 
                        : "Prueba aumentando el presupuesto o cambiando escalas."}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Calendar modal (only for oneway/roundtrip) */}
      {showCalendar && tripType !== "multidest" && (
        <Modal onClose={() => setShowCalendar(false)} title="Calendario con precios">
          <CalendarWithPrices
            calendar={calendar}
            month={calendarMonth}
            setMonth={setCalendarMonth}
            mode={calendarMode}
            tripType={tripType}
            selectedDepart={departDate}
            selectedReturn={returnDate}
            onPick={chooseDate}
          />
          <div className="mt-3 text-xs text-slate-600">
            🟢 más barato · 🟡 promedio · 🔴 caro — precios aproximados (mock).
          </div>
        </Modal>
      )}

      {/* Cheapest month modal */}
      {showCheapestMonth && (
        <Modal onClose={() => setShowCheapestMonth(false)} title="Mes más barato">
          <CheapestMonthView
            baseFrom={activeFrom}
            baseTo={activeTo}
            onPickMonth={(d) => {
              setCalendarMonth(d);
              setShowCheapestMonth(false);
              if (tripType !== "multidest") setShowCalendar(true);
            }}
          />
        </Modal>
      )}

      {/* Mobile filters modal */}
      {showFiltersMobile && (
        <Modal onClose={() => setShowFiltersMobile(false)} title="Filtros">
          <FilterPanel
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            durationMax={durationMax}
            setDurationMax={setDurationMax}
            stopsFilter={stopsFilter}
            setStopsFilter={setStopsFilter}
            selectedAirlines={selectedAirlines}
            setAirlineToggle={setAirlineToggle}
            timeBand={timeBand}
            setTimeBand={setTimeBand}
            availableAirlines={availableAirlines}
          />
        </Modal>
      )}

      <div className="h-10" />
    </div>
  );
}

/* =========================================================
   Components
========================================================= */

function Segmented({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white shadow-sm p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              active ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Suggestions({ items, onPick }) {
  return (
    <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      {items.map((a) => (
        <button
          key={a.code}
          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(a)}
        >
          <div className="flex items-center justify-between">
            <div className="font-semibold text-slate-900">
              {a.city} <span className="text-slate-500 font-medium">({a.code})</span>
            </div>
            <div className="text-xs text-slate-500">{a.country}</div>
          </div>
          <div className="text-xs text-slate-600">{a.name}</div>
        </button>
      ))}
    </div>
  );
}

// Multidest-friendly airport autocomplete (self-contained)
function AirportAutocomplete({ value, onPick, placeholder, icon = "map" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AIRPORTS.slice(0, 8);
    return AIRPORTS.filter((a) => `${a.code} ${a.city} ${a.name} ${a.country}`.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  return (
    <div className="relative">
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-500">
        {icon === "plane" ? (
          <Plane className="w-4 h-4 text-slate-500" />
        ) : (
          <MapPin className="w-4 h-4 text-slate-500" />
        )}

        <input
          value={open ? query : formatAirport(value)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={placeholder}
          className="w-full outline-none text-sm text-slate-900 placeholder-slate-400"
        />
      </div>

      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {suggestions.map((a) => (
            <button
              key={a.code}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 transition"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onPick(a);
                setOpen(false);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">
                  {a.city} <span className="text-slate-500 font-medium">({a.code})</span>
                </div>
                <div className="text-xs text-slate-500">{a.country}</div>
              </div>
              <div className="text-xs text-slate-600">{a.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PassengerPicker({ passengers, setPassengers }) {
  const [open, setOpen] = useState(false);
  const total = passengers.adults + passengers.children + passengers.infants;

  function change(key, delta) {
    setPassengers((prev) => {
      const next = { ...prev, [key]: clamp((prev[key] ?? 0) + delta, key === "adults" ? 1 : 0, 9) };
      return next;
    });
  }

  return (
    <div className="relative">
      <label className="text-xs text-slate-600 font-semibold">Pasajeros</label>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-1 w-full inline-flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:bg-slate-50 transition"
      >
        <span className="inline-flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          {total} pasajero(s)
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg p-3">
          <RowCounter label="Adultos" value={passengers.adults} onDec={() => change("adults", -1)} onInc={() => change("adults", +1)} />
          <RowCounter label="Niños" value={passengers.children} onDec={() => change("children", -1)} onInc={() => change("children", +1)} />
          <RowCounter label="Bebés" value={passengers.infants} onDec={() => change("infants", -1)} onInc={() => change("infants", +1)} />

          <button
            className="mt-3 w-full px-3 py-2 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-500 transition"
            onClick={() => setOpen(false)}
          >
            Listo
          </button>
        </div>
      )}
    </div>
  );
}

function RowCounter({ label, value, onDec, onInc }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="text-sm text-slate-700">{label}</div>
      <div className="flex items-center gap-2">
        <button onClick={onDec} className="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-50">
          −
        </button>
        <div className="w-8 text-center font-semibold text-slate-900">{value}</div>
        <button onClick={onInc} className="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-50">
          +
        </button>
      </div>
    </div>
  );
}

function CabinPicker({ cabin, setCabin }) {
  const [open, setOpen] = useState(false);
  const options = [
    { value: "Economy", label: "Económica" },
    { value: "Premium Economy", label: "Premium Economy" },
    { value: "Business", label: "Ejecutiva" },
    { value: "First", label: "Primera clase" },
  ];
  const label = options.find((o) => o.value === cabin)?.label ?? "Económica";

  return (
    <div className="relative">
      <label className="text-xs text-slate-600 font-semibold">Clase</label>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-1 w-full inline-flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:bg-slate-50 transition"
      >
        <span className="inline-flex items-center gap-2">
          <Ticket className="w-4 h-4 text-slate-500" />
          {label}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {options.map((o) => (
            <button
              key={o.value}
              className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${cabin === o.value ? "bg-sky-50" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setCabin(o.value);
                setOpen(false);
              }}
            >
              <div className="font-semibold text-slate-900">{o.label}</div>
              <div className="text-xs text-slate-600">
                {o.value === "Economy"
                  ? "Precio más bajo, beneficios básicos"
                  : o.value === "Premium Economy"
                  ? "Más espacio y beneficios extra"
                  : o.value === "Business"
                  ? "Prioridad, confort y cambios flexibles"
                  : "Máxima experiencia y beneficios premium"}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ children, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
        active ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function PromoCard({ promo, onPick }) {
  const f = AIRPORTS.find((a) => a.code === promo.from);
  const t = AIRPORTS.find((a) => a.code === promo.to);
  return (
    <button
      onClick={onPick}
      className="text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="font-bold text-slate-900">
          {promo.tag} {f?.city ?? promo.from} → {t?.city ?? promo.to}
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{promo.label}</span>
      </div>
      <div className="mt-2 text-sm text-slate-600">
        Desde <span className="font-extrabold text-slate-900">{money(promo.priceFrom)}</span>
      </div>
      <div className="text-xs text-slate-500 mt-1">Fechas sugeridas: {promo.months}</div>
    </button>
  );
}

function SortPills() {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white shadow-sm p-1">
      <button className="px-3 py-2 rounded-full text-xs font-semibold bg-sky-600 text-white">Mejor</button>
      <button className="px-3 py-2 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-50">Más barato</button>
      <button className="px-3 py-2 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-50">Más rápido</button>
    </div>
  );
}

function FareComparisonStrip({ best }) {
  if (!best) return null;
  const tiers = [
    { key: "basic", label: "Basic / Light", hint: "Más barato", price: best.fareTiers.basic },
    { key: "standard", label: "Económica estándar", hint: "Balance", price: best.fareTiers.standard },
    { key: "flexible", label: "Económica flexible", hint: "Cambios", price: best.fareTiers.flexible },
    { key: "premium", label: "Premium / Ejecutiva", hint: "Confort", price: best.fareTiers.premium },
  ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="font-bold text-slate-900">Comparador de tarifas</div>
          <div className="text-sm text-slate-600">Mira rápido qué incluye cada tipo de tarifa.</div>
        </div>
        <div className="text-xs text-slate-500 inline-flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Basado en la mejor opción actual
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tiers.map((t) => (
          <div
            key={t.key}
            className={`rounded-xl border p-3 ${
              t.key === "standard" ? "border-sky-200 bg-sky-50" : "border-slate-200 bg-white"
            }`}
          >
            <div className="text-xs text-slate-600 font-semibold">{t.label}</div>
            <div className="mt-1 text-lg font-extrabold text-slate-900">{money(t.price)}</div>
            <div className="text-xs text-slate-500 mt-1">{t.hint}</div>
            <div className="mt-2 text-xs text-slate-600">
              {t.key === "basic" && "Sin cambios · Equipaje limitado"}
              {t.key === "standard" && "Mejor relación precio/beneficios"}
              {t.key === "flexible" && "Cambios con menos penalidad"}
              {t.key === "premium" && "Prioridad · más confort"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlightCard({ flight, highlight, paxTotal = 1 }) {
  const [selectedFare, setSelectedFare] = useState("standard");
  const durH = Math.floor(flight.durationMin / 60);
  const durM = flight.durationMin % 60;

  const stopText = flight.stops === 0 ? "Directo" : flight.stops === 1 ? "1 escala" : `${flight.stops} escalas`;

  const currentPrice = (flight.fareTiers[selectedFare] || flight.total) * paxTotal;

  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm p-4 transition hover:shadow-md ${
        highlight ? "border-sky-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-[220px]">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-slate-700" />
            <div className="font-bold text-slate-900">{flight.airline}</div>
            <div className="text-xs text-slate-500">
              {flight.from} → {flight.to}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3 text-sm text-slate-700">
            <span className="font-semibold">{flight.depart}</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="font-semibold">{flight.arrive}</span>
            <span className="text-slate-500">·</span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              <Clock className="w-4 h-4" />
              {durH}h {durM}m
            </span>
          </div>

          <div className="mt-1 text-sm text-slate-600">{stopText}</div>

          <div className="mt-2 flex flex-wrap gap-2">
            {flight.tags.map((t, i) => (
              <span
                key={i}
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  t.kind === "best"
                    ? "bg-emerald-100 text-emerald-700"
                    : t.kind === "cheap"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {t.text}
              </span>
            ))}
          </div>

          <div className="mt-3 text-xs text-slate-600">
            Beneficios: <span className="font-semibold">{flight.benefits.join(" · ")}</span>
          </div>
        </div>

        <div className="flex-1 min-w-[220px]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-700">Tarifa rápida {paxTotal > 1 ? `(${paxTotal} pasajeros)` : ''}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <MiniFare 
                label="Basic" 
                price={flight.fareTiers.basic * paxTotal} 
                active={selectedFare === "basic"}
                onClick={() => setSelectedFare("basic")}
              />
              <MiniFare 
                label="Estándar" 
                price={flight.fareTiers.standard * paxTotal} 
                active={selectedFare === "standard"}
                onClick={() => setSelectedFare("standard")}
              />
              <MiniFare 
                label="Flexible" 
                price={flight.fareTiers.flexible * paxTotal} 
                active={selectedFare === "flexible"}
                onClick={() => setSelectedFare("flexible")}
              />
              <MiniFare 
                label="Premium" 
                price={flight.fareTiers.premium * paxTotal} 
                active={selectedFare === "premium"}
                onClick={() => setSelectedFare("premium")}
              />
            </div>
          </div>
        </div>

        <div className="min-w-[180px] text-right">
          <div className="text-xs text-slate-500">Precio total</div>
          <div className="text-2xl font-extrabold text-slate-900">{money(currentPrice)}</div>
          <div className="text-xs text-slate-600 mt-1">Impuestos incluidos</div>

          <ComprarBoletaButton 
            flight={flight} 
            selectedFare={selectedFare}
            currentPrice={currentPrice}
            paxTotal={paxTotal}
          />

          <button className="mt-2 w-full px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold transition">
            Comparar
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente para comprar boleta
function ComprarBoletaButton({ flight, selectedFare, currentPrice, paxTotal = 1 }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handlePaymentSuccess(paymentData) {
    setLoading(true);
    setShowPaymentModal(false);
    
    try {
      // NOTA: En producción, user_id vendría del contexto de autenticación
      const userId = 2; // Usuario de prueba
      const departDate = new Date().toISOString().split('T')[0];
      
      // 1. Crear la reserva
      const reservation = await createFlightReservation({
        userId,
        flight: {
          ...flight,
          fareTiers: {
            ...flight.fareTiers,
            [selectedFare]: currentPrice // Usar el precio ya multiplicado
          }
        },
        selectedFare,
        departDate,
      });

      // 2. Crear la factura
      await createFlightInvoice({
        reservation,
        paymentData,
        flightData: {
          origin: flight.origin,
          destination: flight.destination,
          airline: flight.airline,
          departureDate: departDate,
          returnDate: null,
          passengers: paxTotal,
        },
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error creando reserva/factura:', error);
      alert('Error al procesar la compra. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <button className="mt-3 w-full px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold transition shadow inline-flex items-center justify-center gap-2">
        <Check className="w-5 h-5" />
        ¡Comprado!
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => setShowPaymentModal(true)}
        disabled={loading}
        className="mt-3 w-full px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Procesando...' : 'Comprar boleta'}
      </button>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={currentPrice}
        onPaymentSuccess={handlePaymentSuccess}
        purchaseData={{
          type: 'vuelo',
          description: `${flight.origin} → ${flight.destination} - ${flight.airline} - ${paxTotal} pasajero${paxTotal > 1 ? 's' : ''}`,
        }}
      />
    </>
  );
}

function MiniFare({ label, price, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-2 py-2 transition-all cursor-pointer hover:shadow-md ${
        active 
          ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200" 
          : "border-slate-200 bg-white/70 hover:bg-white hover:border-sky-300"
      }`}
    >
      <div className={`font-semibold ${active ? "text-sky-700" : "text-slate-600"}`}>{label}</div>
      <div className={`font-extrabold ${active ? "text-sky-900" : "text-slate-900"}`}>{money(price)}</div>
    </button>
  );
}

function FilterPanel({
  priceMax,
  setPriceMax,
  durationMax,
  setDurationMax,
  stopsFilter,
  setStopsFilter,
  selectedAirlines,
  setAirlineToggle,
  timeBand,
  setTimeBand,
  availableAirlines = [],
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-bold text-slate-900">Filtros</div>
          <div className="text-sm text-slate-600">Ajusta lo esencial sin abrumarte.</div>
        </div>
        <SlidersHorizontal className="w-5 h-5 text-slate-500" />
      </div>

      <div className="mt-4 space-y-5">
        {/* Precio */}
        <div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Precio máximo</div>
            <div className="text-sm text-slate-700">${priceMax}k</div>
          </div>
          <input
            type="range"
            min={100}
            max={5000}
            step={50}
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-full mt-2"
          />
          <div className="text-xs text-slate-500 mt-1">
            Precio en miles de pesos (COP). Ajusta según tu presupuesto.
          </div>
        </div>

        {/* Horario */}
        <div>
          <div className="text-sm font-semibold text-slate-900">Horario de salida</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip active={timeBand === "any"} onClick={() => setTimeBand("any")}>
              Cualquiera
            </Chip>
            <Chip active={timeBand === "morning"} onClick={() => setTimeBand("morning")}>
              🌅 Mañana
            </Chip>
            <Chip active={timeBand === "afternoon"} onClick={() => setTimeBand("afternoon")}>
              🌞 Tarde
            </Chip>
            <Chip active={timeBand === "night"} onClick={() => setTimeBand("night")}>
              🌙 Noche
            </Chip>
          </div>
        </div>

        {/* Duración */}
        <div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Duración máxima</div>
            <div className="text-sm text-slate-700">{durationMax}h</div>
          </div>
          <input
            type="range"
            min={4}
            max={30}
            step={1}
            value={durationMax}
            onChange={(e) => setDurationMax(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>

        {/* Escalas */}
        <div>
          <div className="text-sm font-semibold text-slate-900">Escalas</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip active={stopsFilter === "any"} onClick={() => setStopsFilter("any")}>
              Cualquiera
            </Chip>
            <Chip active={stopsFilter === "nonstop"} onClick={() => setStopsFilter("nonstop")}>
              Directo
            </Chip>
            <Chip active={stopsFilter === "onestop"} onClick={() => setStopsFilter("onestop")}>
              1 escala
            </Chip>
            <Chip active={stopsFilter === "twoplus"} onClick={() => setStopsFilter("twoplus")}>
              2+ escalas
            </Chip>
          </div>
          <div className="text-xs text-slate-500 mt-1">Los vuelos con escala suelen ser más baratos.</div>
        </div>

        {/* Aerolíneas */}
        <div>
          <div className="text-sm font-semibold text-slate-900">Aerolíneas</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {availableAirlines.length > 0 ? (
              availableAirlines.map((a) => {
                const active = selectedAirlines.has(a.name);
                return (
                  <button
                    key={a.id}
                    onClick={() => setAirlineToggle(a.name)}
                    className={`px-3 py-2 rounded-xl border text-sm font-semibold transition ${
                      active
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {a.name}
                  </button>
                );
              })
            ) : (
              AIRLINES.map((a) => {
                const active = selectedAirlines.has(a.name);
                return (
                  <button
                    key={a.id}
                    onClick={() => setAirlineToggle(a.name)}
                    className={`px-3 py-2 rounded-xl border text-sm font-semibold transition ${
                      active
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {a.name}
                  </button>
                );
              })
            )}
          </div>
          <div className="text-xs text-slate-500 mt-2">Si no eliges ninguna, se muestran todas.</div>
        </div>
      </div>
    </div>
  );
}

function CalendarWithPrices({
  calendar,
  month,
  setMonth,
  mode,
  tripType,
  selectedDepart,
  selectedReturn,
  onPick,
}) {
  const monthLabel = month.toLocaleString("es-CO", { month: "long", year: "numeric" });

  const weeks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 6; i++) arr.push(calendar.grid.slice(i * 7, (i + 1) * 7));
    return arr;
  }, [calendar.grid]);

  const min = calendar.min;
  const max = calendar.max;

  function colorFor(price) {
    const t = (price - min) / (max - min + 1e-6);
    if (t < 0.33) return "bg-emerald-50 border-emerald-200 text-emerald-800";
    if (t < 0.66) return "bg-amber-50 border-amber-200 text-amber-800";
    return "bg-rose-50 border-rose-200 text-rose-800";
  }

  const title = mode === "depart" ? "Elige salida" : "Elige regreso";

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-bold text-slate-900">{title}</div>
          <div className="text-sm text-slate-600 capitalize">{monthLabel}</div>
          {tripType === "roundtrip" && (
            <div className="text-xs text-slate-500 mt-1">
              Salida: <span className="font-semibold">{selectedDepart}</span> · Regreso:{" "}
              <span className="font-semibold">{selectedReturn}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            ←
          </button>
          <button
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-slate-500">
        {["D", "L", "M", "X", "J", "V", "S"].map((d) => (
          <div key={d} className="text-center font-semibold">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-2 grid gap-2">
        {weeks.map((w, idx) => (
          <div key={idx} className="grid grid-cols-7 gap-2">
            {w.map((cell) => {
              const iso = cell.iso;
              const isSelected = iso === selectedDepart || iso === selectedReturn;
              const inMonth = cell.date.getMonth() === month.getMonth();

              return (
                <button
                  key={iso}
                  onClick={() => onPick(iso)}
                  className={`rounded-xl border p-2 text-left transition hover:shadow-sm ${
                    inMonth ? colorFor(cell.price) : "bg-slate-50 border-slate-200 text-slate-400"
                  } ${isSelected ? "ring-2 ring-sky-500" : ""}`}
                >
                  <div className="text-xs font-semibold">{cell.date.getDate()}</div>
                  <div className="text-sm font-extrabold">{money(cell.price)}</div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function CheapestMonthView({ baseFrom, baseTo, onPickMonth }) {
  const now = new Date();
  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const seed = (baseFrom?.code?.charCodeAt(0) ?? 1) + (baseTo?.code?.charCodeAt(0) ?? 2) + i * 13;
    const { min, max } = generatePriceGrid(d, seed);
    const avg = (min + max) / 2;
    months.push({ date: d, label: d.toLocaleString("es-CO", { month: "long", year: "numeric" }), avg });
  }

  const best = months.reduce((a, b) => (a.avg < b.avg ? a : b), months[0]);

  return (
    <div>
      <div className="text-sm text-slate-600">
        Travium analizó precios aproximados para{" "}
        <span className="font-semibold">
          {baseFrom?.code ?? "—"} → {baseTo?.code ?? "—"}
        </span>
        .
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {months.map((m) => {
          const isBest = m.label === best.label;
          return (
            <button
              key={m.label}
              onClick={() => onPickMonth(m.date)}
              className={`text-left rounded-2xl border p-4 shadow-sm transition hover:bg-slate-50 ${
                isBest ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-bold text-slate-900 capitalize">{m.label}</div>
                {isBest && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    Más barato
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm text-slate-600">Precio promedio aprox.</div>
              <div className="text-2xl font-extrabold text-slate-900">{money(m.avg)}</div>
              <div className="text-xs text-slate-500 mt-1">Haz click para abrir calendario con precios por día.</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3">
        <div className="w-full sm:max-w-3xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="font-bold text-slate-900">{title}</div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-slate-100 inline-flex items-center justify-center"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </div>
          <div className="p-4 max-h-[75vh] overflow-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
