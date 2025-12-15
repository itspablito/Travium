import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPlane, FaStar, FaCog, FaHeart, FaBell, FaKey } from 'react-icons/fa';

import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const DashboardProfile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [stats, setStats] = useState({ trips: 0, points: 0, upcoming: 0 });
  const [preferences, setPreferences] = useState({ seat: 'Ventana', airline: 'Cualquier' });

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username, email: user.email });
      // Simulación de datos
      setStats({ trips: 24, points: 5420, upcoming: 3 });
      setPreferences({ seat: 'Ventana', airline: 'Aerolínea Favorita: SkyAir' });
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
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
      setMessage({ text: err.response?.data?.error || 'Error al actualizar perfil', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen bg-gray-50 animate-pulse text-gray-400">Cargando perfil...</div>;

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar Izquierda */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm p-6 hidden lg:flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Menú</h2>
          <nav className="flex flex-col gap-4 text-gray-700">
            <button className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition"><FaUser /> Perfil</button>
            <button className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition"><FaPlane /> Mis Viajes</button>
            <button className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition"><FaStar /> Puntos de Fidelidad</button>
            <button className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition"><FaCog /> Configuración</button>
          </nav>
        </div>
        <div className="mt-10">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Preferencias</h3>
          <p className="text-gray-700 text-sm mb-1">Asiento: {preferences.seat}</p>
          <p className="text-gray-700 text-sm">{preferences.airline}</p>
        </div>
      </aside>

      {/* Panel Central */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8">Bienvenido, {user.username}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Perfil */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-md transition">
            <FaUser className="text-gray-700 text-4xl mb-3" />
            <h2 className="text-xl font-medium text-gray-800">{user.username}</h2>
            <p className="text-gray-500 flex items-center gap-2 mt-2"><FaEnvelope /> {user.email}</p>
            <p className="text-gray-500 mt-1">Rol: {user.role}</p>
          </div>

          {/* Viajes Completados */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-md transition">
            <FaPlane className="text-indigo-600 text-4xl mb-3" />
            <h2 className="text-xl font-medium text-gray-800">Viajes Completados</h2>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.trips}</p>
          </div>

          {/* Puntos de Fidelidad */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-md transition">
            <FaStar className="text-yellow-500 text-4xl mb-3" />
            <h2 className="text-xl font-medium text-gray-800">Puntos de Fidelidad</h2>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.points}</p>
          </div>
        </div>

        {/* Formulario Actualización */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8 hover:shadow-md transition">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Actualizar Perfil</h2>

          {message.text && (
            <div className={`mb-4 px-4 py-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
              <input
                type="text"
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition"
                placeholder="Tu nombre de usuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-500 transition disabled:opacity-50 flex justify-center items-center"
              >
                {loading ? 'Actualizando...' : 'Actualizar Perfil'}
              </button>
              <button type="button" className="flex-1 py-2 px-4 bg-gray-100 text-gray-800 font-semibold rounded-lg shadow hover:bg-gray-200 transition flex justify-center items-center">
                <FaKey className="mr-2" /> Cambiar Contraseña
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Sidebar Derecha */}
      <aside className="w-72 bg-white border-l border-gray-200 shadow-sm p-6 hidden xl:flex flex-col gap-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Próximos Viajes</h3>
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
            <p className="text-gray-700 font-medium">Vuelo a París</p>
            <p className="text-gray-500 text-sm">15 Dic 2025 - 22 Dic 2025</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
            <p className="text-gray-700 font-medium">Vuelo a Tokio</p>
            <p className="text-gray-500 text-sm">02 Ene 2026 - 10 Ene 2026</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Notificaciones</h3>
          <p className="text-gray-500 text-sm flex items-center gap-2"><FaBell /> No hay alertas nuevas</p>
        </div>
      </aside>

    </div>
  );
};

export default DashboardProfile;
