const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Asegura el precio base de un hotel.
 * Si no existe, el backend lo crea (determinístico).
 */
export async function ensureHotelPrice({ osmType, osmId, name }) {
  const res = await fetch(`${API_BASE}/api/hotels/ensure-price`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ osmType, osmId, name }),
  });

  if (!res.ok) {
    throw new Error("Error obteniendo precio del hotel");
  }

  return res.json(); // { basePrice, created }
}
