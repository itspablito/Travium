const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

/* =========================
   Utilidad común
========================= */
async function runOverpass(query) {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: query,
  });

  if (!res.ok) {
    throw new Error("Error consultando Overpass");
  }

  const data = await res.json();
  return data.elements || [];
}

/* =========================
   1️⃣ SOLO HOTELES
   (para LodgingPage)
========================= */
export async function fetchHotelsByCity(cityName) {
  const query = `
    [out:json][timeout:25];
    area["name"="${cityName}"]->.searchArea;
    (
      node["tourism"="hotel"](area.searchArea);
      way["tourism"="hotel"](area.searchArea);
      relation["tourism"="hotel"](area.searchArea);
    );
    out center tags;
  `;

  const elements = await runOverpass(query);

  return elements
    .map((el) => ({
      id: `${el.type}-${el.id}`,
      osmType: el.type,          // node | way | relation
      osmId: el.id,
      name: el.tags?.name || "Hotel",
      city: cityName,
      country: el.tags?.["addr:country"] || "",
      lat: el.lat ?? el.center?.lat,
      lng: el.lon ?? el.center?.lon,
    }))
    .filter((h) => h.lat && h.lng); // seguridad
}

/* =========================
   2️⃣ SERVICIOS / POIs
   (para ServicesPage)
   - restaurantes
   - tiendas
   - bancos
   - cafés, etc.
   (SIN hoteles)
========================= */
export async function fetchServicesByCity(cityName) {
  const query = `
    [out:json][timeout:25];
    area["name"="${cityName}"]->.searchArea;
    (
      node["amenity"~"restaurant|cafe|bank|pharmacy"](area.searchArea);
      way["amenity"~"restaurant|cafe|bank|pharmacy"](area.searchArea);

      node["shop"](area.searchArea);
      way["shop"](area.searchArea);
    );
    out center tags;
  `;

  const elements = await runOverpass(query);

  return elements
    .map((el) => ({
      id: `${el.type}-${el.id}`,
      osmType: el.type,
      osmId: el.id,
      name: el.tags?.name || "Servicio",
      category:
        el.tags?.amenity ||
        (el.tags?.shop ? "shop" : "other"),
      brand: el.tags?.brand || null,
      city: cityName,
      lat: el.lat ?? el.center?.lat,
      lng: el.lon ?? el.center?.lon,
    }))
    .filter((s) => s.lat && s.lng);
}
