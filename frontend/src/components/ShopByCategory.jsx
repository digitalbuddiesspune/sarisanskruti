import React from 'react';
import { useNavigate } from 'react-router-dom';

const ShopByCategory = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'COLLECTION',
      path: '/category/Collection',
      image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156521/faaed640-0829-4861-80a2-6c7dc3e73bf3.png',
    },
    {
      name: 'MEN',
      path: '/category/Men',
      image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764154213/0bf2018a-4136-4d0d-99bc-2c5755a65d2c.png',
    },
    {
      name: 'WOMEN',
      path: '/category/Women',
      image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764155957/b0484146-0b8f-4f41-b27f-8c1ee41a7179.png',
    },
    {
      name: 'BOYS',
      path: '/category/Boys',
      image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156074/0b700582-a664-43e6-b478-39ced3c3c6db.png',
    },
    {
      name: 'GIRLS',
      path: '/category/Girls',
      image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156159/1157977a-db19-4e4e-988c-51c7f8d501ae.png',
    },
    {
      name: 'SISHU',
      path: '/category/Sishu',
      image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156281/6b450cec-316c-4897-9db4-c3621dfa35fa.png',
    },
    {
      name: 'REGIONAL',
      path: '/category/regional',
      image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762332592/683cb274-bd83-464f-a5b2-db774c250fde.png',
    },
    {
      name: 'BANARASI',
      path: '/category/banarasi',
      image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762500248/d4f99ab4-dee8-4e28-9eaf-c973699ba6f5.png',
    },
    {
      name: 'DESIGNER SAREES',
      path: '/category/designer-sarees',
      image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762110448/unnamed_jh6wqf.jpg',
    },
    {
      name: 'PRINTED SAREES',
      path: '/category/printed-sarees',
      image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762754174/296c91cc-658f-447c-ba8c-079e1bc530b5.png',
    },
  ];

  const handleCategoryClick = (path) => {
    navigate(path);
  };

  return (
    <section className="py-16 md:py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-3" style={{ fontFamily: 'serif' }}>
            Shop by Category
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-12 bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            <div className="h-px w-12 bg-gray-300"></div>
          </div>
          <p className="text-lg text-gray-600 font-light">
            Explore Our Collections
          </p>
        </div>

        {/* Enhanced Category Cards - Horizontal Scrollable */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-4 md:gap-6 lg:gap-8 justify-center items-start min-w-max md:min-w-0">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex flex-col items-center cursor-pointer group shrink-0"
                onClick={() => handleCategoryClick(category.path)}
              >
                {/* Enhanced Circular Image Container */}
                <div className="relative mb-4">
                  {/* Shadow Effect */}
                  <div className="absolute inset-0 rounded-full bg-gray-200 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10"></div>
                  
                  {/* Circular Image with Border */}
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-3 border-white shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 ring-2 ring-gray-100 group-hover:ring-gray-200">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/128x128?text=Category';
                      }}
                    />
                  </div>
                </div>
                
                {/* Enhanced Category Label */}
                <div className="text-center">
                  <span className="text-sm md:text-base font-semibold text-gray-800 text-center whitespace-nowrap group-hover:text-gray-900 transition-colors block">
                    {category.name}
                  </span>
                  <div className="mt-1.5 h-0.5 w-0 bg-gray-400 mx-auto group-hover:w-full transition-all duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;

