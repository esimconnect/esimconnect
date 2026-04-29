import Itinerary from './pages/Itinerary';
import Purchases from './pages/Purchases';
import FindMyOrder from './pages/FindMyOrder';
import SavedItineraries from './pages/SavedItineraries';
import TermsAndConditions from './pages/TermsAndConditions';
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Plans from './pages/Plans';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import LoginSuccess from './pages/LoginSuccess';
import Footer from './components/Footer';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';
import CorporateRegister from './pages/CorporateRegister';
import CorporateDashboard from './pages/CorporateDashboard';
import CorporateInvite from './pages/CorporateInvite';

function App() {

  // Capture ?ref= reseller code on any page load — stores for 30 days
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('esimconnect_ref', JSON.stringify({
        code:    ref.toUpperCase(),
        expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }));
      // Clean ?ref= from URL without triggering a reload
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/find-order" element={<FindMyOrder />} />
        <Route path="/saved-itineraries" element={<SavedItineraries />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/corporate/register" element={<CorporateRegister />} />
        <Route path="/corporate/dashboard" element={<CorporateDashboard />} />
        <Route path="/corporate/invite/:token" element={<CorporateInvite />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
