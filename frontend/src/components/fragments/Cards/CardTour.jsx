import React from 'react'
import { Link } from 'react-router-dom'

export const CardTour = ({ image, rating, title, days, desc, price, id, aspect = "aspect-[2/3]", classname }) => {
  return (
    <Link to={`/DetailTour/${id}`}>
      <div
        data-aos="fade-up"
        data-aos-once="true"
        className={`card card-compact w-72 bg-hitam-0 relative ${aspect} lg:aspect-[2/3] overflow-hidden group cursor-pointer ${classname}`}
      >
        {/* Background image with scaling on hover */}
        <div
          className="absolute inset-0 transition-transform duration-500 ease-in-out bg-center bg-cover group-hover:scale-110"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(0,0,0,0.8)), url(${image})`,
          }}
        ></div>
        <figure className='relative w-full h-48'>
          <img src={image} alt="Shoes" className="object-cover w-full h-full opacity-0" />
        </figure>
        <div className='absolute flex items-center justify-center px-2 py-1 bg-opacity-25 rounded-full gap-x-1 top-3 right-3 text-putih-0 bg-hitam-0'>
          <h1 className='font-secondary'>{rating}</h1>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill='#f7d100'><path d="M21.947 9.179a1.001 1.001 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065z"></path></svg>
        </div>
        <div className="z-10 flex justify-end card-body gap-y-3 text-start">
          <div className=''>
            <h2 className="text-lg font-medium card-title text-putih-0 font-secondary md:text-base">{title}</h2>
            <h3 className='-mt-1 text-sm text-gray-400 font-secondary'>{days}</h3>
          </div>
          <h2 className='text-base font-medium font-secondary text-putih-0'>USD. {price}</h2>
        </div >
      </div >
    </Link>
  )
}
