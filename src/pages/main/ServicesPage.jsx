import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Navigation,
  Phone,
  Star,
  Heart,
  Share2,
  Search,
  SlidersHorizontal,
  X,
  Clock,
  Sparkles,
  List,
  Map as MapIcon,
  LocateFixed,
} from "lucide-react";

/* =========================================================
   MOCK DATA (luego lo cambias por Google Places / backend)
========================================================= */

const CITIES = [
  { id: "bog", name: "Bogotá", country: "Colombia", lat: 4.711, lng: -74.0721 },
  { id: "med", name: "Medellín", country: "Colombia", lat: 6.2442, lng: -75.5812 },
  { id: "cal", name: "Cali", country: "Colombia", lat: 3.4516, lng: -76.532 },
  { id: "ctg", name: "Cartagena", country: "Colombia", lat: 10.391, lng: -75.4794 },
  { id: "mia", name: "Miami", country: "USA", lat: 25.7617, lng: -80.1918 },
];

const CATEGORIES = [
  { id: "pharmacy", label: "Farmacias", emoji: "💊", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  { id: "grocery", label: "Supermercados", emoji: "🛒", color: "bg-sky-50 border-sky-200 text-sky-800" },
  { id: "restaurants", label: "Restaurantes", emoji: "🍽️", color: "bg-rose-50 border-rose-200 text-rose-800" },
  { id: "cafes", label: "Cafés", emoji: "☕", color: "bg-amber-50 border-amber-200 text-amber-800" },
  { id: "medical", label: "Médicos", emoji: "🏥", color: "bg-violet-50 border-violet-200 text-violet-800" },
  { id: "gas", label: "Gasolineras", emoji: "⛽", color: "bg-slate-50 border-slate-200 text-slate-800" },
];

const FOOD_TYPES = ["Cualquiera", "Colombiana", "Italiana", "Mexicana", "Sushi", "Vegana"];
const PRICE_LEVELS = [
  { id: "any", label: "Cualquiera" },
  { id: "low", label: "Económico" },
  { id: "mid", label: "Medio" },
  { id: "premium", label: "Premium" },
];

const MOCK_PLACES = [
  // =========================
  // Bogotá
  // =========================
  {
    id: "p1",
    cityId: "bog",
    name: "Farmatodo Chapinero 24H",
    category: "pharmacy",
    address: "Cra 13 # 63-20",
    phone: "+57 601 555 0101",
    rating: 4.6,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: true, opens: "00:00", closes: "23:59" },
    lat: 4.659, lng: -74.061,
    images: ["https://picsum.photos/seed/pharmacy/900/600", "https://picsum.photos/seed/pharmacy2/900/600"],
    description: "Farmacia con medicamentos, cuidado personal y atención rápida.",
  },
  {
    id: "p2",
    cityId: "bog",
    name: "Éxito Express ParkWay",
    category: "grocery",
    address: "Cl 39 # 21-35",
    phone: "+57 601 555 0202",
    rating: 4.3,
    priceLevel: "low",
    foodType: null,
    open: { is24h: false, opens: "07:00", closes: "22:00" },
    lat: 4.636, lng: -74.066,
    images: ["https://picsum.photos/seed/grocery/900/600", "https://picsum.photos/seed/grocery2/900/600"],
    description: "Supermercado cercano con productos esenciales para tu viaje.",
  },
  {
    id: "p3",
    cityId: "bog",
    name: "La Trattoria Central",
    category: "restaurants",
    address: "Cra 7 # 32-10",
    phone: "+57 601 555 0303",
    rating: 4.8,
    priceLevel: "premium",
    foodType: "Italiana",
    open: { is24h: false, opens: "12:00", closes: "22:30" },
    lat: 4.611, lng: -74.071,
    images: ["https://picsum.photos/seed/restaurant/900/600", "https://picsum.photos/seed/restaurant2/900/600"],
    description: "Restaurante con ambiente elegante y platos recomendados por viajeros.",
  },
  {
    id: "p4",
    cityId: "bog",
    name: "Café Aurora",
    category: "cafes",
    address: "Cl 57 # 6-20",
    phone: "+57 601 555 0404",
    rating: 4.5,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: false, opens: "06:30", closes: "19:30" },
    lat: 4.647, lng: -74.059,
    images: ["https://picsum.photos/seed/cafe/900/600", "https://picsum.photos/seed/cafe2/900/600"],
    description: "Café con pastelería, wifi y mesas para trabajar.",
  },

  // --- Bogotá: más farmacias
  {
    id: "p5",
    cityId: "bog",
    name: "Cruz Verde Teusaquillo",
    category: "pharmacy",
    address: "Cl 45 # 18-14",
    phone: "+57 601 555 0510",
    rating: 4.2,
    priceLevel: "low",
    foodType: null,
    open: { is24h: false, opens: "08:00", closes: "21:30" },
    lat: 4.639, lng: -74.073,
    images: ["https://picsum.photos/seed/phb1/900/600", "https://picsum.photos/seed/phb2/900/600"],
    description: "Farmacia cercana, ideal para compras rápidas de emergencia.",
  },
  {
    id: "p6",
    cityId: "bog",
    name: "Droguería Colsubsidio 24H",
    category: "pharmacy",
    address: "Av Caracas # 59-22",
    phone: "+57 601 555 0610",
    rating: 4.4,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: true, opens: "00:00", closes: "23:59" },
    lat: 4.648, lng: -74.069,
    images: ["https://picsum.photos/seed/phb3/900/600", "https://picsum.photos/seed/phb4/900/600"],
    description: "Atención 24 horas, útil para viajeros nocturnos.",
  },

  // --- Bogotá: más supermercados
  {
    id: "p7",
    cityId: "bog",
    name: "Carulla Calle 85",
    category: "grocery",
    address: "Cl 85 # 15-20",
    phone: "+57 601 555 0710",
    rating: 4.6,
    priceLevel: "premium",
    foodType: null,
    open: { is24h: false, opens: "07:00", closes: "22:00" },
    lat: 4.669, lng: -74.056,
    images: ["https://picsum.photos/seed/grb1/900/600", "https://picsum.photos/seed/grb2/900/600"],
    description: "Supermercado premium con productos listos para viajar.",
  },
  {
    id: "p8",
    cityId: "bog",
    name: "D1 Chapinero",
    category: "grocery",
    address: "Cl 63 # 11-10",
    phone: "+57 601 555 0810",
    rating: 4.1,
    priceLevel: "low",
    foodType: null,
    open: { is24h: false, opens: "08:00", closes: "20:00" },
    lat: 4.657, lng: -74.0615,
    images: ["https://picsum.photos/seed/grb3/900/600", "https://picsum.photos/seed/grb4/900/600"],
    description: "Opción económica para compras básicas.",
  },

  // --- Bogotá: más restaurantes (con foodType para filtros)
  {
    id: "p9",
    cityId: "bog",
    name: "Sushi Nori Zona G",
    category: "restaurants",
    address: "Cl 65 # 4-45",
    phone: "+57 601 555 0910",
    rating: 4.7,
    priceLevel: "premium",
    foodType: "Sushi",
    open: { is24h: false, opens: "12:00", closes: "22:00" },
    lat: 4.653, lng: -74.058,
    images: ["https://picsum.photos/seed/rb1/900/600", "https://picsum.photos/seed/rb2/900/600"],
    description: "Sushi popular con muy buenas reseñas en la zona.",
  },
  {
    id: "p10",
    cityId: "bog",
    name: "La Esquina Vegana",
    category: "restaurants",
    address: "Cl 53 # 9-30",
    phone: "+57 601 555 1011",
    rating: 4.4,
    priceLevel: "mid",
    foodType: "Vegana",
    open: { is24h: false, opens: "11:00", closes: "20:30" },
    lat: 4.643, lng: -74.063,
    images: ["https://picsum.photos/seed/rb3/900/600", "https://picsum.photos/seed/rb4/900/600"],
    description: "Opciones veganas y saludables, ideal para viajeros fitness.",
  },
  {
    id: "p11",
    cityId: "bog",
    name: "Arepas & Café La 93",
    category: "restaurants",
    address: "Cra 13 # 93-40",
    phone: "+57 601 555 1112",
    rating: 4.3,
    priceLevel: "low",
    foodType: "Colombiana",
    open: { is24h: false, opens: "07:00", closes: "21:00" },
    lat: 4.676, lng: -74.05,
    images: ["https://picsum.photos/seed/rb5/900/600", "https://picsum.photos/seed/rb6/900/600"],
    description: "Comida colombiana rápida y económica (muy buena para desayunos).",
  },
  {
    id: "p12",
    cityId: "bog",
    name: "Pasta Fresca 72",
    category: "restaurants",
    address: "Cl 72 # 10-12",
    phone: "+57 601 555 1213",
    rating: 4.2,
    priceLevel: "mid",
    foodType: "Italiana",
    open: { is24h: false, opens: "12:00", closes: "21:30" },
    lat: 4.662, lng: -74.057,
    images: ["https://picsum.photos/seed/rb7/900/600", "https://picsum.photos/seed/rb8/900/600"],
    description: "Buen balance precio/porciones. Perfecto para familias.",
  },
  {
    id: "p13",
    cityId: "bog",
    name: "Cantina Mex 85",
    category: "restaurants",
    address: "Cl 85 # 12-18",
    phone: "+57 601 555 1314",
    rating: 4.6,
    priceLevel: "mid",
    foodType: "Mexicana",
    open: { is24h: false, opens: "13:00", closes: "23:00" },
    lat: 4.67, lng: -74.055,
    images: ["https://picsum.photos/seed/rb9/900/600", "https://picsum.photos/seed/rb10/900/600"],
    description: "Tacos y bowls. Muy recomendado para cenas.",
  },

  // --- Bogotá: más cafés
  {
    id: "p14",
    cityId: "bog",
    name: "Café Work&Go",
    category: "cafes",
    address: "Cl 70 # 11-25",
    phone: "+57 601 555 1415",
    rating: 4.6,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: false, opens: "07:00", closes: "20:00" },
    lat: 4.6595, lng: -74.062,
    images: ["https://picsum.photos/seed/cb1/900/600", "https://picsum.photos/seed/cb2/900/600"],
    description: "Café con enchufes, wifi y mesas amplias para trabajar.",
  },
  {
    id: "p15",
    cityId: "bog",
    name: "Panadería Café 26",
    category: "cafes",
    address: "Av El Dorado # 26-60",
    phone: "+57 601 555 1516",
    rating: 4.1,
    priceLevel: "low",
    foodType: null,
    open: { is24h: false, opens: "05:30", closes: "18:30" },
    lat: 4.652, lng: -74.103,
    images: ["https://picsum.photos/seed/cb3/900/600", "https://picsum.photos/seed/cb4/900/600"],
    description: "Ideal antes de ir al aeropuerto: rápido y económico.",
  },

  // --- Bogotá: médicos
  {
    id: "p16",
    cityId: "bog",
    name: "Clínica Norte Express",
    category: "medical",
    address: "Av 9 # 120-10",
    phone: "+57 601 555 1617",
    rating: 4.4,
    priceLevel: "premium",
    foodType: null,
    open: { is24h: true, opens: "00:00", closes: "23:59" },
    lat: 4.71, lng: -74.04,
    images: ["https://picsum.photos/seed/mb1/900/600", "https://picsum.photos/seed/mb2/900/600"],
    description: "Urgencias y atención 24 horas. Útil para imprevistos.",
  },
  {
    id: "p17",
    cityId: "bog",
    name: "Centro Médico Chapinero",
    category: "medical",
    address: "Cl 60 # 13-45",
    phone: "+57 601 555 1718",
    rating: 4.2,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: false, opens: "07:00", closes: "19:00" },
    lat: 4.653, lng: -74.0635,
    images: ["https://picsum.photos/seed/mb3/900/600", "https://picsum.photos/seed/mb4/900/600"],
    description: "Consulta general y exámenes básicos para viajeros.",
  },

  // --- Bogotá: gasolineras
  {
    id: "p18",
    cityId: "bog",
    name: "Terpel Calle 80",
    category: "gas",
    address: "Cl 80 # 68-20",
    phone: "+57 601 555 1819",
    rating: 4.3,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: true, opens: "00:00", closes: "23:59" },
    lat: 4.69, lng: -74.09,
    images: ["https://picsum.photos/seed/gb1/900/600", "https://picsum.photos/seed/gb2/900/600"],
    description: "Estación 24H con tienda y servicios rápidos.",
  },
  {
    id: "p19",
    cityId: "bog",
    name: "Primax Teusaquillo",
    category: "gas",
    address: "Cl 34 # 28-12",
    phone: "+57 601 555 1920",
    rating: 4.1,
    priceLevel: "low",
    foodType: null,
    open: { is24h: false, opens: "06:00", closes: "22:00" },
    lat: 4.625, lng: -74.078,
    images: ["https://picsum.photos/seed/gb3/900/600", "https://picsum.photos/seed/gb4/900/600"],
    description: "Buena opción si estás moviéndote por el centro-occidente.",
  },

  // =========================
  // Medellín (ya tenías algunos + agregamos más)
  // =========================
  {
    id: "m1",
    cityId: "med",
    name: "Farmacia San Lucas",
    category: "pharmacy",
    address: "El Poblado, Cl 20 # 43A-20",
    phone: "+57 604 555 1010",
    rating: 4.4,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: false, opens: "08:00", closes: "21:00" },
    lat: 6.209, lng: -75.567,
    images: ["https://picsum.photos/seed/medph/900/600", "https://picsum.photos/seed/medph2/900/600"],
    description: "Atención amable y surtido completo para emergencias.",
  },
  {
    id: "m2",
    cityId: "med",
    name: "Mercados La 10",
    category: "grocery",
    address: "Cl 10 # 43E-135",
    phone: "+57 604 555 2020",
    rating: 4.2,
    priceLevel: "low",
    foodType: null,
    open: { is24h: false, opens: "06:00", closes: "20:00" },
    lat: 6.2095, lng: -75.569,
    images: ["https://picsum.photos/seed/medgro/900/600", "https://picsum.photos/seed/medgro2/900/600"],
    description: "Perfecto para compras rápidas antes de salir.",
  },
  {
    id: "m3",
    cityId: "med",
    name: "Taquería Calle 10",
    category: "restaurants",
    address: "Cl 10 # 42-15",
    phone: "+57 604 555 3030",
    rating: 4.6,
    priceLevel: "mid",
    foodType: "Mexicana",
    open: { is24h: false, opens: "11:30", closes: "23:00" },
    lat: 6.208, lng: -75.571,
    images: ["https://picsum.photos/seed/medres/900/600", "https://picsum.photos/seed/medres2/900/600"],
    description: "Tacos famosos en la zona. Recomendado si viajas con amigos.",
  },

  // Medellín: cafés
  {
    id: "m4",
    cityId: "med",
    name: "Café Pergamino Poblado",
    category: "cafes",
    address: "Cra 37 # 8A-37",
    phone: "+57 604 555 4040",
    rating: 4.7,
    priceLevel: "premium",
    foodType: null,
    open: { is24h: false, opens: "07:00", closes: "19:00" },
    lat: 6.209, lng: -75.568,
    images: ["https://picsum.photos/seed/medc1/900/600", "https://picsum.photos/seed/medc2/900/600"],
    description: "Café de especialidad, excelente para trabajar o descansar.",
  },
  {
    id: "m5",
    cityId: "med",
    name: "Café Central Laureles",
    category: "cafes",
    address: "Cl 44 # 70-10",
    phone: "+57 604 555 5050",
    rating: 4.3,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: false, opens: "06:30", closes: "18:30" },
    lat: 6.245, lng: -75.592,
    images: ["https://picsum.photos/seed/medc3/900/600", "https://picsum.photos/seed/medc4/900/600"],
    description: "Ambiente tranquilo y opciones de desayuno.",
  },

  // Medellín: médicos
  {
    id: "m6",
    cityId: "med",
    name: "Clínica El Poblado (Urgencias)",
    category: "medical",
    address: "Cra 43A # 17-10",
    phone: "+57 604 555 6060",
    rating: 4.5,
    priceLevel: "premium",
    foodType: null,
    open: { is24h: true, opens: "00:00", closes: "23:59" },
    lat: 6.214, lng: -75.57,
    images: ["https://picsum.photos/seed/medm1/900/600", "https://picsum.photos/seed/medm2/900/600"],
    description: "Atención 24H, recomendado para emergencias médicas.",
  },

  // Medellín: gasolineras
  {
    id: "m7",
    cityId: "med",
    name: "Terpel Industriales 24H",
    category: "gas",
    address: "Av Industriales # 10-50",
    phone: "+57 604 555 7070",
    rating: 4.2,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: true, opens: "00:00", closes: "23:59" },
    lat: 6.223, lng: -75.579,
    images: ["https://picsum.photos/seed/medg1/900/600", "https://picsum.photos/seed/medg2/900/600"],
    description: "Parada rápida con tienda, ideal si vas hacia el aeropuerto.",
  },

  // =========================
  // Cali
  // =========================
  {
    id: "c1",
    cityId: "cal",
    name: "Farmacia 24H San Fernando",
    category: "pharmacy",
    address: "Cl 5 # 36-20",
    phone: "+57 602 555 1111",
    rating: 4.3,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: true, opens: "00:00", closes: "23:59" },
    lat: 3.424, lng: -76.55,
    images: ["https://picsum.photos/seed/calph1/900/600", "https://picsum.photos/seed/calph2/900/600"],
    description: "Farmacia 24H con buena disponibilidad de medicamentos.",
  },
  {
    id: "c2",
    cityId: "cal",
    name: "Súper Inter Centro",
    category: "grocery",
    address: "Cl 14 # 5-40",
    phone: "+57 602 555 2222",
    rating: 4.0,
    priceLevel: "low",
    foodType: null,
    open: { is24h: false, opens: "07:00", closes: "21:00" },
    lat: 3.452, lng: -76.531,
    images: ["https://picsum.photos/seed/calg1/900/600", "https://picsum.photos/seed/calg2/900/600"],
    description: "Compras esenciales cerca del centro de la ciudad.",
  },
  {
    id: "c3",
    cityId: "cal",
    name: "Restaurante Pacífico",
    category: "restaurants",
    address: "Av 6N # 24N-10",
    phone: "+57 602 555 3333",
    rating: 4.6,
    priceLevel: "premium",
    foodType: "Colombiana",
    open: { is24h: false, opens: "12:00", closes: "22:00" },
    lat: 3.49, lng: -76.52,
    images: ["https://picsum.photos/seed/calr1/900/600", "https://picsum.photos/seed/calr2/900/600"],
    description: "Comida del pacífico y platos típicos recomendados.",
  },
  {
    id: "c4",
    cityId: "cal",
    name: "Café del Río",
    category: "cafes",
    address: "Cl 2 # 8-35",
    phone: "+57 602 555 4444",
    rating: 4.2,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: false, opens: "07:00", closes: "19:00" },
    lat: 3.451, lng: -76.535,
    images: ["https://picsum.photos/seed/calc1/900/600", "https://picsum.photos/seed/calc2/900/600"],
    description: "Café tranquilo con buenas opciones de desayuno.",
  },
  {
    id: "c5",
    cityId: "cal",
    name: "Centro Médico Valle Salud",
    category: "medical",
    address: "Cl 9 # 42-10",
    phone: "+57 602 555 5555",
    rating: 4.1,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: false, opens: "08:00", closes: "18:00" },
    lat: 3.428, lng: -76.53,
    images: ["https://picsum.photos/seed/calm1/900/600", "https://picsum.photos/seed/calm2/900/600"],
    description: "Consultas generales y atención rápida.",
  },
  {
    id: "c6",
    cityId: "cal",
    name: "Primax Autopista 24H",
    category: "gas",
    address: "Autopista Suroriental # 30-12",
    phone: "+57 602 555 6666",
    rating: 4.0,
    priceLevel: "low",
    foodType: null,
    open: { is24h: true, opens: "00:00", closes: "23:59" },
    lat: 3.415, lng: -76.52,
    images: ["https://picsum.photos/seed/calgas1/900/600", "https://picsum.photos/seed/calgas2/900/600"],
    description: "Estación 24H ideal si sales temprano de la ciudad.",
  },

  // =========================
  // Cartagena
  // =========================
  {
    id: "t1",
    cityId: "ctg",
    name: "Farmacia Bocagrande",
    category: "pharmacy",
    address: "Av San Martín # 7-80",
    phone: "+57 605 555 1111",
    rating: 4.2,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: false, opens: "08:00", closes: "22:00" },
    lat: 10.401, lng: -75.553,
    images: ["https://picsum.photos/seed/ctgph1/900/600", "https://picsum.photos/seed/ctgph2/900/600"],
    description: "Farmacia cerca de hoteles y zonas turísticas.",
  },
  {
    id: "t2",
    cityId: "ctg",
    name: "Mercado Express Centro",
    category: "grocery",
    address: "Cl 30 # 8-15",
    phone: "+57 605 555 2222",
    rating: 4.0,
    priceLevel: "low",
    foodType: null,
    open: { is24h: false, opens: "07:00", closes: "21:00" },
    lat: 10.423, lng: -75.549,
    images: ["https://picsum.photos/seed/ctgg1/900/600", "https://picsum.photos/seed/ctgg2/900/600"],
    description: "Compras esenciales para tu estancia en la ciudad amurallada.",
  },
  {
    id: "t3",
    cityId: "ctg",
    name: "Mar y Sazón",
    category: "restaurants",
    address: "Getsemaní, Cl 29 # 10-20",
    phone: "+57 605 555 3333",
    rating: 4.7,
    priceLevel: "premium",
    foodType: "Colombiana",
    open: { is24h: false, opens: "12:00", closes: "23:00" },
    lat: 10.422, lng: -75.546,
    images: ["https://picsum.photos/seed/ctgr1/900/600", "https://picsum.photos/seed/ctgr2/900/600"],
    description: "Mariscos y platos típicos muy recomendados por turistas.",
  },
  {
    id: "t4",
    cityId: "ctg",
    name: "Café Murallas",
    category: "cafes",
    address: "Centro, Cl 34 # 3-40",
    phone: "+57 605 555 4444",
    rating: 4.4,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: false, opens: "08:00", closes: "20:00" },
    lat: 10.425, lng: -75.551,
    images: ["https://picsum.photos/seed/ctgc1/900/600", "https://picsum.photos/seed/ctgc2/900/600"],
    description: "Café fresco, ideal para descansar del calor.",
  },
  {
    id: "t5",
    cityId: "ctg",
    name: "Centro Médico Bocagrande",
    category: "medical",
    address: "Av San Martín # 6-30",
    phone: "+57 605 555 5555",
    rating: 4.1,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: false, opens: "08:00", closes: "18:00" },
    lat: 10.399, lng: -75.554,
    images: ["https://picsum.photos/seed/ctgm1/900/600", "https://picsum.photos/seed/ctgm2/900/600"],
    description: "Consultas generales y atención al viajero.",
  },
  {
    id: "t6",
    cityId: "ctg",
    name: "Terpel Bocagrande 24H",
    category: "gas",
    address: "Av San Martín # 5-90",
    phone: "+57 605 555 6666",
    rating: 4.0,
    priceLevel: "low",
    foodType: null,
    open: { is24h: true, opens: "00:00", closes: "23:59" },
    lat: 10.398, lng: -75.555,
    images: ["https://picsum.photos/seed/ctggas1/900/600", "https://picsum.photos/seed/ctggas2/900/600"],
    description: "Estación 24H cerca de la zona hotelera.",
  },

  // =========================
  // Miami
  // =========================
  {
    id: "mi1",
    cityId: "mia",
    name: "Walgreens Downtown 24H",
    category: "pharmacy",
    address: "200 Biscayne Blvd",
    phone: "+1 (305) 555-1000",
    rating: 4.2,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: true, opens: "00:00", closes: "23:59" },
    lat: 25.775, lng: -80.187,
    images: ["https://picsum.photos/seed/miaph1/900/600", "https://picsum.photos/seed/miaph2/900/600"],
    description: "Farmacia 24H ideal si llegas tarde o necesitas algo urgente.",
  },
  {
    id: "mi2",
    cityId: "mia",
    name: "Whole Foods Market",
    category: "grocery",
    address: "299 SE 3rd Ave",
    phone: "+1 (305) 555-2000",
    rating: 4.6,
    priceLevel: "premium",
    foodType: null,
    open: { is24h: false, opens: "08:00", closes: "22:00" },
    lat: 25.771, lng: -80.189,
    images: ["https://picsum.photos/seed/miag1/900/600", "https://picsum.photos/seed/miag2/900/600"],
    description: "Supermercado con opciones saludables y listas para llevar.",
  },
  {
    id: "mi3",
    cityId: "mia",
    name: "Taco Harbor",
    category: "restaurants",
    address: "Brickell Ave # 100",
    phone: "+1 (305) 555-3000",
    rating: 4.4,
    priceLevel: "mid",
    foodType: "Mexicana",
    open: { is24h: false, opens: "12:00", closes: "23:00" },
    lat: 25.766, lng: -80.191,
    images: ["https://picsum.photos/seed/miar1/900/600", "https://picsum.photos/seed/miar2/900/600"],
    description: "Restaurante casual, bueno para almuerzo/cena sin gastar de más.",
  },
  {
    id: "mi4",
    cityId: "mia",
    name: "Coffee Bay Brickell",
    category: "cafes",
    address: "701 S Miami Ave",
    phone: "+1 (305) 555-4000",
    rating: 4.5,
    priceLevel: "mid",
    foodType: null,
    open: { is24h: false, opens: "06:30", closes: "18:30" },
    lat: 25.765, lng: -80.193,
    images: ["https://picsum.photos/seed/miac1/900/600", "https://picsum.photos/seed/miac2/900/600"],
    description: "Café con buen wifi. Perfecto si estás trabajando durante el viaje.",
  },
  {
    id: "mi5",
    cityId: "mia",
    name: "Urgent Care Downtown",
    category: "medical",
    address: "50 NE 2nd Ave",
    phone: "+1 (305) 555-5000",
    rating: 4.1,
    priceLevel: "premium",
    foodType: null,
    open: { is24h: false, opens: "08:00", closes: "20:00" },
    lat: 25.776, lng: -80.19,
    images: ["https://picsum.photos/seed/miam1/900/600", "https://picsum.photos/seed/miam2/900/600"],
    description: "Atención rápida para viajeros (no es emergencia hospitalaria).",
  },
  {
    id: "mi6",
    cityId: "mia",
    name: "Shell Gas Station 24H",
    category: "gas",
    address: "1200 Biscayne Blvd",
    phone: "+1 (305) 555-6000",
    rating: 4.0,
    priceLevel: "low",
    foodType: null,
    open: { is24h: true, opens: "00:00", closes: "23:59" },
    lat: 25.783, lng: -80.187,
    images: ["https://picsum.photos/seed/miagas1/900/600", "https://picsum.photos/seed/miagas2/900/600"],
    description: "Estación 24H, ideal si alquilas vehículo y te mueves de noche.",
  },
];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function isOpenNow(open) {
  if (!open) return false;
  if (open.is24h) return true;
  const n = nowMinutes();
  const a = toMinutes(open.opens);
  const b = toMinutes(open.closes);
  // simple (no cruzamos medianoche en mock)
  return n >= a && n <= b;
}

function kmApprox(a, b) {
  // aproximación simple para mock
  const dx = (a.lat - b.lat) * 111;
  const dy = (a.lng - b.lng) * 111;
  return Math.sqrt(dx * dx + dy * dy);
}

function priceLabel(level) {
  if (level === "low") return "Económico";
  if (level === "mid") return "Medio";
  if (level === "premium") return "Premium";
  return "—";
}

/* =========================================================
   PAGE
========================================================= */

export default function ServicesPage() {
  const [city, setCity] = useState(CITIES[0]);
  const [useMyLocation, setUseMyLocation] = useState(false);

  // mock "my location": si no usamos ubicación, usamos centro de ciudad
  const [myPos, setMyPos] = useState({ lat: city.lat, lng: city.lng });

  const [query, setQuery] = useState("");
  const [showSug, setShowSug] = useState(false);

  const [activeCat, setActiveCat] = useState("pharmacy");
  const [view, setView] = useState("list"); // list | map

  // filtros
  const [nearKm, setNearKm] = useState(8); // filtro por cercanía
  const [openNow, setOpenNow] = useState(false);
  const [open24h, setOpen24h] = useState(false);
  const [bestRated, setBestRated] = useState(false);
  const [priceLevel, setPriceLevel] = useState("any");
  const [foodType, setFoodType] = useState("Cualquiera");

  // detalle + favoritos + historial
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [history, setHistory] = useState([]);

  // microcopy contextual
  const tip = useMemo(() => {
    const h = new Date().getHours();
    if (activeCat === "pharmacy" && (h >= 20 || h <= 6)) return "Farmacia abierta cerca de ti: revisa opciones 24H.";
    if (activeCat === "restaurants" && h >= 11 && h <= 15) return "Hora pico de almuerzo: filtra por “Mejor calificados”.";
    if (activeCat === "cafes" && h <= 11) return "¿Buscas algo rápido? Los cafés cercanos suelen tener mejor disponibilidad.";
    return "Usa “Cómo llegar” para abrir la ruta y ahorrar tiempo en tu trayecto.";
  }, [activeCat]);

  // autocompletado (mock) sobre lugares
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOCK_PLACES.filter(p => p.cityId === city.id)
      .filter(p => `${p.name} ${p.address}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, city.id]);

  // recomputar posición al cambiar ciudad (si no usas ubicación)
  useEffect(() => {
    if (!useMyLocation) setMyPos({ lat: city.lat, lng: city.lng });
  }, [city, useMyLocation]);

  async function handleUseMyLocation() {
    setUseMyLocation(true);

    // intenta geolocalización real
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // fallback mock si el usuario niega
          setMyPos({ lat: city.lat, lng: city.lng });
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      // fallback
      setMyPos({ lat: city.lat, lng: city.lng });
    }
  }

  function handlePickPlace(p) {
    setSelected(p);
    setHistory(prev => {
      const next = [p, ...prev.filter(x => x.id !== p.id)];
      return next.slice(0, 8);
    });
    setShowSug(false);
    setQuery("");
  }

  function toggleFavorite(id) {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filteredPlaces = useMemo(() => {
    const base = MOCK_PLACES.filter(p => p.cityId === city.id && p.category === activeCat);

    return base
      .map(p => ({
        ...p,
        isOpen: isOpenNow(p.open),
        distanceKm: kmApprox(myPos, p),
      }))
      .filter(p => p.distanceKm <= nearKm)
      .filter(p => (openNow ? p.isOpen : true))
      .filter(p => (open24h ? p.open?.is24h : true))
      .filter(p => (priceLevel !== "any" ? p.priceLevel === priceLevel : true))
      .filter(p => {
        if (p.category !== "restaurants") return true;
        if (foodType === "Cualquiera") return true;
        return p.foodType === foodType;
      })
      .sort((a, b) => {
        if (bestRated) return b.rating - a.rating;
        // por defecto: cercanía + rating
        return a.distanceKm - b.distanceKm || b.rating - a.rating;
      });
  }, [activeCat, bestRated, city.id, foodType, nearKm, open24h, openNow, priceLevel, myPos]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Servicios</h1>
          <p className="text-sm text-slate-600 mt-1">
            Encuentra lugares útiles durante tu viaje: farmacias, comida, supermercados y más.
          </p>
        </div>

        {/* List/Map toggle */}
        <div className="inline-flex rounded-full border border-slate-200 bg-white shadow-sm p-1">
          <button
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              view === "list" ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-50"
            }`}
            onClick={() => setView("list")}
            type="button"
          >
            <span className="inline-flex items-center gap-2"><List className="w-4 h-4" /> Lista</span>
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              view === "map" ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-50"
            }`}
            onClick={() => setView("map")}
            type="button"
          >
            <span className="inline-flex items-center gap-2"><MapIcon className="w-4 h-4" /> Mapa</span>
          </button>
        </div>
      </div>

      {/* City + Search */}
      <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          {/* City */}
          <div className="lg:col-span-4">
            <label className="text-xs text-slate-600 font-semibold">Ciudad destino</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              value={city.id}
              onChange={(e) => {
                const next = CITIES.find(c => c.id === e.target.value);
                if (next) setCity(next);
              }}
            >
              {CITIES.map(c => (
                <option key={c.id} value={c.id}>{c.name} · {c.country}</option>
              ))}
            </select>
          </div>

          {/* Use my location */}
          <div className="lg:col-span-3">
            <label className="text-xs text-slate-600 font-semibold">Ubicación</label>
            <button
              onClick={handleUseMyLocation}
              className={`mt-1 w-full inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                useMyLocation
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              type="button"
              title="Usar mi ubicación actual"
            >
              <LocateFixed className="w-4 h-4" />
              {useMyLocation ? "Ubicación activada" : "Usar mi ubicación"}
            </button>
          </div>

          {/* Search with suggestions */}
          <div className="lg:col-span-5 relative">
            <label className="text-xs text-slate-600 font-semibold">Buscar lugar</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-sky-500">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSug(true); }}
                onFocus={() => setShowSug(true)}
                onBlur={() => setTimeout(() => setShowSug(false), 120)}
                placeholder="Ej: farmacia 24 horas, sushi, mercado…"
                className="w-full outline-none text-sm text-slate-900 placeholder-slate-400"
              />
            </div>

            {showSug && suggestions.length > 0 && (
              <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                {suggestions.map(p => (
                  <button
                    key={p.id}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handlePickPlace(p)}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <span className="text-xs text-slate-500">{p.address}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      {CATEGORIES.find(c => c.id === p.category)?.label ?? "Servicio"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pro tip */}
        <div className="mt-4 p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
          <div className="mt-0.5">
            <Sparkles className="w-5 h-5 text-sky-700" />
          </div>
          <div className="text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Tip rápido</div>
            <div className="text-slate-600">{tip}</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-slate-900">Categorías</h2>
          <div className="text-sm text-slate-600 inline-flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros inteligentes (se sincronizan con mapa/lista)
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(cat => {
            const active = cat.id === activeCat;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`rounded-2xl border p-4 text-left shadow-sm transition hover:bg-slate-50 ${
                  active ? cat.color : "bg-white border-slate-200 text-slate-800"
                }`}
                type="button"
              >
                <div className="text-2xl">{cat.emoji}</div>
                <div className="mt-2 font-bold">{cat.label}</div>
                <div className="text-xs mt-1 opacity-80">Explorar cerca</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">Filtros</div>
                <div className="text-sm text-slate-600">Encuentra lo que necesitas sin perder tiempo.</div>
              </div>
              <SlidersHorizontal className="w-5 h-5 text-slate-500" />
            </div>

            <div className="mt-4 space-y-5">
              {/* Near */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">Cercanía</div>
                  <div className="text-sm text-slate-700">{nearKm} km</div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  step={1}
                  value={nearKm}
                  onChange={(e) => setNearKm(clamp(Number(e.target.value), 1, 25))}
                  className="w-full mt-2"
                />
                <div className="text-xs text-slate-500 mt-1">Tip: 3–8 km funciona bien caminando o en taxi.</div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-2">
                <ToggleChip active={openNow} onClick={() => setOpenNow(v => !v)}>⏰ Abierto ahora</ToggleChip>
                <ToggleChip active={open24h} onClick={() => setOpen24h(v => !v)}>🌙 24 horas</ToggleChip>
                <ToggleChip active={bestRated} onClick={() => setBestRated(v => !v)}>⭐ Mejor calificados</ToggleChip>
              </div>

              {/* Price */}
              <div>
                <div className="text-sm font-semibold text-slate-900">Rango de precios</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {PRICE_LEVELS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPriceLevel(p.id)}
                      className={`px-3 py-2 rounded-xl border text-sm font-semibold transition ${
                        priceLevel === p.id ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                      type="button"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food type only for restaurants */}
              {activeCat === "restaurants" && (
                <div>
                  <div className="text-sm font-semibold text-slate-900">Tipo de comida</div>
                  <select
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                  >
                    {FOOD_TYPES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Recent & favorites quick actions */}
              <div className="pt-2 border-t border-slate-200">
                <div className="text-sm font-semibold text-slate-900">Accesos rápidos</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <ToggleChip active={false} onClick={() => { setOpenNow(true); setNearKm(5); }}>
                    📍 Cercanos
                  </ToggleChip>
                  <ToggleChip active={false} onClick={() => { setBestRated(true); }}>
                    🏆 Top
                  </ToggleChip>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="font-bold text-slate-900">Historial</div>
              <div className="text-sm text-slate-600">Lugares que abriste recientemente.</div>

              <div className="mt-3 space-y-2">
                {history.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                    type="button"
                  >
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-600">{p.address}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Results / Map */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-slate-600">
              Mostrando <span className="font-semibold text-slate-900">{filteredPlaces.length}</span> resultados en{" "}
              <span className="font-semibold text-slate-900">{city.name}</span>.
            </div>
            <div className="text-xs text-slate-500 inline-flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Estado “Abierto” se calcula con la hora actual (mock).
            </div>
          </div>

          {view === "map" ? (
            <MapMock
              city={city}
              myPos={myPos}
              points={filteredPlaces}
              onSelect={(p) => setSelected(p)}
              activeCat={activeCat}
            />
          ) : (
            <div className="mt-4 space-y-3">
              {filteredPlaces.map(p => (
                <PlaceCard
                  key={p.id}
                  place={p}
                  isFav={favorites.has(p.id)}
                  onFav={() => toggleFavorite(p.id)}
                  onOpen={() => setSelected(p)}
                  onCall={() => window.open(`tel:${p.phone}`, "_self")}
                  onDirections={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`, "_blank")}
                />
              ))}

              {filteredPlaces.length === 0 && (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white text-slate-700">
                  <div className="font-semibold">No encontramos resultados con estos filtros.</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Prueba aumentando la cercanía o desactiva “Abierto ahora”.
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Detail modal */}
      {selected && (
        <DetailModal
          place={selected}
          isFav={favorites.has(selected.id)}
          onFav={() => toggleFavorite(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}

      <div className="h-10" />
    </div>
  );
}

/* =========================================================
   UI pieces
========================================================= */

function ToggleChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
        active ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      }`}
      type="button"
    >
      {children}
    </button>
  );
}

function PlaceCard({ place, isFav, onFav, onOpen, onCall, onDirections }) {
  const catLabel = CATEGORIES.find(c => c.id === place.category)?.label ?? "Servicio";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-[260px]">
          <div className="flex items-center gap-2">
            <div className="font-bold text-slate-900">{place.name}</div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              place.isOpen ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}>
              {place.isOpen ? "Abierto" : "Cerrado"}
            </span>
          </div>

          <div className="mt-1 text-sm text-slate-600">{catLabel}</div>

          <div className="mt-2 text-sm text-slate-700 inline-flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-slate-500" />
            <span>{place.address}</span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-900">{place.rating}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">{priceLabel(place.priceLevel)}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">{place.distanceKm.toFixed(1)} km</span>
          </div>

          <div className="mt-2 text-xs text-slate-500">
            Horario: {place.open?.is24h ? "24 horas" : `${place.open?.opens} – ${place.open?.closes}`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onFav}
            className={`w-10 h-10 rounded-full border inline-flex items-center justify-center transition ${
              isFav ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            title="Guardar en favoritos"
            type="button"
          >
            <Heart className="w-5 h-5" />
          </button>

          <button
            onClick={onCall}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold transition inline-flex items-center gap-2"
            type="button"
          >
            <Phone className="w-4 h-4" />
            Llamar
          </button>

          <button
            onClick={onDirections}
            className="px-3 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-500 text-sm font-semibold transition inline-flex items-center gap-2"
            type="button"
          >
            <Navigation className="w-4 h-4" />
            Cómo llegar
          </button>

          <button
            onClick={onOpen}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold transition"
            type="button"
          >
            Ver detalle
          </button>
        </div>
      </div>
    </div>
  );
}

function MapMock({ city, myPos, points, onSelect, activeCat }) {
  // Mapa mock: panel con “pines” clicables
  const cat = CATEGORIES.find(c => c.id === activeCat);
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
        <div>
          <div className="font-bold text-slate-900">Mapa (mock)</div>
          <div className="text-sm text-slate-600">
            Pines de {cat?.label ?? "servicios"} en {city.name}. (Luego conectas Leaflet/Mapbox)
          </div>
        </div>
        <div className="text-xs text-slate-500 inline-flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Centro: {city.lat.toFixed(3)}, {city.lng.toFixed(3)}
        </div>
      </div>

      <div className="p-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm text-slate-700">
            <span className="font-semibold">Tu posición:</span> {myPos.lat.toFixed(3)}, {myPos.lng.toFixed(3)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Vista lista ↔ mapa sincronizada. Click en un pin para abrir detalle.
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {points.map(p => (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                className="text-left rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 transition"
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-bold text-slate-900">{p.name}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    p.isOpen ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {p.isOpen ? "Abierto" : "Cerrado"}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1">{p.address}</div>
                <div className="text-xs text-slate-500 mt-1">{p.distanceKm.toFixed(1)} km</div>
              </button>
            ))}

            {points.length === 0 && (
              <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-700">
                No hay pines con estos filtros.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ place, isFav, onFav, onClose }) {
  const catLabel = CATEGORIES.find(c => c.id === place.category)?.label ?? "Servicio";
  const img = place.images?.[0];

  const week = [
    { d: "Lunes", h: place.open?.is24h ? "24H" : `${place.open?.opens} – ${place.open?.closes}` },
    { d: "Martes", h: place.open?.is24h ? "24H" : `${place.open?.opens} – ${place.open?.closes}` },
    { d: "Miércoles", h: place.open?.is24h ? "24H" : `${place.open?.opens} – ${place.open?.closes}` },
    { d: "Jueves", h: place.open?.is24h ? "24H" : `${place.open?.opens} – ${place.open?.closes}` },
    { d: "Viernes", h: place.open?.is24h ? "24H" : `${place.open?.opens} – ${place.open?.closes}` },
    { d: "Sábado", h: place.open?.is24h ? "24H" : `${place.open?.opens} – ${place.open?.closes}` },
    { d: "Domingo", h: place.open?.is24h ? "24H" : `${place.open?.opens} – ${place.open?.closes}` },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3">
        <div className="w-full sm:max-w-3xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div>
              <div className="font-bold text-slate-900">{place.name}</div>
              <div className="text-sm text-slate-600">{catLabel} · {priceLabel(place.priceLevel)} · ⭐ {place.rating}</div>
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
                onClick={() => {
                  navigator.clipboard?.writeText(`${place.name} - ${place.address}`);
                  alert("Copiado para compartir ✅");
                }}
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

          <div className="p-4 max-h-[75vh] overflow-auto">
            {/* Gallery mock */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
              <div className="w-full h-56 sm:h-72 bg-slate-200/60 flex items-center justify-center">
                {img ? (
                  <img src={img} alt={place.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-600">Galería de imágenes (mock)</div>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-7">
                <div className="font-bold text-slate-900">Descripción</div>
                <p className="text-sm text-slate-600 mt-1">{place.description}</p>

                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <div className="font-bold text-slate-900 inline-flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-700" />
                    Horarios (mock)
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    {week.map(x => (
                      <div key={x.d} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-700 font-semibold">{x.d}</span>
                        <span className="text-slate-600">{x.h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-bold text-slate-900">Contacto</div>
                  <div className="text-sm text-slate-600 mt-1">{place.phone}</div>

                  <button
                    onClick={() => window.open(`tel:${place.phone}`, "_self")}
                    className="mt-3 w-full px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 transition inline-flex items-center justify-center gap-2"
                    type="button"
                  >
                    <Phone className="w-4 h-4" />
                    Llamar ahora
                  </button>

                  <button
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, "_blank")}
                    className="mt-2 w-full px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-semibold transition inline-flex items-center justify-center gap-2"
                    type="button"
                  >
                    <Navigation className="w-4 h-4" />
                    Cómo llegar
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <div className="font-bold text-slate-900">Ubicación (mock)</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {place.address}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Tip: Aquí puedes integrar un mapa real (Leaflet/Mapbox) mostrando un pin exacto.
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-bold text-slate-900">Opiniones (mock)</div>
                  <div className="text-sm text-slate-600 mt-1">
                    “Excelente servicio y buena ubicación.” · ⭐ {place.rating}
                  </div>
                  <div className="text-sm text-slate-600 mt-2">
                    “Recomendado para viajeros.” · ⭐ {Math.max(4.0, (place.rating - 0.2)).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Nota: Esta vista está lista para conectar con Google Places / Maps y datos reales sin cambiar la UI.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
