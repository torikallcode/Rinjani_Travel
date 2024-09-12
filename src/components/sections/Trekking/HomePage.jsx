import React, { Children } from 'react'

export const HomePage = ({ Image, className }) => {
  return (
    <div
      style={{ backgroundImage: `url('/${Image}')` }}
      className={`w-full h-full bg-center bg-cover bg-no-repeat p-5 flex justify-start items-end ${className} relative`}>
      <span className='absolute top-0 left-0 w-full h-full bg-hitam-0 opacity-10'></span>
    </div>
  )
}
