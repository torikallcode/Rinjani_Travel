import React from 'react'
import { Link } from 'react-router-dom'

export const Dropdowndsy = ({ classname }) => {
  return (
    <div className="relative group">
      <div className={`${classname} btn p-0 bg-transparent font-normal shadow-none border-none text-white cursor-pointer text-base font-secondary hover:bg-transparent`}>
        Package
      </div>
      <ul className="absolute top-[100%] hidden group-hover:block rounded-lg z-[1] w-52 p-2 bg-gray-600 shadow text-putih-0">
        <li
          className='mb-2 hover:bg-gray-700 rounded-lg p-2'>
          <Link className='w-full h-full' to="/rinjaniTour"
            onClick={() => window.scrollTo({ top: 0 })}>
            <a>RInjani Tour</a>
          </Link>
        </li>
        <li
          className='hover:bg-gray-700 rounded-lg p-2'>
          <Link to="/trekkingSummit"
            onClick={() => window.scrollTo({ top: 0 })}>
            <a>Trekking Summit</a>
          </Link>
        </li>
      </ul>
    </div>
  )
}
