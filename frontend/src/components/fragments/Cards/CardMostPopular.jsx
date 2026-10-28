import React from 'react'

export const CardMostPopular = ({ style, children, className, lokasi, nama }) => {
  return (
    <div
      data-aos="fade-up"
      data-aos-once="true"
      loading="lazy"
      style={{
        ...style,
        backgroundImage:
          `linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(13,13,13,0.7)), ${style.backgroundImage}`,
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
