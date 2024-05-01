import React from 'react'

export const CardLayananKami = ({ icon, title, desc }) => {
  return (
    <div
      data-aos="fade-up"
      data-aos-once="true"
      className='flex justify-center items-center bg-putih-0 rounded-lg bg-opacity-5 backdrop-filter backdrop-blur-lg p-3'>
      {icon}
      <div className='flex flex-col justify-center gap-y-3'>
        <h1 className='text-white font-tomorrow text-lg font-medium'>{title}</h1>
        <p className='text-gray-300 font-secondary text-sm lg:text-xs'>{desc}</p>
      </div>
    </div>
  )
}
