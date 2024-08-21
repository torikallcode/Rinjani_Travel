import React from 'react'
import { NavbarDsy } from '../ui/NavbarDsy'
import { FooterDsy } from '../ui/FooterDsy'
import { CardTracking } from '../fragments/Cards/CardTracking'
import { DataTracking } from '@/data/DataTracking'
import { useState } from 'react'

export const TrekkingSummitLayout = () => {
  const [dataTrekking, setDataTrekking] = useState(DataTracking)

  return (
    <>
      <section className="relative h-[50dvh] bg-center bg-cover bg-no-repeat gradient-mask-b-70" style={{ backgroundImage: "url('img/aboutme1.jpg')" }}>
        <span className='w-full h-full bg-hitam-0 absolute top-0 left-0 opacity-50 z-10'></span>
        <NavbarDsy className={'fixed z-50'}></NavbarDsy>
        <div className='flex flex-col items-center justify-center w-full h-full px-5 md:px-11 xl:px-20 xl:max-w-[100rem] mx-auto z-20 relative'>
          <h1 className="text-putih-0 font-tomorrow text-3xl xl:text-3xl font-semibold text-start"> Trekking Summit</h1>
          <p className="text-gray-200 font-secondary text-center text-sm">Lorem, ipsum dolor sit amet consectetur adipisicing elit.  Voluptatem, <br /> quia corrupti  sapiente perspiciatis quibusdam quod sequi facere cumque sint aspernatur!</p>
        </div>
      </section>
      <div className="bg-hitam-0 py-16 w-full px-8 md:px-11 xl:px-20 xl:max-w-[100rem] mx-auto">
        <section className='w-full flex flex-col '>
          <div className="carousel flex xl:grid xl:grid-cols-4 xl:gap-y-7 gap-x-7 mb-5 xl:mx-auto">
            {dataTrekking.map((item, index) => (
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
        </section >
      </div>
      <FooterDsy></FooterDsy>
    </>
  )
}