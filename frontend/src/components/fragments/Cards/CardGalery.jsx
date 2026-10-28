import React from 'react'

export const CardGalery = ({ style, className }) => {
  return (
    <div
      data-aos="fade-up"
      data-aos-once="true"
      style={style}
      className={`hover:scale-150 ${className} w-full h-60 sm:h-72 md:h-80 rounded-xl bg-cover bg-center relative  flex flex-col justify-start p-7 gradient-mask-b-70`}>
    </div>
  )
}
