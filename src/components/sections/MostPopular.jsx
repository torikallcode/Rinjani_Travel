import React from 'react';
import { CardMostPopular } from '../fragments/Cards/CardMostPopular';
import 'aos/dist/aos.css';

export const MostPopular = ({ classname }) => {
  const popularItems = [
    {
      backgroundImage: "url('img/Rinjani.jpg')",
      className: 'lg:col-span-2',
      lokasi: 'Sembalun, Lombok Timur',
      nama: 'Gunung Rinjani',
    },
    {
      backgroundImage: "url('img/pinkbeach.jpg')",
      lokasi: 'Jerowaru, Lombok Timur',
      nama: 'Pantai Pink',
    },
    {
      backgroundImage: "url('img/mandalika.webp')",
      lokasi: 'Kuta, Lombok Tengah',
      nama: 'Circuit Mandalika',
    },
    {
      backgroundImage: "url('img/turtle.webp')",
      className: 'lg:col-span-2',
      lokasi: 'Pemenang, Lombok Utara',
      nama: 'Gili Trawangan',
    },
  ];

  return (
    <div className={`w-full flex flex-col ${classname}`}>
      <h1 className='mb-12 text-4xl text-white font-tomorrow xl:text-5xl xl:mb-12'>Most Popular</h1>
      <div className='grid grid-cols-1 gap-5 lg:grid-cols-3'>
        {popularItems.map((item, index) => (
          <CardMostPopular
            key={index}
            style={{ backgroundImage: item.backgroundImage }}
            className={item.className}
            lokasi={item.lokasi}
            nama={item.nama}
          />
        ))}
      </div>
    </div>
  );
};
