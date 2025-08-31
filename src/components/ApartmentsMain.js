// ApartmentsMain.js

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ReservationModal from '../components/ReservationModal';
import AvailabilityModal from '../components/AvailabilityModal';
import { FaUserFriends, FaBed } from 'react-icons/fa';

export default function ApartmentsMain() {
  const [apartments, setApartments] = useState([]);
  const [imagesByRoom, setImagesByRoom] = useState({});
  const [amenitiesByRoom, setAmenitiesByRoom] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [availRoom, setAvailRoom] = useState(null);
  const [availOpen, setAvailOpen] = useState(false);

  const location = useLocation();
  const [prefill, setPrefill] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [roomsRes, imgsRes, amMapRes] = await Promise.all([
          fetch('/appartment/api/apartments.php'),
          fetch('/appartment/api/images.php'),
          fetch('/appartment/api/room_amenities.php'),
        ]);
        const roomsJson = await roomsRes.json();
        const imgsJson  = await imgsRes.json();
        const amMapJson = await amMapRes.json();
        if (!mounted) return;

        if (roomsJson.success) setApartments(roomsJson.apartments || []);
        else setError(roomsJson.error || 'Failed to load apartments');

        if (imgsJson.success) {
          const grouped = {};
          (imgsJson.images || []).forEach((img) => {
            const rid = img.RoomID !== null ? Number(img.RoomID) : 0;
            if (!grouped[rid]) grouped[rid] = [];
            grouped[rid].push(img);
          });
          Object.keys(grouped).forEach((k) => {
            grouped[k].sort((a, b) => {
              const pa = Number(a.IsPrimary) === 1 ? 1 : 0;
              const pb = Number(b.IsPrimary) === 1 ? 1 : 0;
              if (pb !== pa) return pb - pa;
              const soA = Number(a.SortOrder || 0);
              const soB = Number(b.SortOrder || 0);
              if (soB !== soA) return soB - soA;
              return Number(b.IDImage || 0) - Number(a.IDImage || 0);
            });
          });
          setImagesByRoom(grouped);
        }

        if (amMapJson.success) {
          const map = {};
          (amMapJson.mappings || []).forEach((m) => {
            const rid = Number(m.RoomID);
            if (!map[rid]) map[rid] = new Set();
            if (m.AmenityTitle) map[rid].add(m.AmenityTitle);
          });
          const normalized = {};
          Object.keys(map).forEach((rid) => {
            normalized[Number(rid)] = Array.from(map[rid]).sort((a, b) =>
              a.localeCompare(b, undefined, { sensitivity: 'base' })
            );
          });
          setAmenitiesByRoom(normalized);
        }
      } catch (e) {
        if (!mounted) return;
        setError('Failed to load data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (loading) return;
    const hash = location.hash?.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, [loading, location.hash, apartments.length]);

  useEffect(() => {
    if (!apartments.length) return;
    const params = new URLSearchParams(location.search);
    const roomParam = Number(params.get('room'));
    const ci = params.get('ci');
    const co = params.get('co');
    const g  = params.get('g');

    if (!roomParam || !ci || !co || !g) return;

    const room = apartments.find(a => Number(a.IDRoom ?? a.IDApartment) === roomParam);
    if (!room) return;

    setPrefill({ ci, co, g: Number(g) });
    setSelectedRoom(room);
    setModalOpen(true);
  }, [apartments, location.search]);

  const openReservation = (room) => { setSelectedRoom(room); setModalOpen(true); };
  const closeReservation = () => { setModalOpen(false); setSelectedRoom(null); };

  const openAvailability = (room) => { setAvailRoom(room); setAvailOpen(true); };
  const closeAvailability = () => { setAvailOpen(false); setAvailRoom(null); };

  const handleSuccess = () => {};

  if (loading) {
    return (
      <section className="py-16 px-4 bg-sand">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl text-charcoal mb-6">Our Apartments</h2>
          <p className="text-charcoal">Loading apartments…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-sand" id="apartment-detail">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl text-charcoal mb-24 text-center md:text-left">Our Apartments</h2>
      </div>

      {error && <p className="text-red-600 mb-6 text-center">{error}</p>}

      {apartments.length === 0 ? (
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-charcoal">No apartments found.</p>
        </div>
      ) : (
        apartments.map((apt) => {
          const roomId = Number(apt.IDRoom ?? apt.IDApartment ?? 0);
          const imgs = imagesByRoom[roomId] || [];
          const ams  = amenitiesByRoom[roomId] || [];

          return (
            <div key={roomId} id={`room-${roomId}`} className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 mb-12 scroll-mt-28">
              <div>
                <h2 className="text-2xl md:text-4xl text-charcoal mb-12 text-center md:text-left">{apt.Title}</h2>

                <div className="text-charcoal space-y-4 mb-8">
                  <p>{apt.Description}</p>
                </div>

                {ams.length > 0 ? (
                  <ul className="list-disc list-inside grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-12">
                    {ams.map((t, idx) => <li key={`${roomId}-am-${idx}`}>{t}</li>)}
                  </ul>
                ) : (
                  <div className="mb-12 text-charcoal/70">No amenities listed yet.</div>
                )}

                <div className="flex space-x-2 mb-8">
                  <div className="flex items-center gap-2">
                    <FaUserFriends className="text-charcoal" />
                    <span>{apt.Guests ? `${apt.Guests} ${Number(apt.Guests) === 1 ? 'Guest' : 'Guests'}` : '– Guests'}</span>
                  </div>
                  <span className="text-charcoal">•</span>
                  <div className="flex items-center gap-2">
                    <FaBed className="text-charcoal" />
                    <span>{apt.BedQuantity && apt.BedType ? `${apt.BedQuantity} ${apt.BedType}${Number(apt.BedQuantity) > 1 ? 's' : ''}` : '– Bed'}</span>
                  </div>
                </div>

                <div className="text-charcoal mb-12">
                  <span className="text-3xl font-medium">{apt.Price}€</span>
                  <span> /night</span>
                </div>

                <div className="flex flex-col sm:flex-row max-w-lg justify-between gap-8 md:gap-0">
                  <button
                    onClick={() => openAvailability(apt)}
                    className="text-olive border-2 border-olive px-6 py-3 rounded-xl text-md font-medium text-center hover:bg-olive-dark hover:text-white transition"
                  >
                    Check Availability
                  </button>
                  <button
                    onClick={() => openReservation(apt)}
                    className="text-white bg-olive px-6 py-3 rounded-xl text-md font-medium text-center hover:bg-olive-dark transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {imgs.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 h-72 flex items-center justify-center bg-gray-100 text-sm text-red-600 rounded">
                    No images available
                  </div>
                ) : (
                  imgs.slice(0, 9).map((img) => (
                    <img key={img.IDImage} src={img.ImageURL} alt={apt.Title} className="w-full h-48 object-cover rounded" loading="lazy" />
                  ))
                )}
              </div>
            </div>
          );
        })
      )}

      <AvailabilityModal room={availRoom} isOpen={availOpen} onClose={closeAvailability} />
      <ReservationModal room={selectedRoom} isOpen={modalOpen} onClose={closeReservation} onSuccess={handleSuccess} initialData={prefill}/>
    </section>
  );
}
