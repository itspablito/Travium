import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { ensureHotelPrice } from "../../services/pricesApi";

// Componente interno para centrar mapa según foco
function MapFocus({ focus, hotels }) {
  const map = useMap();

  useEffect(() => {
    if (focus?.bbox?.length === 4) {
      const [south, north, west, east] = focus.bbox;
      map.fitBounds(
        [
          [south, west],
          [north, east],
        ],
        { padding: [30, 30] }
      );
      return;
    }
    if (hotels?.length) {
      const h = hotels[0];
      if (Number.isFinite(h.lat) && Number.isFinite(h.lng)) {
        map.setView([h.lat, h.lng], 13);
      }
    }
  }, [focus, hotels, map]);

  return null;
}

export default function LodgingMap({ hotels, guests, nights, onSelectHotel, focus }) {
  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

  const tileUrl = MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution = MAPTILER_KEY
    ? '&copy; <a href="https://www.maptiler.com/" target="_blank" rel="noreferrer">MapTiler</a> &copy; OpenStreetMap contributors'
    : "&copy; OpenStreetMap contributors";

  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const initialCenter = useMemo(() => {
    if (focus?.lat && focus?.lon) return [focus.lat, focus.lon];
    return [15, 0];
  }, [focus]);

  const initialZoom = focus?.lat && focus?.lon ? 12 : 2;

  useEffect(() => {
    if (!hotels?.length) {
      setMarkers([]);
      return;
    }

    let cancelled = false;

    const fallbackBasePrice = (h) => {
      const seed = `${h.osmType}-${h.osmId}-${h.name || ""}`;
      let hash = 0;
      for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
      return 35 + (hash % 120); // 35..154
    };

    async function loadPrices() {
      setLoading(true);

      // 1️⃣ Fallback instantáneo
      const instant = hotels.map((h) => {
        const basePrice = fallbackBasePrice(h);
        const total = Math.max(1, guests) * Math.max(1, nights) * basePrice;

        const icon = L.divIcon({
          className: "lodging-price-marker",
          html: `<div class="price-pill">$${total}</div>`,
          iconSize: [1, 1],
        });

        return { ...h, basePrice, total, icon };
      });

      if (!cancelled) setMarkers(instant);

      // 2️⃣ Backend para precios reales
      try {
        const enriched = await Promise.all(
          hotels.map(async (h) => {
            const { basePrice } = await ensureHotelPrice({
              osmType: h.osmType,
              osmId: h.osmId,
              name: h.name,
            });

            const total = Math.max(1, guests) * Math.max(1, nights) * basePrice;
            const icon = L.divIcon({
              className: "lodging-price-marker",
              html: `<div class="price-pill">$${total}</div>`,
              iconSize: [1, 1],
            });

            return { ...h, basePrice, total, icon };
          })
        );
        if (!cancelled) setMarkers(enriched);
      } catch (e) {
        console.warn("Backend de precios no respondió; usando fallback local.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPrices();
    return () => { cancelled = true; };
  }, [hotels, guests, nights]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {loading && (
        <div className="absolute z-[1000] top-3 left-3 rounded-xl bg-white/90 border px-3 py-2 text-sm text-slate-700 shadow">
          Calculando precios…
        </div>
      )}

      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        minZoom={2}
        className="w-full h-full"
        worldCopyJump
      >
        <TileLayer url={tileUrl} attribution={attribution} maxZoom={20} />
        <MapFocus focus={focus} hotels={markers} />

        {markers.map((m) => (
          <Marker
            key={`${m.osmType}-${m.osmId}`}
            position={[m.lat, m.lng]}
            icon={m.icon}
          >
            <Popup>
              <div className="space-y-2">
                <div className="font-semibold text-slate-900">{m.name}</div>
                <div className="text-sm text-slate-600">{m.city}, {m.country || "desconocido"}</div>

                <div className="text-sm">
                  <span className="text-slate-600">Precio base:</span>{" "}
                  <span className="font-semibold">${m.basePrice}</span> <span className="text-slate-600">/noche/persona</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-600">Total:</span>{" "}
                  <span className="font-bold">${m.total}</span>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    className="flex-1 rounded-lg bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-500 transition"
                    onClick={() => onSelectHotel(m)}
                  >
                    Reservar
                  </button>

                  <button
                    className="flex-1 rounded-lg bg-gray-200 px-3 py-2 text-sm text-slate-700 hover:bg-gray-300 transition"
                    onClick={() => {
                      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.name)},${encodeURIComponent(m.city)}`;
                      window.open(mapsUrl, "_blank");
                    }}
                  >
                    Ver alojamiento
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
