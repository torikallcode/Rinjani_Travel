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
      <h1 className='py-5 text-2xl text-white border-b-2 border-gray-700 font-tomorrow'>{header}</h1>

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
        <h1 className='text-5xl font-light text-putih-0 font-tomorrow lg:text-4xl xl:font-normal'>
          {Dom}
        </h1>
        <span className='text-sm text-putih-0 font-tomorrow'>{DomChild}</span>
      </div>
      <div className='flex items-end pb-2 gap-x-2'>
        <h1 className='text-5xl font-light text-putih-0 font-tomorrow lg:text-4xl xl:font-normal'>
          {Man}
        </h1>
        <span className='text-sm text-putih-0 font-tomorrow'>{ManChild}</span>
      </div>
    </div>
  )
}

export const Footer = ({ footer }) => {
  return (
    <div className='w-full max-w-sm'>
      <p className='text-base text-gray-400 font-secondary'>{footer}</p>
    </div>
  )
}

ItemStatistik.Header = Header
ItemStatistik.Body = Body
ItemStatistik.Footer = Footer
