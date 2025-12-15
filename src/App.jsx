import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ServicesPage from './pages/main/ServicesPage'
import HomePage from './pages/main/HomePage'
import Loging from './pages/main/Login'
import FlightsPage from './pages/vehicles/FlightsPage'
import LodgingPage from './pages/lodging/LodgingPage'
import VehiclesPage from './pages/vehicles/VehiclesPage'
import ExperiencesPage from './pages/user/ExperiencesPage'
import ReservationsPage from './pages/user/ReservationsPage'
import CheckoutPage from './pages/payment/CheckoutPage'
import ProfilePage from './pages/user/ProfilePage'
import SettingsPage from './pages/user/SettingsPage'
import { AuthProvider } from './contexts/AuthContext.jsx'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-white text-slate-900">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/flights" element={<FlightsPage />} />
            <Route path="/lodging" element={<LodgingPage />} />
            <Route path="/login" element={<Loging />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/experiences" element={<ExperiencesPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
