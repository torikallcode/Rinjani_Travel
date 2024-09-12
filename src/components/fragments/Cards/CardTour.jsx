import React from 'react'
import { Link } from 'react-router-dom'

export const CardTour = ({ className, image }) => {
  return (
    // <div
    //   // data-aos="fade-up"
    //   // data-aos-once="true"
    //   style={{ backgroundImage: `url(${image})` }}
    //   className={`${className} h-60 sm:h-72 md:h-80 lg:h-96 w-full aspect-[2/3] rounded-xl p-5 bg-cover bg-center ease-in-out relative flex flex-col justify-end`}
    // >
    //   <h1 className='z-10 text-base font-medium text-putih-0 drop-shadow-lg font-secondary'>Tour Sendang Gile and Tiu Kelep Waterfall</h1>
    //   <Link className='z-10 p-3 text-sm font-medium text-center rounded-lg shadow-sm text-putih-0 drop-shadow-lg font-secondary bg-biru-0 w-44'>Start From $260</Link>
    //   <span className='absolute top-0 left-0 w-full h-full bg-hitam-0 opacity-30'></span>
    // </div>
    <div
      data-aos="fade-up"
      data-aos-once="true"
      style={{
        ...style,
        backgroundImage:
          `linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(13,13,13,0.8)), ${style.backgroundImage}`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className={`hover:scale-150 ${className} w-full h-60 sm:h-72 md:h-80 rounded-xl relative flex flex-col justify-end p-7`}>
      {children}
      <h1 className='z-10 text-lg font-medium text-putih-0 drop-shadow-lg font-secondary'>{nama}</h1>
      <h1 className='z-10 text-sm font-light text-gray-300 drop-shadow-lg font-secondary'>{lokasi}</h1>
    </div>
  )
}
