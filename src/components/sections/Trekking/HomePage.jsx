import React, { Children } from 'react'

export const HomePage = ({ Image, className }) => {
  return (
    <div
      style={{ backgroundImage: `url('/${Image}')` }}
      className={`w-full h-full bg-center bg-cover bg-no-repeat p-5 flex justify-start items-end ${className} relative`}>
      {/* <h1 className='text-white text-4xl font-tomorrow font-semibold z-10'>{title}</h1> */}
      <span className='w-full h-full bg-hitam-0 top-0 left-0 opacity-10 absolute'></span>

    </div>
  )
}
