import React, { useState, useEffect } from "react";
import { Car, Bike, Zap, Users, Clock, Star } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

/* ======================================================
   ICON RENDER
====================================================== */
function VehicleIcon({ type }) {
  const props = { className: "w-6 h-6 text-slate-700" };
  switch (type) {
    case "car":
      return <Car {...props} />;
    case "bike":
      return <Bike {...props} />;
    case "scooter":
      return <Zap {...props} />;
    default:
      return null;
  }
}

/* ======================================================
   EXTRA COMPONENT
====================================================== */
function Extra({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${active
        ? "bg-sky-600 text-white border-sky-600"
        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
        }`}
      type="button"
    >
      {label}
    </button>
  );
}

/* ======================================================
   PAGE
====================================================== */
export default function VehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [mode, setMode] = useState("hours");
  const [duration, setDuration] = useState(2);
  const [passengers, setPassengers] = useState(1);
  const [extras, setExtras] = useState({ insurance: false, gps: false, helmet: false });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        console.log("🌐 Fetching vehicles...");
        const res = await fetch("http://localhost:3006/api/vehicles");
        console.log("🟢 Response status:", res.status);
        const data = await res.json();
        console.log("📦 Vehicles data:", data);
        setVehicles(data);
      } catch (err) {
        console.error("❌ Error cargando vehículos:", err);
      }
    };
    fetchVehicles();
  }, []);

  function toggleExtra(key) {
    setExtras(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function calculateTotal(vehicle) {
    const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 1;
    const base =
      mode === "hours"
        ? parseFloat(vehicle.precio_hora) * safeDuration
        : parseFloat(vehicle.precio_dia) * safeDuration;
    const extrasCost =
      (extras.insurance ? 10 : 0) + (extras.gps ? 5 : 0) + (extras.helmet ? 3 : 0);
    const tax = base * 0.12;
    return base + extrasCost + tax;
  }

  const filteredVehicles = vehicles.filter(v => v.capacidad >= passengers);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Alquiler de vehículos</h1>
      <p className="text-slate-600 mt-1">
        Elige, compara y reserva vehículos por horas o por días.
      </p>

      {/* Rental selector */}
      <div className="mt-6 flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex rounded-full border border-slate-200 p-1 bg-white">
          {["hours", "days"].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${mode === m ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              type="button"
            >
              {m === "hours" ? "Por horas" : "Por días"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-600" />
          <input
            type="number"
            min={1}
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-20 border border-slate-200 rounded-lg px-3 py-1 text-sm text-slate-900"
          />
          <span className="text-sm text-slate-600">{mode === "hours" ? "horas" : "días"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-600" />
          <input
            type="number"
            min={1}
            value={passengers}
            onChange={e => setPassengers(Number(e.target.value))}
            className="w-20 border border-slate-200 rounded-lg px-3 py-1 text-sm text-slate-900"
          />
          <span className="text-sm text-slate-600">personas</span>
        </div>
      </div>

      {/* Extras */}
      <div className="mt-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-2">Extras</h3>
        <div className="flex flex-wrap gap-3">
          <Extra
            label="Seguro adicional (+$10)"
            active={extras.insurance}
            onClick={() => toggleExtra("insurance")}
          />
          <Extra label="GPS (+$5)" active={extras.gps} onClick={() => toggleExtra("gps")} />
          <Extra label="Casco (+$3)" active={extras.helmet} onClick={() => toggleExtra("helmet")} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          El precio final se calcula automáticamente con impuestos (12%) y extras seleccionados.
        </p>
      </div>

      {/* Vehicles */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredVehicles.map(v => {
          const total = calculateTotal(v);
          const unitPrice = mode === "hours" ? parseFloat(v.precio_hora) : parseFloat(v.precio_dia);

          return (
            <div
              key={v.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <VehicleIcon type={v.icon} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{v.tipo}</div>
                  <div className="text-sm text-slate-600">
                    {v.transmision} · {v.combustible}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-600">{v.recomendado}</div>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <Users className="w-4 h-4" /> {v.capacidad} personas
                <Star className="w-4 h-4 text-amber-400 ml-3" /> {v.rating}
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">
                  {mode === "hours" ? "Precio por hora" : "Precio por día"}
                </div>
                <div className="text-lg font-extrabold text-slate-900">${unitPrice}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Duración: {duration} {mode === "hours" ? "h" : "d"}
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="text-xs text-slate-500">Precio estimado total</div>
                <div className="text-2xl font-extrabold text-slate-900">${Math.round(total)}</div>
                <div className="text-xs text-slate-500">
                  Incluye impuestos y extras (mock)
                </div>
              </div>

              <button
                className="mt-4 w-full px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 transition shadow"
                type="button"
                onClick={async () => {
                  if (!user) return alert("Debes iniciar sesión para reservar");

                  const reserva = {
                    vehiculo_id: v.id,
                    fecha_inicio: new Date().toISOString(), // ejemplo: ahora
                    duracion: duration,
                    modo: mode,
                    pasajeros: passengers,
                    extras,
                    total: Math.round(calculateTotal(v)),
                  };

                  try {
                    console.log("🔎 Enviando reserva:", reserva);
                    const res = await fetch("http://localhost:3007/api/reservas", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                      body: JSON.stringify(reserva),
                    });

                    const data = await res.json();
                    console.log("✅ Reserva creada:", data);

                    if (res.ok) alert("Reserva creada correctamente!");
                    else alert("Error creando reserva: " + data.error);
                  } catch (err) {
                    console.error("❌ Error al crear reserva:", err);
                    alert("Error al crear reserva");
                  }
                }}
              >
                Reservar
              </button>


              <button
                className="mt-2 w-full px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold transition"
                type="button"
                onClick={() => {
                  alert(
                    `Detalle rápido:\n- ${mode === "hours" ? "Hora" : "Día"
                    }: $${unitPrice}\n- Impuestos: 12%\n- Extras: ${(extras.insurance ? "Seguro, " : "") +
                    (extras.gps ? "GPS, " : "") +
                    (extras.helmet ? "Casco, " : "") || "Ninguno"
                    }`
                  );
                }}
              >
                Ver desglose
              </button>
            </div>
          );
        })}

        {!filteredVehicles.length && (
          <div className="md:col-span-3 p-6 rounded-2xl border border-slate-200 bg-white text-slate-700">
            <div className="font-semibold">No hay vehículos para esa cantidad de pasajeros.</div>
            <div className="text-sm text-slate-600 mt-1">
              Baja el número de personas o agrega más categorías.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
