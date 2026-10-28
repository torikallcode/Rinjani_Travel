import React, { useState, useEffect } from 'react'
import { NavbarDsy } from '../ui/NavbarDsy'
import { HomePage } from '../sections/Trekking/HomePage'
import { useParams } from 'react-router-dom';
import { DataTour } from '@/data/DataTour';
import { MainContent } from '../sections/Trekking/MainContent';
import NotFound from '../elements/NotFound';
import { FooterDsy } from '../ui/FooterDsy';

export const TourLayout = () => {

  const { id } = useParams();
  const [tour, setTour] = useState({});

  useEffect(() => {
    const tourData = DataTour.find(item => item.id.toString() === id);
    //mengembalikan elemen pertama dalam array kemudian  memeriksa apakah id yang sudah diubah menjadi string dari item tersebut sama dengan id dari parameter DataTracking
    setTour(tourData || {});
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])


  if (tour.id === undefined) return <NotFound />

  return (
    <div>
      <NavbarDsy className={`z-50 fixed`} />
      {tour ? (
        <section className='w-full min-h-screen'>
          <div className='w-full h-[35rem] mx-auto'>
            <HomePage
              Image={tour.image}
              title={tour.title}
              className={`px-5 md:px-11 mx-auto gradient-mask-b-70`}
            ></HomePage>
          </div>
          <MainContent
            className={`w-full px-5 md:px-11 xl:px-20 pt-7 xl:max-w-[100rem] mx-auto pb-7`}
            title={tour.title}
            descLengkap={tour.descLengkap}
            daySatu={tour.daySatu}
            dayDua={tour.dayDua}
            dayTiga={tour.dayTiga}
            dayEmpat={tour.dayEmpat}
            daySatuLengkap={tour.daySatuLengkap}
            dayDuaLengkap={tour.dayDuaLengkap}
            dayTigaLengkap={tour.dayTigaLengkap}
            dayEmpatLengkap={tour.dayEmpatLengkap}
          >
            {tour.include ? (
              <>
                <h1 className='text-base font-medium text-putih-0 font-secondary'>Price Include</h1>
                <ul className='px-5 list-disc'>
                  {tour.include.map((item, index) => (
                    <li key={index} className='text-sm text-gray-300 font-secondary'>{item}</li>
                  ))}
                </ul>
              </>
            )
              : null}
            {tour.exclude ? (
              <>
                <h1 className='text-base font-medium text-putih-0 font-secondary'>Price Exclude</h1>
                <ul className='px-5 mb-5 list-disc'>
                  {tour.exclude.map((item, index) => (
                    <li key={index} className='text-sm text-gray-300 font-secondary'>{item}</li>
                  ))}
                </ul>
              </>
            )
              : null}
          </MainContent>
        </section>
      ) : (
        <p className='text-white'>loading...</p>
      )
      }
      <FooterDsy></FooterDsy>
    </div>
  )
}
