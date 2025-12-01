import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

import HomePage from './pages/main/HomePage'
import Loging from './pages/main/Login'
import FlightsPage from './pages/vehicles/FlightsPage'
import LodgingPage from './pages/lodging/LodgingPage'
import VehiclesPage from './pages/vehicles/VehiclesPage'
import ExperiencesPage from './pages/user/ExperiencesPage'
import ReservationsPage from './pages/user/ReservationsPage'
import CheckoutPage from './pages/payment/CheckoutPage'

function App() {
return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
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
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
