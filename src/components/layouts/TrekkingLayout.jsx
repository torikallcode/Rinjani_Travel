import React, { useState, useEffect } from 'react'
import { NavbarDsy } from '../ui/NavbarDsy'
import { HomePage } from '../sections/Trekking/HomePage'
import { useParams } from 'react-router-dom';
import { DataTracking } from '@/data/DataTracking'; // Ensure this is the correct path
import { MainContent } from '../sections/Trekking/MainContent';
import { Footer } from '../sections/Footer';
import { CarouselTrekking } from '../ui/CarouselTrekking';
import NotFound from '../elements/NotFound';
import { FooterDsy } from '../ui/FooterDsy';

export const TrekkingLayout = () => {

  const { id } = useParams();
  const [trekking, setTrekking] = useState({});

  useEffect(() => {
    const trekkingData = DataTracking.find(item => item.id.toString() === id);
    //mengembalikan elemen pertama dalam array kemudian  memeriksa apakah id yang sudah diubah menjadi string dari item tersebut sama dengan id dari parameter DataTracking
    setTrekking(trekkingData || {});
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])


  if (trekking.id === undefined) return <NotFound />

  return (
    <div>
      <NavbarDsy className={`z-50 fixed`} />
      {trekking ? (
        <section className='w-full min-h-screen'>
          <div className='w-full h-[35rem] mx-auto'>
            <HomePage
              Image={trekking.image}
              title={trekking.title}
              className={`px-5 md:px-11 mx-auto gradient-mask-b-70`}
            ></HomePage>
          </div>
          <MainContent
            className={`w-full px-5 md:px-11 xl:px-20 pt-7 xl:max-w-[100rem] mx-auto pb-7`}
            title={trekking.title}
            descLengkap={trekking.descLengkap}
            daySatu={trekking.daySatu}
            dayDua={trekking.dayDua}
            dayTiga={trekking.dayTiga}
            dayEmpat={trekking.dayEmpat}
            daySatuLengkap={trekking.daySatuLengkap}
            dayDuaLengkap={trekking.dayDuaLengkap}
            dayTigaLengkap={trekking.dayTigaLengkap}
            dayEmpatLengkap={trekking.dayEmpatLengkap}
          >
            {trekking.include ? (
              <>
                <h1 className='text-putih-0 font-secondary text-base font-medium'>Price Include</h1>
                <ul className='list-disc px-5'>
                  {trekking.include.map((item, index) => (
                    <li key={index} className='text-gray-300 font-secondary text-sm'>{item}</li>
                  ))}
                </ul>
              </>
            )
              : null}
            {trekking.exclude ? (
              <>
                <h1 className='text-putih-0 font-secondary text-base font-medium'>Price Exclude</h1>
                <ul className='list-disc px-5 mb-5'>
                  {trekking.exclude.map((item, index) => (
                    <li key={index} className='text-gray-300 font-secondary text-sm'>{item}</li>
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
