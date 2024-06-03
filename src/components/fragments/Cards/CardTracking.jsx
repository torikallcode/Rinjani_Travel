import React from 'react'
import { Link } from 'react-router-dom'

export const CardTracking = ({ image, rating, title, days, desc, price, id }) => {
  return (
    <div className="card card-compact w-72 bg-putih-0 bg-opacity-5 relative ">
      <figure className='relative'><img src={image} alt="Shoes" />
        <span className='w-full h-full bg-hitam-0 absolute top-0 left-0 opacity-30'></span>
      </figure>
      <div className='absolute flex justify-center items-center gap-x-1 top-3 right-3 text-putih-0 bg-hitam-0 px-2 py-1 rounded-full bg-opacity-25'>
        <h1 className='font-secondary'>{rating}</h1>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill='#f7d100'><path d="M21.947 9.179a1.001 1.001 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065z"></path></svg>
      </div>
      <div className="card-body gap-y-3 flex flex-col justify-between">
        <div className='flex flex-col gap-0 mb-2'>
          <h2 className="card-title text-putih-0 font-secondary font-medium text-base md:text-base">{title}</h2>
          <h3 className='text-gray-400 font-secondary -mt-1 xl:text-xs'>{days}</h3>
        </div>
        <p className='text-putih-0 font-secondary font-extralight text-sm'>{desc}</p>
        <div className="card-actions justify-between flex items-center">
          <h2 className='font-secondary text-putih-0 text-base font-medium'>USD. {price}</h2>
          <Link to={`/DetailTrekking/${id}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill='#00ADB5'><path d=" M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 15v-4H7v-2h5V7l5 5-5 5z"></path></svg>
          </Link>
        </div>
      </div >
    </div >
  )
}
