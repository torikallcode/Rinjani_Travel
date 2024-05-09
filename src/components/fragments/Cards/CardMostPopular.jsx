import React from 'react'

export const CardMostPopular = ({ style, children, className, lokasi, nama }) => {
  return (
    <div
      data-aos="fade-up"
      data-aos-once="true"
      style={style}
      className={`hover:scale-150 ${className} w-full h-60 sm:h-72 md:h-80 rounded-xl bg-cover bg-center relative  flex flex-col justify-start p-7 `}>
      {children}
      <h1 className='text-putih-0 drop-shadow-lg font-secondary text-lg font-medium z-10 leading-4'>{nama}</h1>
      <h1 className='text-gray-300 drop-shadow-lg font-secondary font-light text-sm z-10'>{lokasi}</h1>
      <span className='w-full h-full bg-hitam-0 absolute top-0 left-0 opacity-30'></span>
    </div>
  )
}
