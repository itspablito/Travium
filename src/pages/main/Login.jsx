import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true); // true = login
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await axios.post(url, formData);
      console.log("Respuesta del servidor:", res.data);
      alert(isLogin ? "Login exitoso!" : "Registro exitoso!");
      if (isLogin) localStorage.setItem("token", res.data.token);
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.error || "Error del servidor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6fbff] px-4">
      <div className="relative w-full max-w-5xl h-[520px] overflow-hidden rounded-3xl shadow-xl bg-white">
        <div className="relative flex h-full">

          {/* IZQUIERDA = Registro */}
          <div className="w-1/2 h-full flex items-center justify-center px-10 py-8">
            {!isLogin && (
              <div className="w-full text-slate-900">
                <h2 className="text-3xl font-bold mb-2">Registro</h2>
                <p className="text-sm text-slate-600 mb-6">Crea una cuenta para empezar a disfrutar de Travium.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input name="username" type="text" placeholder="Usuario" onChange={handleChange} className="w-full ..." />
                  <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full ..." />
                  <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} className="w-full ..." />
                  <button type="submit" className="w-full py-2 rounded-full bg-sky-600 text-white font-semibold text-sm">Registrarse</button>
                </form>
              </div>
            )}
          </div>

          {/* DERECHA = Login */}
          <div className="w-1/2 h-full flex items-center justify-center px-10 py-8">
            {isLogin && (
              <div className="w-full text-slate-900">
                <h2 className="text-3xl font-bold mb-2">Iniciar Sesión</h2>
                <p className="text-sm text-slate-600 mb-6">Bienvenido de nuevo, ingresa a tu cuenta.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full ..." />
                  <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} className="w-full ..." />
                  <button type="submit" className="w-full py-2 rounded-full bg-sky-600 text-white font-semibold text-sm">Iniciar Sesión</button>
                </form>
              </div>
            )}
          </div>

          {/* PANEL AZUL */}
          <div className={`absolute top-0 left-0 z-20 h-full w-1/2 bg-gradient-to-br from-sky-600 to-cyan-500 flex flex-col items-center justify-center text-center px-10 transition-transform duration-[600ms] ease-in-out ${isLogin ? "translate-x-0" : "translate-x-full"} rounded-3xl`}>
            <h2 className="text-3xl font-bold mb-2">{isLogin ? "Hola, Amig@!" : "Bienvenido de nuevo!"}</h2>
            <p className="text-sm text-sky-100 mb-6 max-w-xs">{isLogin ? "Ingresa tus datos personales y comienza tu viaje con nosotros" : "¿Ya tienes una cuenta?"}</p>
            <button type="button" onClick={() => setIsLogin((prev) => !prev)} className="border border-white px-8 py-2 rounded-full text-sm font-semibold hover:bg-white hover:text-sky-700 transition">{isLogin ? "Registrarse" : "Iniciar sesión"}</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
