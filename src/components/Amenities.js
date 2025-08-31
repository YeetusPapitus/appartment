// Amenities.js

import { FaWifi, FaTshirt, FaSnowflake, FaUtensils } from 'react-icons/fa';

export default function Amenities() {
  return (
    <section className="bg-sky py-16 px-4 text-center" id='amenities'>
      <h2 className="text-3xl md:text-4xl text-charcoal mb-4">
        Amenities & Services
      </h2>
      <p className="text-lg md:text-xl text-charcoal mb-12">
        Everything you need for a comfortable and enjoyable stay.
      </p>

      <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
        <div className="w-[300px] bg-stone/50 hover:bg-stone/75 rounded-2xl p-6 text-left shadow-md transform transition-all duration-500 xl:hover:scale-105">
          <FaWifi className="text-3xl mb-6 text-royal" />
          <h3 className="text-xl text-charcoal mb-6">High-Speed WiFi</h3>
          <p className="text-charcoal text-sm">
            Stay connected with complimentary high-speed internet access.
          </p>
        </div>

        <div className="w-[300px] bg-stone/50 hover:bg-stone/75 rounded-2xl p-6 text-left shadow-md transform transition-all duration-500 xl:hover:scale-105">
          <FaTshirt className="text-3xl mb-6 text-royal" />
          <h3 className="text-xl text-charcoal mb-6">Laundry Facilities</h3>
          <p className="text-charcoal text-sm">
            In-house laundry service available for all our guests.
          </p>
        </div>

        <div className="w-[300px] bg-stone/50 hover:bg-stone/75 rounded-2xl p-6 text-left shadow-md transform transition-all duration-500 xl:hover:scale-105">
          <FaSnowflake className="text-3xl mb-6 text-royal" />
          <h3 className="text-xl text-charcoal mb-6">Air Conditioning</h3>
          <p className="text-charcoal text-sm">
            Enjoy a cool and comfortable stay with individually controlled air conditioning in every room.
          </p>
        </div>

        <div className="w-[300px] bg-stone/50 hover:bg-stone/75 rounded-2xl p-6 text-left shadow-md transform transition-all duration-500 xl:hover:scale-105">
          <FaUtensils className="text-3xl mb-6 text-royal" />
          <h3 className="text-xl text-charcoal mb-6">Fully Equipped Kitchen</h3>
          <p className="text-charcoal text-sm">
            Feel at home with a full kitchen setup – perfect for relaxed meals at your own pace.
          </p>
        </div>
      </div>
    </section>
  );
}
