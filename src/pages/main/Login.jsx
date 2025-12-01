// src/pages/main/Loging.jsx
import React, { useState } from "react";

const Loging = () => {
  // false = vista Registro (panel a la derecha)
  // true  = vista Login   (panel a la izquierda)
  const [isLogin, setIsLogin] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Enviando formulario:", isLogin ? "Iniciar Sesión" : "Registro");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      {/* Contenedor principal: sin tarjeta, solo layout */}
      <div className="relative w-full max-w-5xl h-[520px] overflow-hidden">
        <div className="relative flex h-full">
          {/* ===================== COLUMNA IZQUIERDA (REGISTRO) ===================== */}
          <div className="w-1/2 h-full flex items-center justify-center px-10 py-8">
            {!isLogin && (
              <div className="w-full text-slate-50">
                <h2 className="text-3xl font-bold mb-2">Registro</h2>
                <p className="text-sm text-slate-300 mb-6">
                  Crea una cuenta para empezar a disfrutar de Travium.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Usuario "
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                  />

                  <button
                    type="submit"
                    className="w-full py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-md hover:opacity-90 transition"
                  >
                    Registrarse
                  </button>
                </form>

                <div className="mt-5">
                  <p className="text-xs text-slate-400 mb-2">
                    o regístrate con plataformas sociales
                  </p>
                  <div className="flex gap-3 text-sm">
                    <button className="w-9 h-9 rounded-full border border-slate-600 flex items-center justify-center bg-slate-900">
                      G
                    </button>
                    <button className="w-9 h-9 rounded-full border border-slate-600 flex items-center justify-center bg-slate-900">
                      F
                    </button>
                    <button className="w-9 h-9 rounded-full border border-slate-600 flex items-center justify-center bg-slate-900">
                      I
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===================== COLUMNA DERECHA (LOGIN) ===================== */}
          <div className="w-1/2 h-full flex items-center justify-center px-10 py-8">
            {isLogin && (
              <div className="w-full text-slate-50">
                <h2 className="text-3xl font-bold mb-2">Iniciar Sesión</h2>
                <p className="text-sm text-slate-300 mb-6">
                  Bienvenido de nuevo, ingresa a tu cuenta.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                  />

                  <button
                    type="submit"
                    className="w-full py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-md hover:opacity-90 transition"
                  >
                    Iniciar Sesión
                  </button>
                </form>

                <button className="mt-3 text-xs text-cyan-300 hover:underline text-left">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
          </div>

          {/* ===================== PANEL AZUL ANIMADO ===================== */}
            <div
              className={`
                absolute top-0 left-0 z-20
                h-full w-1/2
                bg-gradient-to-br from-cyan-600 to-sky-900 text-white
                flex flex-col items-center justify-center text-center px-10
                transition-transform duration-[600ms] ease-in-out
                ${isLogin ? "translate-x-0" : "translate-x-full"}
                rounded-3xl
              `}
            >

            <h2 className="text-3xl font-bold mb-2">
              {isLogin ? "Hola, Amig@!" : "Bienvenido de nuevo!"}
            </h2>

            <p className="text-sm text-cyan-100 mb-6 max-w-xs">
              {isLogin
                ? "Ingresa tus datos personales y comienza tu viaje con nosotros"
                : "¿Ya tienes una cuenta?"}
            </p>

            <button
              type="button"
              onClick={() => setIsLogin((prev) => !prev)}
              className="border border-white px-8 py-2 rounded-full text-sm font-semibold hover:bg-white hover:text-sky-900 transition"
            >
              {isLogin ? "Registrarse" : "Iniciar sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loging;
