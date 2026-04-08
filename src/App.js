import Itinerary from './pages/Itinerary';
import Purchases from './pages/Purchases';
import FindMyOrder from './pages/FindMyOrder';
import SavedItineraries from './pages/SavedItineraries';
import TermsAndConditions from './pages/TermsAndConditions';
import React from 'react';
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

function App() {
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;