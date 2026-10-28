import React, { useState, useEffect } from 'react'
import { NavbarDsy } from '../ui/NavbarDsy'
import { HomePage } from '../sections/Trekking/HomePage'
import { useParams } from 'react-router-dom';
import { fetchPackageBySlug } from '@/services/api';
import { MainContent } from '../sections/Trekking/MainContent';
import NotFound from '../elements/NotFound';
import { FooterDsy } from '../ui/FooterDsy';

export const TrekkingLayout = () => {

  const { id } = useParams();
  const [trekking, setTrekking] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPackage = async () => {
      setLoading(true);
      const data = await fetchPackageBySlug(id);
      setTrekking(data || {});
      setLoading(false);
    };
    loadPackage();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])


  if (loading) return <p className='text-white min-h-screen flex items-center justify-center'>Loading...</p>
  
  if (!trekking || trekking.id === undefined) return <NotFound />

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
                <h1 className='text-base font-medium text-putih-0 font-secondary'>Price Include</h1>
                <ul className='px-5 list-disc'>
                  {trekking.include.map((item, index) => (
                    <li key={index} className='text-sm text-gray-300 font-secondary'>{item}</li>
                  ))}
                </ul>
              </>
            )
              : null}
            {trekking.exclude ? (
              <>
                <h1 className='text-base font-medium text-putih-0 font-secondary'>Price Exclude</h1>
                <ul className='px-5 mb-5 list-disc'>
                  {trekking.exclude.map((item, index) => (
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
