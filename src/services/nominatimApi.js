const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Autocompleta ciudades del mundo
 * Devuelve nombre + lat + lon + bounding box
 */
export async function searchCities(query) {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: 1,
    limit: 5,
  });

  const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Error consultando Nominatim");
  }

  const data = await res.json();

  return data.map((item) => ({
    displayName: item.display_name,
    city:
      item.address.city ||
      item.address.town ||
      item.address.village ||
      item.address.state,
    country: item.address.country,
    lat: Number(item.lat),
    lon: Number(item.lon),
    bbox: item.boundingbox.map(Number), // [south, north, west, east]
  }));
}
