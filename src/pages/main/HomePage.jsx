import React from "react";
import { LazyMotion, domAnimation, m as motion } from "framer-motion";
import { Plane, Hotel, Car, Utensils, Compass, Calendar } from "lucide-react";
import SearchBar from "../../components/common/SearchBar";
import FilterPills from "../../components/common/FilterPills";
import { Link } from "react-router-dom";

// OPTIMIZACIÓN GLOBAL DE ANIMACIONES
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: "easeOut" }
};

export default function HomePage() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-b from-[#f6fbff] via-[#eef7fb] to-[#f7f9fc] text-slate-900 overflow-hidden">

        {/* Decorative blobs*/}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {/* Blob 1*/}
          <motion.div
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 0.42 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-[-8%] left-[-10%] w-[30rem] h-[30rem] bg-gradient-to-br from-white/50 to-[#dbeffd]/40 rounded-3xl blur-3xl"
          />

          {/* Blob 2*/}
          <motion.div
            initial={{ opacity: 0.22 }}
            animate={{ opacity: 0.30 }}
            transition={{ duration: 7, repeat: Infinity, repeatType: "reverse" }}
            className="absolute bottom-[-12%] right-[-6%] w-[40rem] h-[40rem] bg-gradient-to-br from-[#fff6f8]/40 to-white/20 rounded-full blur-3xl"
          />
        </div>

        {/* Top navigation */}
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-md border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-[#ffd7e6] to-[#dbeffd] p-2 shadow-sm">
                <span className="font-black text-xl tracking-tight">Travium</span>
              </div>
              <span className="text-sm text-slate-600">Todo en uno · Vuelos · Alojamientos · Movilidad</span>
            </div>

            <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/" className="hover:text-sky-700 transition">Inicio</Link>
              <Link to="/flights" className="hover:text-sky-700 transition">Vuelos</Link>
              <Link to="/lodging" className="hover:text-sky-700 transition">Alojamientos</Link>
              <Link to="/experiences" className="hover:text-sky-700 transition">Experiencias</Link>
            </nav>

            <div className="flex items-center gap-3">
              <button className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-white shadow-sm border border-slate-200">
                <Calendar className="w-4 h-4 text-slate-600" />
                <span className="text-slate-700">Mis viajes</span>
              </button>

              <button className="px-3 py-1.5 rounded-full text-sm bg-sky-600 text-white hover:bg-sky-500 transition">Iniciar sesión</button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Hero */}
          <section className="grid gap-10 lg:grid-cols-2 items-center">

            {/* Left */}
            <motion.div {...fadeUp} className="space-y-6" aria-labelledby="hero-heading">
              <p className="inline-flex items-center gap-2 text-sm bg-white/60 px-3 py-1 rounded-full text-slate-700 shadow-sm">
                <Compass className="w-4 h-4 text-sky-600" />
                Plataforma integrada de viajes
              </p>

              <h1 id="hero-heading" className="text-4xl md:text-5xl font-extrabold leading-tight">
                Tu viaje, <span className="text-sky-600">organizado</span> y <span className="text-rose-500">personalizado</span>.
              </h1>

              <p className="text-slate-700 max-w-2xl">
                Reservá vuelos, alojamientos, transporte y experiencias con recomendaciones inteligentes.
              </p>

              {/* Search */}
              <div className="space-y-4">
                <SearchBar placeholder="Buscar destino, ciudad o experiencia" />

                <div className="flex gap-3 items-center">
                  <FilterPills />

                  <div className="ml-auto flex gap-2">
                    <Link to="/discover" className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-500 transition shadow">
                      Explorar
                    </Link>
                    <Link to="/bookings" className="px-4 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 transition">
                      Mis reservas
                    </Link>
                  </div>
                </div>
              </div>

              {/* Feature pills */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-2">
                <FeaturePill icon={<Plane className="w-5 h-5 text-white" />} label="Vuelos" color="bg-gradient-to-br from-sky-500 to-sky-400" />
                <FeaturePill icon={<Hotel className="w-5 h-5 text-white" />} label="Alojamiento" color="bg-gradient-to-br from-rose-500 to-rose-400" />
                <FeaturePill icon={<Car className="w-5 h-5 text-white" />} label="Movilidad" color="bg-gradient-to-br from-emerald-400 to-emerald-300" />
                <FeaturePill icon={<Utensils className="w-5 h-5 text-white" />} label="Experiencias" color="bg-gradient-to-br from-amber-400 to-amber-300" />
              </div>
            </motion.div>

            {/* Right: optimized cards */}
            <motion.div initial={{ opacity: 0, scale: 0.99 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
              <div className="grid grid-cols-2 gap-4">
                <VisualCard title="Vuelos" label="Desde $XXX" imgSrc="/images/placeholder-flight.jpg" />
                <VisualCard title="Alojamiento" label="Hoteles desde $XXX" imgSrc="/images/placeholder-hotel.jpg" />
                <VisualCard title="Movilidad" label="Autos desde $XXX" imgSrc="/images/placeholder-car.jpg" />
                <VisualCard title="Experiencias" label="Tours desde $XXX" imgSrc="/images/placeholder-food.jpg" />
              </div>

              {/* CTA flotante con animación ligera */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="absolute right-2 bottom-2 bg-white/90 rounded-full shadow-md px-4 py-2 flex items-center gap-3"
              >
                <span className="text-sm font-medium">Planifica con IA</span>
                <Link to="/ai-planner" className="px-3 py-1 rounded-md bg-sky-600 text-white text-sm hover:bg-sky-500 transition">
                  Probar
                </Link>
              </motion.div>
            </motion.div>
          </section>

          {/* Detailed Sections */}
          <section className="mt-16 space-y-16">
            <DetailedSection
              id="flights"
              title="Vuelos — Rápido, confiable y al mejor precio"
              subtitle="Búsqueda multi-aerolínea, alertas de precio y optimizador de escalas"
              imgSrc="/images/placeholder-flight-large.jpg"
              reverse={false}
              bullets={[
                'Comparación en tiempo real entre aerolíneas y agencias',
                'Alertas de precio y calendario flexible',
                'Integración con itinerarios automáticos'
              ]}
            />

            <DetailedSection
              id="lodging"
              title="Alojamiento — Desde boutique hasta todo incluido"
              subtitle="Propiedades verificadas y opciones eco"
              imgSrc="/images/placeholder-hotel-large.jpg"
              reverse={true}
              bullets={[
                'Fotos y placeholders para galerías',
                'Filtros por sostenibilidad y puntuación',
                'Reservas instantáneas'
              ]}
            />

            <DetailedSection
              id="mobility"
              title="Movilidad — Tu transporte local en minutos"
              subtitle="Autos, transfers y movilidad urbana"
              imgSrc="/images/placeholder-car-large.jpg"
              reverse={false}
              bullets={[
                'Comparador de proveedores',
                'Entrega y recogida flexible',
                'Opciones eléctricas'
              ]}
            />

            <DetailedSection
              id="experiences"
              title="Experiencias — Vive la cultura local"
              subtitle="Tours y actividades curadas por expertos"
              imgSrc="/images/placeholder-food-large.jpg"
              reverse={true}
              bullets={[
                'Categorías: aventura, gourmet, cultura',
                'Cancelaciones flexibles',
                'Guías verificados'
              ]}
            />
          </section>

          {/* Footer */}
          <footer className="mt-20 border-t pt-8 border-slate-200/50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-6 px-6">
              <div>
                <h4 className="font-bold text-lg">Travium</h4>
                <p className="text-sm text-slate-600 max-w-md mt-2">
                  La plataforma que unifica todas las etapas de tu viaje.
                </p>
              </div>

              <div className="flex gap-6 text-sm text-slate-600">
                <div>
                  <p className="font-semibold">Producto</p>
                  <ul className="mt-2 space-y-1">
                    <li>Vuelos</li>
                    <li>Alojamientos</li>
                    <li>Movilidad</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Compañía</p>
                  <ul className="mt-2 space-y-1">
                    <li>Acerca</li>
                    <li>Soporte</li>
                    <li>Políticas</li>
                  </ul>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </LazyMotion>
  );
}

/** Presentational components **/

function FeaturePill({ icon, label, color }) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg text-sm text-white shadow-sm ${color}`}>
      <div className="p-2 bg-white/20 rounded-md">{icon}</div>
      <div className="font-medium">{label}</div>
    </div>
  );
}

function VisualCard({ title, label }) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-100/30 bg-white transition-all duration-300 hover:scale-[1.02]">
      <div className="w-full h-36 sm:h-44 bg-gray-100/40 flex items-end justify-start p-4">
        <div className="bg-white/70 px-3 py-1 rounded-md">
          <div className="text-xs font-semibold text-slate-800">{title}</div>
          <div className="text-sm text-slate-600">{label}</div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-700">Descripción corta o highlights del producto. (Placeholder)</p>
      </div>
    </div>
  );
}

function DetailedSection({ id, title, subtitle, imgSrc, reverse, bullets }) {
  return (
    <section id={id} className="grid gap-8 lg:grid-cols-2 items-center">
      <motion.div
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55 }}
      >
        <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200/40 bg-white">
          <div className="w-full h-64 bg-gray-200/60 flex items-center justify-center">
            <div className="text-slate-500">Imagen placeholder para: {title}</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: reverse ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55 }}
        className="space-y-4"
      >
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-slate-700">{subtitle}</p>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3 items-start">
              <div className="mt-1 w-2 h-2 rounded-full bg-sky-600/80" />
              <div className="text-sm text-slate-700">{b}</div>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-3">
          <Link to={`#${id}`} className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition">Ver más</Link>
          <Link to="/contact" className="px-4 py-2 rounded-lg border border-slate-200 text-sm">Contactar</Link>
        </div>
      </motion.div>
    </section>
  );
}
