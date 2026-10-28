import React from 'react'

export const CardLayananKami = ({ icon, title, desc }) => {
  return (
    <div
      data-aos="fade-up"
      data-aos-once="true"
      className='flex flex-col justify-center items-center  rounded-lg bg-opacity-5 backdrop-filter backdrop-blur-lg p-5 py-9 aspect-[4/2] w-72 lg:w-64 xl:w-72'>
      {icon}
      <div className='flex flex-col items-center justify-center gap-y-3'>
        <h1 className='text-lg font-medium text-putih-0 font-tomorrow'>{title}</h1>
        <p className='text-sm text-center text-gray-400 font-secondary'>{desc}</p>
      </div>
    </div>
  )
}
