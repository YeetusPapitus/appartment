// Hero.js

import heroImage from '../img/apartment-hero.jpg';

export default function Hero() {
    return (
    <section className="relative h-[80vh] w-full overflow-hidden" id='home'>
        <img
        src={heroImage}
        alt="Apartment Kitchen and Living Room"
        className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl mb-8">Experience Comfort</h1>
            <h1 className="text-4xl md:text-5xl font-semibold mb-8 text-royal">AppArtment</h1>
            <span className="text-lg md:text-xl max-w-xl mb-8">Luxurious rooms with all the amenities you need for a perfect stay.</span>
            <a href="/apartments" className="bg-olive text-white px-6 py-3 rounded-xl text-md hover:bg-olive-dark transition">
                View Available Rooms
            </a>
        </div>
    </section>
  );
}
