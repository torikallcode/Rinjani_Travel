import React from 'react'

export const CardLayananKami = ({ icon, title, desc }) => {
  return (
    <div
      data-aos="fade-up"
      data-aos-once="true"
      className='flex flex-col justify-center items-center  rounded-lg bg-opacity-5 backdrop-filter backdrop-blur-lg p-5 py-9 aspect-[4/2] w-72 lg:w-64 xl:w-72'>
      {icon}
      <div className='flex flex-col justify-center items-center gap-y-3'>
        <h1 className='text-putih-0 font-tomorrow text-lg font-medium'>{title}</h1>
        <p className='text-gray-400 font-secondary text-sm text-center'>{desc}</p>
      </div>
    </div>
  )
}
