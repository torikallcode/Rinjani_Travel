import React from 'react'
import { CardTracking } from '../fragments/Cards/CardTracking'
import { Link } from 'react-router-dom'
import { DataTracking } from '@/data/DataTracking'

export const RinjaniTrackigPackage = () => {
  return (
    <section className='w-full flex flex-col '>
      <h1 className='text-putih-0 font-tomorrow text-4xl xl:text-4xl mb-12 xl:mb-12'>Rinjani Trekking <br /> package</h1>
      <div className="carousel flex gap-x-7 mb-5">
        {DataTracking.map((item, index) => (
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
      <Link to={"/"} className="mb-7 w-32 relative rounded-xl bg-transparent isolation-auto z-10 before:absolute before:w-full before:transition-all before:duration-500 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:-z-10 before:aspect-square before:hover:scale-150 overflow-hidden before:hover:duration-500 text-white hover:border-biru-0 font-primary font-medium text-base lg:text-lg xl:text-lg"
      >
        More package →
      </Link>
    </section >
  )
}
