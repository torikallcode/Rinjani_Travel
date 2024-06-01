import React from 'react'
import { Link } from 'react-router-dom'

export const CardTour = ({ className, image }) => {
  return (
    <div
      data-aos="fade-up"
      data-aos-once="true"
      style={{ backgroundImage: `url(${image})` }}
      className={`${className} w-full bg-cover bg-center h-60 sm:h-72 md:h-80 rounded-xl relative px-5 py-7 flex flex-col justify-between`}
    >
      <h1 className='text-putih-0 drop-shadow-lg font-secondary text-lg leading-6 font-medium z-10'>Tour Sendang Gile and <br /> Tiu Kelep Waterfall</h1>
      <Link className='text-putih-0 drop-shadow-lg font-secondary text-sm font-medium z-10 leading-4 bg-biru-0 p-3 w-44 text-center rounded-lg shadow-sm'>Start From $260</Link>
      <span className='w-full h-full bg-hitam-0 top-0 left-0 opacity-30 absolute'></span>
    </div>
  )
}
