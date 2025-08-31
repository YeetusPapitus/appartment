// Booking.js

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../img/apartment-book.jpg';

export default function Booking() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [checkIn, setCheckIn]   = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests]     = useState('1');
  const [roomId, setRoomId]     = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetch('/appartment/api/apartments.php')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setApartments(data.apartments);
          if (data.apartments?.length) setRoomId(String(data.apartments[0].IDRoom)); // default select
        } else {
          setError('Failed to load apartments');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load apartments');
        setLoading(false);
      });
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut || !guests || !roomId) return;

    const params = new URLSearchParams({
      room: roomId,
      ci: checkIn,
      co: checkOut,
      g: guests
    }).toString();

    navigate(`/apartments?${params}#room-${roomId}`);
  };

  return (
    <section className="w-full bg-sand py-12 px-4" id="booking">
      <div className="max-w-6xl mx-auto bg-stone/50 hover:bg-stone/75 rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row transform transition-all duration-500 xl:hover:scale-105">
        <form onSubmit={submit} className="w-full md:w-1/2 p-12 space-y-6">
          <h2 className="text-3xl text-charcoal">Book Your Stay</h2>
          <p className="text-charcoal text-xl">
            Check availability and reserve your apartment in just a few clicks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal">Check In</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-1 w-full border-2 border-royal rounded-lg px-3 py-2 focus:outline-none text-charcoal/75 bg-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal">Check Out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-1 w-full border-2 border-royal rounded-lg px-3 py-2 focus:outline-none text-charcoal/75 bg-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal">Guests</label>
              <input
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                placeholder="1"
                className="mt-1 w-full border-2 border-royal rounded-lg px-3 py-2 focus:outline-none text-charcoal/75 bg-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal">Room Type</label>
              {loading ? (
                <p className="mt-2 text-charcoal/70">Loading rooms...</p>
              ) : error ? (
                <p className="mt-2 text-red-600">{error}</p>
              ) : (
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="mt-1 w-full border-2 border-royal rounded-lg px-3 py-2 focus:outline-none text-charcoal/75 bg-transparent"
                  required
                >
                  {apartments.map((apt) => (
                    <option key={apt.IDRoom} value={apt.IDRoom}>
                      {apt.Title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button type="submit" className="bg-olive text-white text-lg py-3 px-6 rounded-lg hover:bg-olive-dark transition">
              Check Availability
            </button>
          </div>
        </form>

        <div className="w-full md:w-1/2 h-64 md:h-auto hidden md:flex">
          <img
            src={heroImage}
            alt="Apartment"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
