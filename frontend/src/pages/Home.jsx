import React from 'react';
import MobileBottomNav from '../components/MobileBottomNav';
import HeroSlider from '../components/HeroSlider';
import ShopByCategory from '../components/ShopByCategory';
import BestSellers from '../components/BestSellers';
import TrendingNow from '../components/TrendingNow';

const Home = () => {
  return (
    <div className="min-h-screen pt-0 pb-16 md:pb-0">
      {/* Hero Slider */}
      <HeroSlider
        slides={[
          {
            desktop: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766832556/Red_and_Green_Simple_Elegant_Sarees_Republic_Day_Sale_Billboard_2048_x_594_px_glqpgv.png',
            alt: 'sarisanskruti - Premium Kurtas & Kurtis',
          },
          {
            desktop: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1763451863/Elegance_Comfort_Style_2048_x_594_px_wqggd6.svg',
            alt: 'Festive Offers - sarisanskruti',
          },
        ]}
        mobileSrc="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766834409/Brown_and_Beige_Delicate_Traditional_Minimalist_Fashion_Instagram_Story_lgpyvi.svg"
      />

      {/* Shop by Category */}
      <ShopByCategory />

      {/* Best Sellers */}
      <BestSellers />

      {/* Special Offers */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 mb-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-2" style={{ fontFamily: 'serif' }}>
              Special Offers
            </h2>
            <p className="text-lg text-gray-600">
              Limited Time Deals
            </p>
          </div>
        </div>

        {/* Two Banners Side by Side - Full Width */}
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-[1920px] mx-auto">
            <div className="relative overflow-hidden rounded-lg group cursor-pointer">
              <img
                src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766833070/Brown_and_Gold_Traditional_Pongal_Sale_Facebook_Ad_p32fld.png"
                alt="Pongal Sale"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg group cursor-pointer">
              <img
                src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766833070/Red_and_Gold_Elegant_Navratri_Special_Sale_Facebook_Ad_aotjzn.png"
                alt="Navratri Special Sale"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <TrendingNow />

      {/* Why Choose Us */}
<section className="py-20 px-4 bg-white">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-5xl font-light tracking-wide text-center mb-4 text-gray-800">
      WHY CHOOSE sarisanskruti
    </h2>
    <p className="text-xl text-gray-600 text-center mb-16 font-light">
      Discover our exclusive collection of handpicked kurtas and kurtis
    </p>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {[
        { icon: '✨', title: 'Premium Quality', desc: 'Finest fabrics and craftsmanship for all-day comfort' },
        { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹999 across India' },
        { icon: '🔄', title: 'Easy Returns', desc: '7-day hassle-free return policy' },
        { icon: '💎', title: '100% Authentic', desc: 'Original designs in kurtas and kurtis' },
      ].map((feature, index) => (
        <div
          key={index}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-amber-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative text-center p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-pink-300 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
            <h3 className="text-2xl font-light text-gray-800 mb-3 tracking-wide">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed font-light">{feature.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default Home;
