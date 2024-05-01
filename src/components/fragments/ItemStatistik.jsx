import React, { Children } from 'react'

export const ItemStatistik = ({ children, className }) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {children}
    </div>
  )
}

export const Header = ({ header }) => {
  return (
    <div className='w-full'>
      <h1 className='text-white font-tomorrow text-2xl border-b-2 border-gray-700 py-5'>{header}</h1>

    </div>
  )
}

export const Body = ({ Dom, Man, DomChild, ManChild, body, classBody }) => {
  return (
    <div className='w-full space-y-3'>
      <h1 className={`text-putih-0 font-tomorrow font-light text-5xl lg:text-4xl xl:font-normal ${classBody}`}>
        {body}
      </h1>
      <div className='flex items-end gap-x-2'>
        <h1 className='text-putih-0 font-tomorrow font-light text-5xl lg:text-4xl xl:font-normal'>
          {Dom}
        </h1>
        <span className='text-putih-0 font-tomorrow text-xs'>{DomChild}</span>
      </div>
      <div className='flex items-end gap-x-2 pb-2'>
        <h1 className='text-putih-0 font-tomorrow font-light text-5xl lg:text-4xl xl:font-normal'>
          {Man}
        </h1>
        <span className='text-putih-0 font-tomorrow text-xs'>{ManChild}</span>
      </div>
    </div>
  )
}

export const Footer = ({ footer }) => {
  return (
    <div className='w-full max-w-sm'>
      <p className='text-gray-500 font-secondary text-sm'>{footer}</p>
    </div>
  )
}

ItemStatistik.Header = Header
ItemStatistik.Body = Body
ItemStatistik.Footer = Footer
