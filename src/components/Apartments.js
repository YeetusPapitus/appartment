import { useState, useEffect } from 'react';
import { FaUserFriends, FaBed } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Apartments() {
  const [apartments, setApartments] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const apartmentsResponse = await fetch('http://localhost/appartment/api/apartments.php');
        const apartmentsData = await apartmentsResponse.json();
        if (apartmentsData.success) {
          setApartments(apartmentsData.apartments);
        } else {
          setError('Failed to load apartments');
        }

        const imagesResponse = await fetch('http://localhost/appartment/api/images.php');
        const imagesData = await imagesResponse.json();
        if (imagesData.success) {
          setImages(imagesData.images);
        } else {
          setError('Failed to load images');
        }
      } catch (e) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 mx-auto text-center bg-sand" id="apartments">
        <h2 className="text-3xl md:text-4xl text-charcoal mb-4">Our Apartments</h2>
        <p className="text-lg md:text-xl text-charcoal">Loading apartments…</p>
      </section>
    );
  }

  const getImageForApartment = (roomId) => {
    const image = images.find((img) => img.RoomID === roomId && img.IsPrimary === 1); // Get primary image
    return image ? image.ImageURL : ''; // Return the Image URL or empty string if no image
  };

  return (
    <section className="py-16 px-4 mx-auto text-center bg-sand" id="apartments">
      <h2 className="text-3xl md:text-4xl text-charcoal mb-4">Our Apartments</h2>
      <p className="text-lg md:text-xl text-charcoal mb-12">
        Choose from our selection of beautiful, fully-furnished apartments.
      </p>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="flex flex-wrap justify-center gap-6 mb-12">
        {apartments.map((apt) => {
          const imageURL = getImageForApartment(apt.IDRoom); // Get image URL for this apartment

          return (
            <div
              key={apt.IDRoom}
              className="w-[375px] bg-stone/50 hover:bg-stone/75 shadow-md rounded-2xl overflow-hidden text-left transform transition-all duration-500 xl:hover:scale-105"
            >
              {imageURL ? (
                <img
                  src={imageURL}
                  alt={apt.Title}
                  className="h-60 w-full object-cover"
                />
              ) : (
                <div className="h-60 w-full flex items-center justify-center bg-gray-100 text-sm text-red-600">
                  No image available
                </div>
              )}

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-medium">{apt.Title}</h3>
                <div className="flex items-center text-charcoal gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <FaUserFriends className="text-charcoal" />
                    <span>{apt.Guests} Guests</span>
                  </div>
                  <span className="text-charcoal">•</span>
                  <div className="flex items-center gap-2">
                    <FaBed className="text-charcoal" />
                    <span>{apt.BedQuantity} {apt.BedType}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <span className="text-2xl font-medium text-charcoal">{apt.Price}€</span>
                    <span className="text-sm text-charcoal">/night</span>
                  </div>
                  <Link
                    to={`/apartments#room-${apt.IDRoom}`}
                    className="text-sm bg-olive text-white px-4 py-2 rounded-lg hover:bg-olive-dark transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
