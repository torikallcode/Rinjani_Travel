import React from 'react'

export const MainContent = ({
  title,
  className,
  descLengkap,
  daySatu,
  dayDua,
  dayTiga,
  dayEmpat,
  daySatuLengkap,
  dayDuaLengkap,
  dayTigaLengkap,
  dayEmpatLengkap
  , children
}) => {
  return (
    <div className={`${className} flex flex-col w-full`}>
      <h1 className='text-putih-0 font-tomorrow font-medium text-4xl max-w-xs mb-5'>{title}</h1>
      <p className='text-gray-300 font-secondary text-sm mb-3'>{descLengkap}</p>
      <p className='text-gray-300 font-secondary text-sm mb-3'><span className='font-semibold text-base text-putih-0'>{daySatu}</span>{daySatuLengkap}</p>
      <p className='text-gray-300 font-secondary text-sm mb-3'><span className='font-semibold text-base text-putih-0'>{dayDua}</span>{dayDuaLengkap}</p>
      <p className='text-gray-300 font-secondary text-sm mb-3'><span className='font-semibold text-base text-putih-0'>{dayTiga}</span>{dayTigaLengkap}</p>
      <p className='text-gray-300 font-secondary text-sm mb-3'><span className='font-semibold text-base text-putih-0'>{dayEmpat}</span>{dayEmpatLengkap}</p>
      {children}
    </div>
  )
}
