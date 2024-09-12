import React, { useState } from 'react';
import { DataTracking } from '@/data/DataTracking';
import { CardTracking } from '../fragments/Cards/CardTracking';
import { DataTour } from '@/data/DataTour';
import { Link } from 'react-router-dom';

const Category = ({ classname }) => {
  const [selectedCategory, setSelectedCategory] = useState('Tour');
  const limitedDataTour = DataTour.slice(0, 3)
  const limitedDataTrekking = DataTracking.slice(0, 8)

  const renderContent = () => {
    if (selectedCategory === 'Tour') {
      return (
        <div className='flex flex-col w-full'>
          <div className="flex mb-5 carousel gap-x-7 lg:mx-auto">
            {limitedDataTour.map((item, index) => (
              <div
                key={index} className="carousel-item">
                <CardTracking
                  style={{ backgroundImage: "url('img/Rinjani.jpg')" }}
                  id={item.id}
                  image={item.image}
                  title={item.title}
                  days={item.days}
                  desc={item.desc}
                  rating={item.rating}
                  price={item.price}
                />
              </div>
            ))}
          </div>
          <Link
            to={"/rinjaniTour"}
            onClick={() => window.scrollTo(0, 0)}
            className='text-base italic text-putih-0 font-tomorrow text-start lg:text-center mb-7 lg:mx-auto lg:mt-5'>
            More Tour →
          </Link>
        </div>
      );
    } else if (selectedCategory === 'Trekking') {
      return (
        <section className='flex flex-col w-full '>
          <div className="flex mb-5 carousel xl:grid xl:grid-cols-4 xl:gap-y-7 gap-x-7 xl:mx-auto">
            {limitedDataTrekking.map((item, index) => (
              <div key={index} className="carousel-item">
                <CardTracking
                  id={item.id}
                  image={item.image}
                  title={item.title}
                  days={item.days}
                  desc={item.desc}
                  rating={item.rating}
                  price={item.price}
                />
              </div>
            ))}
          </div>
          <Link
            to={"/trekkingSummit"}
            onClick={() => window.scrollTo(0, 0)}
            className='text-base text-putih-0 font-tomorrow text-start mb-7 lg:text-center lg:mx-auto lg:mt-5'>
            More Trekking →
          </Link>
        </section >
      );
    }
  };

  return (
    <div className={`category-container mx-auto text-center w-full flex flex-col ${classname}`}>
      <div className="mb-12 xl:mb-12">
        <h1 className="text-3xl text-center text-putih-0 font-tomorrow xl:text-3xl">Find Out The Best <br /> Travel Choice in Asia</h1>
        <p className="max-w-2xl mx-auto text-sm text-center text-gray-500 md:text-base">Explore Asia's vibrant cities, serene landscapes, and rich cultural heritage for unforgettable adventures. The perfect destination for every type of traveler.</p>
      </div>
      <div className="flex items-center justify-center p-2 mx-auto mb-10 border-2 border-gray-500 rounded-full button-group gap-x-3 bg-transparen">
        <button
          onClick={() => setSelectedCategory('Tour')}
          className={`category-button py-2 px-4 rounded-full font-secondary transition-all ease-out ${selectedCategory === 'Tour' ? 'bg-putih-0 text-hitam-0' : 'bg-transparent text-putih-0'
            }`}
        >
          Tour
        </button>
        <button
          onClick={() => setSelectedCategory('Trekking')}
          className={`category-button py-2 px-4 rounded-full font-secondary transition-all ease-out ${selectedCategory === 'Trekking' ? 'bg-putih-0 text-hitam-0' : 'bg-transparent text-putih-0'
            }`}
        >
          Trekking
        </button>
      </div>
      <div className="category-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Category;
