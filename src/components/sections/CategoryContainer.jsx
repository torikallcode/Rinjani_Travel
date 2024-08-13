import React, { useState } from 'react';
import { DataTracking } from '@/data/DataTracking';
import { CardTracking } from '../fragments/Cards/CardTracking';
import { Link } from 'react-router-dom';
import { CardMostPopular } from '../fragments/Cards/CardMostPopular';
import { DataTour } from '@/data/DataTour';

const Category = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tour');
  const limitedDataTour = DataTour.slice(0, 3)
  const limitedDataTrekking = DataTracking.slice(0, 8)

  const renderContent = () => {
    if (selectedCategory === 'Tour') {
      return (
        <div className='w-full flex flex-col'>
          <div className="carousel flex gap-x-7 mb-5 lg:mx-auto">
            {limitedDataTour.map((item, index) => (
              <div key={index} className="carousel-item">
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
        </div>
      );
    } else if (selectedCategory === 'Trekking') {
      return (
        <section className='w-full flex flex-col '>
          {/* <h1 className='text-putih-0 font-tomorrow text-4xl xl:text-4xl mb-12 xl:mb-12'>Rinjani Trekking <br /> package</h1> */}
          <div className="carousel flex lg:grid lg:grid-cols-4 lg:gap-y-7 gap-x-7 mb-5 lg:mx-auto">
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
          {/* <Link to={"/"} className='text-putih-0 font-secondary text-base text-start mb-7'>
            More package →
          </Link> */}
        </section >
      );
    }
  };

  return (
    <div className="category-container mx-auto text-center w-full flex flex-col">
      <div className="mb-12 xl:mb-12">
        <h1 className="text-putih-0 font-tomorrow text-3xl xl:text-3xl  text-center">Find Out The Best <br /> Travel Choice in Asia</h1>
        <p className="text-gray-500 text-center text-sm md:text-base">Lorem, ipsum dolor sit amet consectetur adipisicing elit.  Voluptatem, <br /> quia corrupti  sapiente perspiciatis quibusdam quod sequi facere cumque sint aspernatur!</p>
      </div>
      <div className="button-group mb-8 flex justify-center gap-x-3 items-center mx-auto bg-transparen border-2 border-gray-500 rounded-full p-2">
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
