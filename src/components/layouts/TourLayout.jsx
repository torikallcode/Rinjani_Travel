import React from 'react'
import { useState } from 'react'
import { NavbarDsy } from '../ui/NavbarDsy'
import { FooterDsy } from '../ui/FooterDsy'
import { DataTour } from '@/data/DataTour'
import { CardTracking } from '../fragments/Cards/CardTracking'

export const TourLayout = () => {

  const [dataTours, setDataTours] = useState(DataTour)

  return (
    <>
      <NavbarDsy className={'fixed z-50'}></NavbarDsy>
      <section className="bg-fixed relative h-[70dvh] bg-center bg-cover bg-no-repeat gradient-mask-b-70" style={{ backgroundImage: "url('img/aboutme1.jpg')" }}>
        <span className='absolute top-0 left-0 z-10 w-full h-full opacity-50 bg-hitam-0'></span>
        <div className='flex flex-col items-center justify-center w-full h-full px-5 md:px-11 xl:px-20 xl:max-w-[87rem] mx-auto z-20 relative'>
          <h1 className="text-3xl font-semibold text-center text-putih-0 font-tomorrow xl:text-3xl">Rinjani Tour</h1>
          <p className="max-w-3xl text-sm text-center text-gray-200 font-secondary xl:text-base">Nikmati perjalanan eksklusif ke Gunung Rinjani, dirancang untuk memberikan pengalaman mendaki yang memadukan petualangan dan keindahan alam Lombok.
          </p>
        </div>
      </section>
      <div className="bg-hitam-0 py-32 lg:py-16 pb-32 w-full px-8 md:px-11 xl:px-20 xl:max-w-[90rem] mx-auto">
        <section className='flex flex-col items-center justify-center w-full'>
          <div className="grid w-full grid-cols-1 mx-auto mb-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-7 lg:gap-y-7 gap-x-7">
            {dataTours.map((item, index) => (
              <div key={index}>
                <CardTracking
                  id={item.id}
                  image={item.image}
                  title={item.title}
                  days={item.days}
                  desc={item.desc}
                  rating={item.rating}
                  price={item.price}
                  aspect='aspect-[7/8]'
                  classname={'w-full'}
                />
              </div>
            ))}
          </div>
        </section >
      </div>
      <FooterDsy></FooterDsy>
    </>
  )
}