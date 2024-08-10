import React from 'react'
import { Link } from 'react-router-dom'

export const Dropdowndsy = () => {
  return (
    <div className="dropdown dropdown-bottom">
      <div tabIndex={0} role="button" className="btn m-1 p-0 bg-transparent font-normal shadow-none border-none text-white cursor-pointer text-base font-secondary hover:bg-transparent">Package </div>
      <ul tabIndex={0} className="dropdown-content menu rounded-lg z-[1] w-52 p-2 bg-hitam-0 shadow text-putih-0">
        <li><Link to="/"><a>Tour</a></Link></li>
        <li><Link to="/"><a>Trekking</a></Link></li>
      </ul>
    </div>
  )
}
