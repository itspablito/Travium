import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

/**
 * hotels: [{ id, name, city, country, lat, lng, pricePerNightPerPerson }]
 * guests: number
 * nights: number
 */
export default function LodgingMap({ hotels, guests, nights, onSelectHotel }) {
  const markers = useMemo(() => {
    return hotels.map((h) => {
      const total = Math.max(1, guests) * Math.max(1, nights) * h.pricePerNightPerPerson;

      const icon = L.divIcon({
        className: "lodging-price-marker",
        html: `
          <div class="px-3 py-1 rounded-full bg-white shadow-md border border-slate-200 text-sm font-semibold text-slate-900">
            $${total}
          </div>
        `,
        iconSize: [1, 1], // Leaflet lo calcula por HTML; esto evita “cuadro”
      });

      return { ...h, total, icon };
    });
  }, [hotels, guests, nights]);

  return (
    <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <MapContainer
        center={[15, 0]} // mundo
        zoom={2}
        minZoom={2}
        className="w-full h-full"
        worldCopyJump
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={m.icon}
            eventHandlers={{
              click: () => onSelectHotel?.(m),
            }}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{m.name}</div>
                <div className="text-sm text-slate-600">
                  {m.city}, {m.country}
                </div>
                <div className="text-sm">
                  <span className="text-slate-600">Precio:</span>{" "}
                  <span className="font-semibold">${m.pricePerNightPerPerson}</span>{" "}
                  <span className="text-slate-600">/noche/persona</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-600">Total:</span>{" "}
                  <span className="font-bold">${m.total}</span>
                </div>
                <button
                  className="mt-2 w-full px-3 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-500 transition"
                  onClick={() => onSelectHotel?.(m)}
                >
                  Ver alojamiento
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
