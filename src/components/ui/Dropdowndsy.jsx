import React from 'react'
import { Link } from 'react-router-dom'

export const Dropdowndsy = () => {
  return (
    <div className="relative group">
      <div className="btn p-0 bg-transparent font-normal shadow-none border-none text-white cursor-pointer text-base font-secondary hover:bg-transparent">
        Package
      </div>
      <ul className="absolute top-[115%] hidden group-hover:block rounded-lg z-[1] w-52 p-2 bg-abu-0 shadow text-putih-0">
        <li className='mb-2 hover:bg-hitam-0 rounded-lg p-2'><Link to="/"><a>Tour</a></Link></li>
        <li className='hover:bg-hitam-0 rounded-lg p-2'><Link to="/"><a>Trekking</a></Link></li>
      </ul>
    </div>
  )
}
