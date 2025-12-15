import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaEnvelope, FaKey, FaStar, FaPlane } from 'react-icons/fa';

const DashboardProfile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [stats, setStats] = useState({ trips: 0, points: 0 });

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username, email: user.email });
      // Simulamos algunas estadísticas
      setStats({
        trips: 12,
        points: 3450
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    const token = localStorage.getItem('token');
    console.log("🔑 Token enviado al backend:", token); // <-- LOG

    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:3004/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      login(res.data.user, token);
      setMessage({ text: 'Perfil actualizado exitosamente', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.error || 'Error al actualizar perfil',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-slate-500 animate-pulse">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Encabezado */}
        <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
          Dashboard de {user.username}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Tarjeta: Perfil */}
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center">
            <FaUser className="text-sky-600 text-4xl mb-3" />
            <h2 className="text-xl font-semibold text-slate-800">{user.username}</h2>
            <p className="text-slate-500 flex items-center gap-2 mt-2">
              <FaEnvelope /> {user.email}
            </p>
            <p className="text-slate-500 mt-1">Rol: {user.role}</p>
          </div>

          {/* Tarjeta: Viajes */}
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center">
            <FaPlane className="text-green-500 text-4xl mb-3" />
            <h2 className="text-xl font-semibold text-slate-800">Viajes Completados</h2>
            <p className="text-2xl font-bold text-slate-700 mt-2">{stats.trips}</p>
          </div>

          {/* Tarjeta: Puntos */}
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center">
            <FaStar className="text-yellow-500 text-4xl mb-3" />
            <h2 className="text-xl font-semibold text-slate-800">Puntos de Fidelidad</h2>
            <p className="text-2xl font-bold text-slate-700 mt-2">{stats.points}</p>
          </div>
        </div>

        {/* Formulario de actualización */}
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Actualizar Perfil</h2>

          {message.text && (
            <div
              className={`mb-4 px-4 py-3 rounded ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre de Usuario
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50"
                placeholder="Tu nombre de usuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-500 transition disabled:opacity-50 flex justify-center items-center"
              >
                {loading ? 'Actualizando...' : 'Actualizar Perfil'}
              </button>
              <button
                type="button"
                className="flex-1 py-2 px-4 bg-gray-200 text-slate-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition flex justify-center items-center"
              >
                <FaKey className="mr-2" /> Cambiar Contraseña
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardProfile;
