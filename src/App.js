import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/UI/Header';
import Footer from './components/UI/Footer';
import Hero from './components/Hero';
import Apartments from './components/Apartments';
import Amenities from './components/Amenities';
import Booking from './components/Booking';
import Contact from './components/Contact';
import ApartmentsMain from './components/ApartmentsMain';
import AdminReservations from './components/admin/AdminReservations';
import AdminContact from './components/admin/AdminContact';
import AdminUnavailableDates from './components/admin/AdminUnavailableDates';
import AdminApartments from './components/admin/AdminApartments';
import AdminAmenities from './components/admin/AdminAmenities';
import AdminImages from './components/admin/AdminImages';
import ProtectedRoute from './components/ProtectedRoute'; // For protected routes
import Login from './components/Login'; // Import the Login component

function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Apartments />
      <Amenities />
      <Booking />
      <Contact />
      <Footer />
    </>
  );
}

function AdminPage() {
  return (
    <>
      {/* Removed direct Header and Footer here */}
      <AdminReservations />
      <AdminContact />
      <AdminUnavailableDates />
      <AdminApartments />
      <AdminAmenities />
      <AdminImages />
      {/* Footer is already included inside the Layout */}
    </>
  );
}

// Layout component for shared parts (Header & Footer)
function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Home page route */}
        <Route path="/" element={<HomePage />} />

        {/* Apartments main route */}
        <Route path="/apartments" element={
          <Layout>
            <ApartmentsMain />
          </Layout>
        } />

        {/* Admin page route with protection */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Layout>
              <AdminPage />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Login route */}
        <Route path="/login" element={<Login />} /> {/* Add this route */}
      </Routes>
    </Router>
  );
}

export default App;
