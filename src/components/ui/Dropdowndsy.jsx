import React from 'react'
import { Link } from 'react-router-dom'

export const Dropdowndsy = () => {
  return (
    <div className="relative group">
      <div className="btn p-0 bg-transparent font-normal shadow-none border-none text-white cursor-pointer text-base font-secondary hover:bg-transparent">
        Package
      </div>
      <ul className="absolute top-[100%] hidden group-hover:block rounded-lg z-[1] w-52 p-2 bg-gray-600 shadow text-putih-0">
        <li className='mb-2 hover:bg-gray-700 rounded-lg p-2'><Link to="/"><a>Tour</a></Link></li>
        <li className='hover:bg-gray-700 rounded-lg p-2'><Link to="/"><a>Trekking</a></Link></li>
      </ul>
    </div>
  )
}
