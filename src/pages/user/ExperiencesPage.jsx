import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Sparkles,
  Star,
  MapPin,
  Globe,
  SlidersHorizontal,
  X,
  Heart,
  Share2,
  ListFilter,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";

/* =========================================================
   DATA (MOCK GLOBAL)
========================================================= */

const DESTINATIONS = [
  { id: "world", label: "Explorar el mundo", country: "Global", region: "Global" },

  // Europa
  { id: "paris", label: "París", country: "Francia", region: "Europa" },
  { id: "rome", label: "Roma", country: "Italia", region: "Europa" },
  { id: "barcelona", label: "Barcelona", country: "España", region: "Europa" },
  { id: "london", label: "Londres", country: "Reino Unido", region: "Europa" },
  { id: "santorini", label: "Santorini", country: "Grecia", region: "Europa" },

  // América
  { id: "cusco", label: "Cusco", country: "Perú", region: "América" },
  { id: "rio", label: "Río de Janeiro", country: "Brasil", region: "América" },
  { id: "nyc", label: "Nueva York", country: "USA", region: "América" },
  { id: "mexico", label: "CDMX", country: "México", region: "América" },
  { id: "cartagena", label: "Cartagena", country: "Colombia", region: "América" },

  // Asia
  { id: "tokyo", label: "Tokio", country: "Japón", region: "Asia" },
  { id: "bali", label: "Bali", country: "Indonesia", region: "Asia" },
  { id: "bangkok", label: "Bangkok", country: "Tailandia", region: "Asia" },
  { id: "seoul", label: "Seúl", country: "Corea del Sur", region: "Asia" },

  // África
  { id: "marrakech", label: "Marrakech", country: "Marruecos", region: "África" },
  { id: "cape", label: "Ciudad del Cabo", country: "Sudáfrica", region: "África" },

  // Oceanía
  { id: "sydney", label: "Sídney", country: "Australia", region: "Oceanía" },
  { id: "queenstown", label: "Queenstown", country: "Nueva Zelanda", region: "Oceanía" },
];

const TOURISM_TYPES = [
  { id: "adventure", label: "Turismo de aventura", emoji: "🧗" },
  { id: "eco", label: "Ecoturismo", emoji: "🌱" },
  { id: "cultural", label: "Turismo cultural", emoji: "🏛️" },
  { id: "beach", label: "Turismo de playa", emoji: "🏖️" },
  { id: "food", label: "Turismo gastronómico", emoji: "🍷" },
  { id: "wellness", label: "Turismo de bienestar", emoji: "🧘" },
  { id: "family", label: "Turismo familiar", emoji: "👨‍👩‍👧" },

  // extras (más opciones para filtros)
  { id: "nightlife", label: "Vida nocturna", emoji: "🌙" },
  { id: "nature", label: "Naturaleza", emoji: "🌿" },
  { id: "photography", label: "Fotografía", emoji: "📸" },
  { id: "shopping", label: "Compras", emoji: "🛍️" },
  { id: "romantic", label: "Romántico", emoji: "💘" },
  { id: "budget", label: "Low cost", emoji: "💸" },
  { id: "luxury", label: "Lujo", emoji: "💎" },
];

const DURATIONS = [
  { id: "any", label: "Cualquiera" },
  { id: "short", label: "Corta (1–2h)" },
  { id: "half", label: "Medio día (3–5h)" },
  { id: "full", label: "Día completo (6h+)" },
];

const SORTS = [
  { id: "recommended", label: "Recomendadas" },
  { id: "topRated", label: "Mejor valoradas" },
  { id: "mostReviewed", label: "Más populares" },
  { id: "recent", label: "Experiencias recientes" },
];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function stars(n) {
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  return { full, half };
}

function labelFromTourism(id) {
  return TOURISM_TYPES.find(t => t.id === id)?.label ?? id;
}

function destLabel(destId) {
  const d = DESTINATIONS.find(x => x.id === destId);
  if (!d) return "Destino";
  if (d.id === "world") return "Explorar el mundo";
  return `${d.label}, ${d.country}`;
}

/* =========================================================
   GOOGLE MAPS URL (REAL)
   - Si hay lat/lng -> abre directamente por coordenadas
   - Si no hay lat/lng -> busca por query (title + city + country)
========================================================= */

function openInGoogleMaps(exp) {
  const title = exp?.title ?? "";
  const city = exp?.city ?? "";
  const country = exp?.country ?? "";
  const q = `${title} ${city} ${country}`.trim();

  // Si algún día guardas placeId en el mock, aquí lo aprovechas:
  // if (exp.placeId) window.open(`https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(exp.placeId)}`, "_blank");

  if (typeof exp?.lat === "number" && typeof exp?.lng === "number") {
    // Abre un pin exacto por coordenadas
    const url = `https://www.google.com/maps/search/?api=1&query=${exp.lat},${exp.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  // Busca el lugar por texto (funciona “de verdad” sin API)
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* =========================================================
   EXPERIENCES MOCK (GLOBAL, MANY)
   - Puedes agregar lat/lng opcional a cualquiera
========================================================= */

const EXPERIENCES = [
  // EUROPA
  mkExp(
    "eiffel",
    "Sube a la Torre Eiffel al atardecer",
    "paris",
    ["cultural", "romantic", "photography"],
    "full",
    4.8,
    12432,
    ["https://picsum.photos/seed/eiffel1/1200/800", "https://picsum.photos/seed/eiffel2/1200/800", "https://picsum.photos/seed/eiffel3/1200/800"],
    "Una experiencia icónica con vistas panorámicas. Perfecta para fotos y para cerrar el día con la ciudad iluminada.",
    [
      mkRev("Camila R.", 5, "Ir al atardecer fue mágico. Cero arrepentimientos."),
      mkRev("Daniel M.", 5, "Las vistas valen cada minuto. Súper recomendado."),
      mkRev("Sofía P.", 4.5, "Un poco de fila, pero todo muy organizado."),
      mkRev("Alex G.", 4.5, "Ideal para parejas y amantes de la fotografía."),
    ],
    ["Imperdible", "Muy recomendado", "Fotos épicas"],
    // coords opcionales (esto haría pin exacto)
    { lat: 48.85837, lng: 2.294481 }
  ),

  mkExp(
    "colosseum",
    "Roma antigua: Coliseo + Foro Romano",
    "rome",
    ["cultural", "family", "photography"],
    "half",
    4.7,
    9830,
    ["https://picsum.photos/seed/rome1/1200/800", "https://picsum.photos/seed/rome2/1200/800"],
    "Recorre los lugares más históricos con guía. Aprende, camina y siente la historia bajo tus pies.",
    [
      mkRev("Laura S.", 5, "La guía explicó todo súper claro. Me encantó."),
      mkRev("Andrés C.", 4.5, "Buen ritmo, recomendable para familias."),
      mkRev("Nico V.", 4.6, "Me quedé con ganas de más. Volvería."),
    ],
    ["Ideal cultural", "Historia viva", "Top reviews"],
    { lat: 41.89021, lng: 12.492231 }
  ),

  mkExp(
    "santorini-sun",
    "Santorini: miradores, caldera y sunset tour",
    "santorini",
    ["beach", "romantic", "photography", "luxury"],
    "full",
    4.9,
    6210,
    ["https://picsum.photos/seed/santo1/1200/800", "https://picsum.photos/seed/santo2/1200/800"],
    "Día completo por los puntos más fotogénicos. Culmina con el sunset (sí: el famoso).",
    [
      mkRev("Mariana L.", 5, "De película. La luz al final del día es brutal."),
      mkRev("Julián S.", 5, "Vale cada peso. Todo muy cuidado."),
      mkRev("Ana V.", 4.8, "Recomiendo ir con buena batería para fotos."),
    ],
    ["Lujo", "Romántico", "Postales reales"]
  ),

  mkExp(
    "barca-tapas",
    "Ruta de tapas y mercados locales",
    "barcelona",
    ["food", "cultural", "nightlife"],
    "half",
    4.6,
    4320,
    ["https://picsum.photos/seed/tapas1/1200/800", "https://picsum.photos/seed/tapas2/1200/800"],
    "Prueba sabores locales con paradas en mercados y bares recomendados por locales.",
    [
      mkRev("Sebas B.", 4.8, "Comimos brutal. Muy variado."),
      mkRev("Sara P.", 4.5, "Excelente para conocer lugares auténticos."),
      mkRev("Tom H.", 4.6, "Buen ambiente. Ir con hambre."),
    ],
    ["Gastronómico", "Popular hoy", "Local vibes"]
  ),

  // AMÉRICA
  mkExp(
    "machu",
    "Machu Picchu: amanecer y recorrido guiado",
    "cusco",
    ["adventure", "cultural", "nature"],
    "full",
    4.9,
    15890,
    ["https://picsum.photos/seed/machu1/1200/800", "https://picsum.photos/seed/machu2/1200/800"],
    "Camina entre montañas y ruinas legendarias. Inolvidable para aventureros y amantes de la historia.",
    [
      mkRev("Juan P.", 5, "Impresionante. Te cambia la perspectiva."),
      mkRev("Valentina D.", 5, "El amanecer fue lo mejor del viaje."),
      mkRev("Esteban R.", 4.8, "Llevar agua y buen calzado. 10/10."),
    ],
    ["Imperdible", "Aventura", "Más de 15k reseñas"],
    { lat: -13.163141, lng: -72.544963 }
  ),

  mkExp(
    "rio-beach",
    "Río: playas + mirador + experiencia carioca",
    "rio",
    ["beach", "food", "nightlife"],
    "full",
    4.5,
    7890,
    ["https://picsum.photos/seed/rio1/1200/800", "https://picsum.photos/seed/rio2/1200/800"],
    "Día completo: Copacabana, miradores y comida local. Perfecto si quieres sentir la energía de Río.",
    [
      mkRev("Diana F.", 4.6, "Hermosa vista y buen ambiente."),
      mkRev("Carlos M.", 4.4, "Buen plan para ir con amigos."),
      mkRev("Luisa A.", 4.5, "Comida deliciosa. Repetiría."),
    ],
    ["Playa", "Popular", "Energía total"]
  ),

  mkExp(
    "nyc-museum",
    "NYC: museos + barrio icónico en 4 horas",
    "nyc",
    ["cultural", "photography", "family"],
    "half",
    4.6,
    10330,
    ["https://picsum.photos/seed/nyc1/1200/800", "https://picsum.photos/seed/nyc2/1200/800"],
    "Ruta eficiente para ver lo mejor sin perder tiempo: arte, calles icónicas y spots fotográficos.",
    [
      mkRev("Santiago M.", 4.7, "Muy útil si tienes poco tiempo."),
      mkRev("Marta G.", 4.6, "Me encantó el orden del recorrido."),
      mkRev("Leo P.", 4.5, "Buen balance entre museos y city walk."),
    ],
    ["Ciudad", "Cultural", "Optimizado"]
  ),

  mkExp(
    "ctg-oldtown",
    "Cartagena: ciudad amurallada + sabores del Caribe",
    "cartagena",
    ["cultural", "food", "photography"],
    "half",
    4.7,
    5120,
    ["https://picsum.photos/seed/ctg1/1200/800", "https://picsum.photos/seed/ctg2/1200/800"],
    "Camina por el centro histórico, prueba comida local y descubre spots fotogénicos con guía.",
    [
      mkRev("Paula N.", 4.8, "Me enamoré de la ciudad. Tour muy completo."),
      mkRev("Andrés V.", 4.6, "Comida deliciosa y calles hermosas."),
      mkRev("Lina S.", 4.7, "Perfecto para fotos y cultura."),
    ],
    ["Muy recomendado", "Caribe", "Top value"]
  ),

  // ASIA
  mkExp(
    "tokyo-food",
    "Tokio nocturno: street food + barrios",
    "tokyo",
    ["food", "nightlife", "cultural"],
    "half",
    4.8,
    8730,
    ["https://picsum.photos/seed/tokyo1/1200/800", "https://picsum.photos/seed/tokyo2/1200/800"],
    "Explora callejones, ramen, snacks y zonas vibrantes. Ideal para viajeros curiosos.",
    [
      mkRev("Nora K.", 5, "Me sorprendió todo. Muy auténtico."),
      mkRev("Diego S.", 4.7, "Probé cosas nuevas. Buenísimo."),
      mkRev("Miki T.", 4.8, "Gran experiencia para amantes del food."),
    ],
    ["Gastronómico", "Noche", "Altamente valorado"]
  ),

  mkExp(
    "bali-wellness",
    "Bali: día de bienestar (yoga + spa + ritual)",
    "bali",
    ["wellness", "eco", "romantic", "luxury"],
    "full",
    4.9,
    6420,
    ["https://picsum.photos/seed/bali1/1200/800", "https://picsum.photos/seed/bali2/1200/800"],
    "Un día para recargar: yoga suave, spa y ritual de relajación. Recomendado si vienes a desconectar.",
    [
      mkRev("Andrea P.", 5, "Salí renovada. Increíble atención."),
      mkRev("Sergio L.", 4.9, "Perfecto para parejas."),
      mkRev("Helena C.", 4.8, "Muy completo y bien guiado."),
    ],
    ["Bienestar", "Lujo", "Relax total"]
  ),

  mkExp(
    "bangkok-floating",
    "Bangkok: mercado flotante + templos",
    "bangkok",
    ["cultural", "food", "photography"],
    "full",
    4.6,
    7010,
    ["https://picsum.photos/seed/bkk1/1200/800", "https://picsum.photos/seed/bkk2/1200/800"],
    "Combina templos, sabores y un mercado flotante. Excelente para fotos y cultura.",
    [
      mkRev("Felipe R.", 4.6, "Gran mezcla entre cultura y comida."),
      mkRev("Sara K.", 4.5, "El mercado es lo mejor. Lleva efectivo."),
      mkRev("Jo H.", 4.7, "Muy organizado."),
    ],
    ["Cultural", "Fotos", "Popular"]
  ),

  mkExp(
    "seoul-kbeauty",
    "Seúl: K-beauty + shopping + spots virales",
    "seoul",
    ["shopping", "photography", "nightlife"],
    "half",
    4.5,
    3890,
    ["https://picsum.photos/seed/seoul1/1200/800", "https://picsum.photos/seed/seoul2/1200/800"],
    "Ruta de compras con recomendaciones reales. Perfecta si buscas productos y lugares virales.",
    [
      mkRev("Val K.", 4.6, "Encontré todo lo que quería."),
      mkRev("Jae P.", 4.4, "Buena guía y spots para fotos."),
      mkRev("Mona S.", 4.5, "Súper útil para primer viaje."),
    ],
    ["Compras", "Trendy", "Good value"]
  ),

  // ÁFRICA
  mkExp(
    "marrakech-souk",
    "Marrakech: zocos, especias y cultura local",
    "marrakech",
    ["cultural", "food", "photography"],
    "half",
    4.7,
    5120,
    ["https://picsum.photos/seed/marr1/1200/800", "https://picsum.photos/seed/marr2/1200/800"],
    "Explora mercados tradicionales y prueba sabores locales. Una inmersión cultural real.",
    [
      mkRev("Isabel M.", 4.8, "Increíble, colores y olores únicos."),
      mkRev("Hugo A.", 4.6, "Muy auténtico. Buenas recomendaciones."),
      mkRev("Noor S.", 4.7, "Me encantó el recorrido."),
    ],
    ["Cultural", "Auténtico", "Muy recomendado"]
  ),

  mkExp(
    "cape-nature",
    "Ciudad del Cabo: naturaleza + miradores",
    "cape",
    ["nature", "adventure", "photography"],
    "full",
    4.8,
    4100,
    ["https://picsum.photos/seed/cape1/1200/800", "https://picsum.photos/seed/cape2/1200/800"],
    "Rutas escénicas y miradores espectaculares. Ideal si quieres naturaleza con buen ritmo.",
    [
      mkRev("Peter B.", 4.8, "Paisajes increíbles. Muy bien guiado."),
      mkRev("Lina K.", 4.7, "Perfecto para fotos y caminatas."),
      mkRev("Ravi S.", 4.8, "Plan completo."),
    ],
    ["Naturaleza", "Aventura", "Top"]
  ),

  // OCEANÍA
  mkExp(
    "sydney-harbor",
    "Sídney: tour por la bahía + spots icónicos",
    "sydney",
    ["cultural", "photography", "family"],
    "half",
    4.6,
    6200,
    ["https://picsum.photos/seed/syd1/1200/800", "https://picsum.photos/seed/syd2/1200/800"],
    "Opera House, Harbor Bridge y miradores. Ideal para primer día en la ciudad.",
    [
      mkRev("Emma R.", 4.7, "Muy completo en poco tiempo."),
      mkRev("Tom J.", 4.5, "Buen recorrido, súper fotogénico."),
      mkRev("Santi P.", 4.6, "Recomendado para familias."),
    ],
    ["Icónico", "Familiar", "Rápido"]
  ),

  mkExp(
    "queenstown-adventure",
    "Queenstown: adrenalina (bungee + lago)",
    "queenstown",
    ["adventure", "nature"],
    "full",
    4.9,
    3380,
    ["https://picsum.photos/seed/qtn1/1200/800", "https://picsum.photos/seed/qtn2/1200/800"],
    "Para amantes de la aventura: actividades extremas y paisajes de película.",
    [
      mkRev("Leo M.", 5, "De lo mejor de mi vida."),
      mkRev("Ana T.", 4.9, "Adrenalina total. Inolvidable."),
      mkRev("Chris P.", 4.8, "Organización excelente."),
    ],
    ["Aventura", "Imperdible", "Muy recomendado"]
  ),
];

// helpers para crear
function mkRev(user, rating, text) {
  return { id: `${user}-${rating}-${text.slice(0, 6)}`, user, rating, text, date: new Date().toISOString() };
}

// extra: allow passing coords or placeId later
function mkExp(id, title, destinationId, types, duration, rating, reviewsCount, images, description, reviews, badges, extra = {}) {
  const d = DESTINATIONS.find(x => x.id === destinationId);
  return {
    id,
    title,
    destinationId,
    city: d?.label ?? "Ciudad",
    country: d?.country ?? "País",
    region: d?.region ?? "Región",
    types,
    duration, // short | half | full
    rating,
    reviewsCount,
    images,
    description,
    reviews,
    badges,
    updatedAt: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 60), // últimos 60 días
    ...extra, // {lat,lng,placeId,...}
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function ExperiencesPage() {
  const [dest, setDest] = useState(DESTINATIONS[0]); // world
  const [query, setQuery] = useState("");
  const [showSug, setShowSug] = useState(false);

  // filtros principales
  const [selectedTypes, setSelectedTypes] = useState(new Set()); // multiselección

  // filtros avanzados
  const [minRating, setMinRating] = useState(4.0);
  const [sort, setSort] = useState("recommended");
  const [duration, setDuration] = useState("any");

  // favoritos + detalle
  const [favorites, setFavorites] = useState(new Set());
  const [selected, setSelected] = useState(null);

  // “ver todas las reseñas” dentro de una card
  const [expandedReviewsId, setExpandedReviewsId] = useState(null);

  const tip = useMemo(() => {
    const countTypes = selectedTypes.size;
    if (dest.id === "world" && !query && countTypes === 0)
      return "Explora el mundo: filtra por tipo de turismo para descubrir planes que encajan contigo.";
    if (countTypes > 0)
      return `Tip: combinaste ${countTypes} intereses. Te mostramos experiencias que matchean tu estilo de viaje.`;
    if (query)
      return "Tip: usa el autocompletado para saltar directo al destino o experiencia que buscas.";
    return "Tip: filtra por calificación mínima para ver solo experiencias con reseñas consistentes.";
  }, [dest.id, query, selectedTypes]);

  // Autocomplete: destinos + títulos
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const destMatches = DESTINATIONS
      .filter(d => d.id !== "world")
      .filter(d => `${d.label} ${d.country} ${d.region}`.toLowerCase().includes(q))
      .slice(0, 4)
      .map(d => ({ kind: "dest", key: d.id, title: `${d.label}, ${d.country}`, sub: d.region, payload: d }));

    const expMatches = EXPERIENCES
      .filter(e => `${e.title} ${e.city} ${e.country}`.toLowerCase().includes(q))
      .slice(0, 6)
      .map(e => ({ kind: "exp", key: e.id, title: e.title, sub: `${e.city}, ${e.country}`, payload: e }));

    return [...destMatches, ...expMatches].slice(0, 10);
  }, [query]);

  function toggleType(typeId) {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(typeId)) next.delete(typeId);
      else next.add(typeId);
      return next;
    });
  }

  function clearFilters() {
    setSelectedTypes(new Set());
    setMinRating(4.0);
    setSort("recommended");
    setDuration("any");
  }

  function toggleFavorite(expId) {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(expId)) next.delete(expId);
      else next.add(expId);
      return next;
    });
  }

  function handlePickSuggestion(s) {
    if (s.kind === "dest") {
      setDest(s.payload);
      setQuery("");
      setShowSug(false);
      return;
    }
    if (s.kind === "exp") {
      setSelected(s.payload);
      setQuery("");
      setShowSug(false);
      return;
    }
  }

  // lista filtrada
  const filtered = useMemo(() => {
    let list = [...EXPERIENCES];

    // destino
    if (dest.id !== "world") {
      list = list.filter(e => e.destinationId === dest.id);
    }

    // tipos (si hay seleccionados, debe intersectar)
    if (selectedTypes.size > 0) {
      list = list.filter(e => e.types.some(t => selectedTypes.has(t)));
    }

    // rating
    list = list.filter(e => e.rating >= minRating);

    // duración
    if (duration !== "any") {
      list = list.filter(e => e.duration === duration);
    }

    // búsqueda libre
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(e => `${e.title} ${e.city} ${e.country} ${e.types.join(" ")}`.toLowerCase().includes(q));
    }

    // sort
    list.sort((a, b) => {
      if (sort === "topRated") return b.rating - a.rating || b.reviewsCount - a.reviewsCount;
      if (sort === "mostReviewed") return b.reviewsCount - a.reviewsCount || b.rating - a.rating;
      if (sort === "recent") return b.updatedAt - a.updatedAt || b.rating - a.rating;

      // recommended: balance
      const scoreA = a.rating * 10 + Math.log10(a.reviewsCount + 1) * 3;
      const scoreB = b.rating * 10 + Math.log10(b.reviewsCount + 1) * 3;
      return scoreB - scoreA;
    });

    return list;
  }, [dest.id, duration, minRating, query, selectedTypes, sort]);

  useEffect(() => {
    setExpandedReviewsId(null);
  }, [dest.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-[260px]">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Experiencias</h1>
          <p className="text-sm text-slate-600 mt-1">
            Descubre lugares y actividades por todo el mundo, con reseñas y calificaciones que generan confianza.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setDest(DESTINATIONS[0])}
            className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition inline-flex items-center gap-2"
            type="button"
            title="Explorar el mundo"
          >
            <Globe className="w-4 h-4" />
            Explorar el mundo
          </button>

          <button
            onClick={() => {
              setSort("recommended");
              setMinRating(4.5);
            }}
            className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition inline-flex items-center gap-2"
            type="button"
            title="Ver solo lo mejor"
          >
            <Sparkles className="w-4 h-4" />
            Lo mejor
          </button>
        </div>
      </div>

      {/* Destination + Search */}
      <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          {/* Destination select */}
          <div className="lg:col-span-4">
            <label className="text-xs text-slate-600 font-semibold">Destino</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              value={dest.id}
              onChange={(e) => {
                const next = DESTINATIONS.find(d => d.id === e.target.value);
                if (next) setDest(next);
              }}
            >
              {DESTINATIONS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.id === "world" ? "🌍 Explorar el mundo" : `${d.label} · ${d.country}`}
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-500 mt-1">
              {dest.id === "world" ? "Descubre planes globales por intereses." : `Región: ${dest.region}`}
            </div>
          </div>

          {/* Search + autocomplete */}
          <div className="lg:col-span-8 relative">
            <label className="text-xs text-slate-600 font-semibold">Buscar</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-500">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSug(true); }}
                onFocus={() => setShowSug(true)}
                onBlur={() => setTimeout(() => setShowSug(false), 120)}
                placeholder="Ej: Machu Picchu, París, ecoturismo, playa, sushi..."
                className="w-full outline-none text-sm text-slate-900 placeholder-slate-400"
              />
              {query && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setQuery("")}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 inline-flex items-center justify-center"
                  type="button"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              )}
            </div>

            {showSug && suggestions.length > 0 && (
              <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                {suggestions.map(s => (
                  <button
                    key={s.key}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handlePickSuggestion(s)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-900">{s.title}</div>
                      <span className="text-xs text-slate-500">{s.kind === "dest" ? "Destino" : "Experiencia"}</span>
                    </div>
                    <div className="text-xs text-slate-600">{s.sub}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tip */}
        <div className="mt-4 p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
          <div className="mt-0.5">
            <Sparkles className="w-5 h-5 text-sky-700" />
          </div>
          <div className="text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Inspiración</div>
            <div className="text-slate-600">{tip}</div>
          </div>
        </div>
      </div>

      {/* Tourism type filters */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-slate-900">Tipos de turismo</h2>
          <div className="text-sm text-slate-600 inline-flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros principales (multi-selección)
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {TOURISM_TYPES.map(t => {
            const active = selectedTypes.has(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleType(t.id)}
                className={`px-3 py-2 rounded-full text-sm font-semibold border transition inline-flex items-center gap-2 ${
                  active
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
                type="button"
                title={t.label}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            );
          })}

          {selectedTypes.size > 0 && (
            <button
              onClick={() => setSelectedTypes(new Set())}
              className="px-3 py-2 rounded-full text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition inline-flex items-center gap-2"
              type="button"
              title="Limpiar filtros de turismo"
            >
              <X className="w-4 h-4" />
              Limpiar turismo
            </button>
          )}
        </div>
      </div>

      {/* Advanced filters */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">Filtros avanzados</div>
                <div className="text-sm text-slate-600">Encuentra experiencias que valgan cada minuto.</div>
              </div>
              <ListFilter className="w-5 h-5 text-slate-500" />
            </div>

            <div className="mt-4 space-y-5">
              {/* Min rating */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">Calificación mínima</div>
                  <div className="text-sm text-slate-700">{minRating.toFixed(1)}+</div>
                </div>
                <input
                  type="range"
                  min={3.5}
                  max={5.0}
                  step={0.1}
                  value={minRating}
                  onChange={(e) => setMinRating(clamp(Number(e.target.value), 3.5, 5.0))}
                  className="w-full mt-2"
                />
                <div className="text-xs text-slate-500 mt-1">Tip: 4.5+ suele indicar excelencia consistente.</div>
              </div>

              {/* Duration */}
              <div>
                <div className="text-sm font-semibold text-slate-900">Duración</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {DURATIONS.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDuration(d.id)}
                      className={`px-3 py-2 rounded-xl border text-sm font-semibold transition ${
                        duration === d.id
                          ? "bg-sky-600 text-white border-sky-600"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                      type="button"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <div className="text-sm font-semibold text-slate-900">Ordenar por</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {SORTS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSort(s.id)}
                      className={`px-3 py-2 rounded-xl border text-sm font-semibold transition ${
                        sort === s.id
                          ? "bg-sky-600 text-white border-sky-600"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                      type="button"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="pt-2 border-t border-slate-200">
                <div className="text-sm font-semibold text-slate-900">Accesos rápidos</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <ChipAction onClick={() => { setMinRating(4.6); setSort("topRated"); }} label="🏆 Top mundial" />
                  <ChipAction onClick={() => { setMinRating(4.2); setSort("mostReviewed"); }} label="🔥 Populares" />
                  <ChipAction onClick={() => { setDuration("half"); }} label="⏱️ Medio día" />
                  <ChipAction onClick={() => clearFilters()} label="🧹 Reset" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-slate-600">
              Mostrando{" "}
              <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
              experiencias en{" "}
              <span className="font-semibold text-slate-900">{destLabel(dest.id)}</span>.
            </div>
            <div className="text-xs text-slate-500 inline-flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Botón “Abrir en Maps” abre el lugar real por búsqueda/coords.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(exp => (
              <ExperienceCard
                key={exp.id}
                exp={exp}
                isFav={favorites.has(exp.id)}
                onFav={() => toggleFavorite(exp.id)}
                onOpen={() => setSelected(exp)}
                expanded={expandedReviewsId === exp.id}
                onToggleReviews={() => setExpandedReviewsId(prev => (prev === exp.id ? null : exp.id))}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-4 p-6 rounded-2xl border border-slate-200 bg-white text-slate-700">
              <div className="font-semibold">No encontramos experiencias con esos filtros.</div>
              <div className="text-sm text-slate-600 mt-1">
                Prueba bajar la calificación mínima o limpiar tipos de turismo.
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Detail modal */}
      {selected && (
        <ExperienceModal
          exp={selected}
          isFav={favorites.has(selected.id)}
          onFav={() => toggleFavorite(selected.id)}
          onClose={() => setSelected(null)}
          onShare={() => {
            navigator.clipboard?.writeText(`${selected.title} — ${selected.city}, ${selected.country}`);
            alert("Copiado para compartir ✅");
          }}
          onOpenMaps={() => openInGoogleMaps(selected)}
          onSeeSimilar={(typeId) => {
            setSelected(null);
            setSelectedTypes(new Set([typeId]));
            setDest(DESTINATIONS[0]); // mundo para global
          }}
        />
      )}

      <div className="h-10" />
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function ChipAction({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
      type="button"
    >
      {label}
    </button>
  );
}

function ExperienceCard({ exp, isFav, onFav, onOpen, expanded, onToggleReviews }) {
  const img = exp.images?.[0];
  const { full, half } = stars(exp.rating);

  const topReviews = exp.reviews?.slice(0, 3) ?? [];
  const extra = expanded ? exp.reviews : topReviews;

  const badges = (exp.badges ?? []).slice(0, 3);
  const types = (exp.types ?? []).slice(0, 3);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="relative">
        <div className="w-full h-44 bg-slate-200/60 flex items-center justify-center">
          {img ? (
            <img src={img} alt={exp.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-600 inline-flex items-center gap-2">
              <ImageIcon className="w-5 h-5" /> Imagen (mock)
            </div>
          )}
        </div>

        <button
          onClick={onFav}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full border inline-flex items-center justify-center transition ${
            isFav ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white/90 border-slate-200 text-slate-700 hover:bg-white"
          }`}
          type="button"
          title="Guardar en favoritos"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <div className="font-extrabold text-slate-900 leading-snug">{exp.title}</div>

        <div className="mt-1 text-sm text-slate-600 inline-flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 text-slate-500" />
          <span>{exp.city}, {exp.country}</span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <div className="inline-flex items-center gap-1">
            {Array.from({ length: full }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400" />
            ))}
            {half && <Star className="w-4 h-4 text-amber-300" />}
          </div>
          <span className="font-semibold text-slate-900">{exp.rating.toFixed(1)}</span>
          <span className="text-slate-400">·</span>
          <span>{exp.reviewsCount.toLocaleString()} reseñas</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600">{durationLabel(exp.duration)}</span>
        </div>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map(b => (
            <span key={b} className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700">
              {b}
            </span>
          ))}
        </div>

        {/* Types */}
        <div className="mt-2 flex flex-wrap gap-2">
          {types.map(t => (
            <span key={t} className="px-2 py-1 rounded-full text-xs font-semibold bg-sky-50 border border-sky-200 text-sky-800">
              {labelFromTourism(t)}
            </span>
          ))}
        </div>

        {/* Reviews preview */}
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="text-xs font-bold text-slate-900">Reseñas destacadas</div>
          <div className="mt-2 space-y-2">
            {(extra ?? []).slice(0, expanded ? 6 : 3).map(r => (
              <div key={r.id} className="text-sm">
                <div className="text-slate-900 font-semibold inline-flex items-center gap-2">
                  {r.user}
                  <span className="text-xs text-slate-500">· ⭐ {Number(r.rating).toFixed(1)}</span>
                </div>
                <div className="text-slate-600">“{r.text}”</div>
              </div>
            ))}
          </div>

          <button
            onClick={onToggleReviews}
            className="mt-2 text-sm font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center gap-2"
            type="button"
          >
            {expanded ? "Ocultar reseñas" : "Ver todas las reseñas"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onOpen}
            className="flex-1 px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-500 text-sm font-semibold transition"
            type="button"
          >
            Ver detalle
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(`${exp.title} — ${exp.city}, ${exp.country}`);
              alert("Copiado para compartir ✅");
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold transition inline-flex items-center gap-2"
            type="button"
            title="Compartir"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function durationLabel(id) {
  if (id === "short") return "Corta";
  if (id === "half") return "Medio día";
  if (id === "full") return "Día completo";
  return "—";
}

function ExperienceModal({ exp, isFav, onFav, onClose, onShare, onOpenMaps, onSeeSimilar }) {
  const img = exp.images?.[0];
  const rest = exp.images?.slice(1, 4) ?? [];
  const types = exp.types ?? [];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3">
        <div className="w-full sm:max-w-4xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="min-w-[220px]">
              <div className="font-extrabold text-slate-900">{exp.title}</div>
              <div className="text-sm text-slate-600">
                {exp.city}, {exp.country} · ⭐ {exp.rating.toFixed(1)} · {exp.reviewsCount.toLocaleString()} reseñas
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onFav}
                className={`px-3 py-2 rounded-xl border text-sm font-semibold transition inline-flex items-center gap-2 ${
                  isFav ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
                type="button"
              >
                <Heart className="w-4 h-4" />
                {isFav ? "Guardado" : "Guardar"}
              </button>

              <button
                onClick={onShare}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold transition inline-flex items-center gap-2"
                type="button"
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </button>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full hover:bg-slate-100 inline-flex items-center justify-center"
                aria-label="Cerrar"
                type="button"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          </div>

          <div className="p-4 max-h-[78vh] overflow-auto">
            {/* Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-7 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <div className="w-full h-60 sm:h-72 bg-slate-200/60 flex items-center justify-center">
                  {img ? (
                    <img src={img} alt={exp.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-600">Galería (mock)</div>
                  )}
                </div>
              </div>
              <div className="md:col-span-5 grid grid-cols-2 gap-3">
                {rest.map((u, i) => (
                  <div key={u + i} className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={u} alt={`${exp.title} ${i + 2}`} className="w-full h-28 sm:h-36 object-cover" />
                  </div>
                ))}
                {rest.length === 0 && (
                  <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600 text-sm">
                    (Más imágenes aparecerán aquí)
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-7">
                <div className="font-bold text-slate-900">Descripción</div>
                <p className="text-sm text-slate-600 mt-1">{exp.description}</p>

                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <div className="font-bold text-slate-900">Tipo(s) de turismo</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {types.map(t => (
                      <button
                        key={t}
                        onClick={() => onSeeSimilar(t)}
                        className="px-3 py-2 rounded-full text-sm font-semibold border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 transition"
                        type="button"
                        title="Ver similares globales"
                      >
                        {labelFromTourism(t)} · Ver similares
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Tip: “Ver similares” aplica el filtro y te lleva a resultados globales.
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <div className="font-bold text-slate-900">Reseñas</div>
                  <div className="mt-3 space-y-3">
                    {(exp.reviews ?? []).map(r => (
                      <div key={r.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                          {r.user}
                          <span className="text-xs text-slate-500">· ⭐ {Number(r.rating).toFixed(1)}</span>
                        </div>
                        <div className="text-sm text-slate-600 mt-1">“{r.text}”</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-3">
                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <div className="font-bold text-slate-900 inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Ubicación
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    {exp.city}, {exp.country}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    “Abrir en Maps” muestra el lugar real por búsqueda (y pin exacto si hay coords).
                  </div>

                  <button
                    onClick={onOpenMaps}
                    className="mt-3 w-full px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 transition"
                    type="button"
                  >
                    Abrir en Maps
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-bold text-slate-900">Recomendaciones similares</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Basadas en tus intereses y reseñas.
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {types.slice(0, 4).map(t => (
                      <button
                        key={`sim-${t}`}
                        onClick={() => onSeeSimilar(t)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold transition inline-flex items-center gap-2"
                        type="button"
                      >
                        <Sparkles className="w-4 h-4 text-slate-700" />
                        Similares de {labelFromTourism(t)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-bold text-slate-900">Microcopy</div>
                  <div className="text-sm text-slate-600 mt-2">
                    “Más de <span className="font-semibold text-slate-900">{exp.reviewsCount.toLocaleString()}</span> viajeros recomiendan esta experiencia”.
                  </div>
                  <div className="text-sm text-slate-600 mt-2">
                    “Ideal para amantes de <span className="font-semibold text-slate-900">{labelFromTourism(types[0] ?? "cultural")}</span>”.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Nota: si luego conectas Google Places, puedes guardar `placeId` por experiencia y abrir exactísimo.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
