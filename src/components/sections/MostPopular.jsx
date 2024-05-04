import React from 'react'
import { CardMostPopular } from '../fragments/Cards/CardMostPopular'
import AOS from 'aos'
import 'aos/dist/aos.css'

export const MostPopular = () => {
  return (
    <div className='w-full flex flex-col'>
      <h1 className='text-white font-tomorrow text-4xl xl:text-5xl mb-12 xl:mb-12'>Most Popular</h1>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
        <CardMostPopular
          style={{ backgroundImage: "url('img/Rinjani.jpg')" }}
          className={`lg:col-span-2`}
          lokasi={'Sembalun , Lombok Timur'}
          nama={'Gunung Rinjani'}
        />
        <CardMostPopular
          style={{ backgroundImage: "url('img/pinkbeach.jpg')" }}
          lokasi={'Jerowaru , Lombok Timur'}
          nama={'Pantai Pink'}
        />
        <CardMostPopular
          style={{ backgroundImage: "url('img/mandalika.webp')" }}
          lokasi={'Kuta , Lombok Tengah'}
          nama={'Circuit Mandalika'}
        />
        <CardMostPopular
          style={{ backgroundImage: "url('img/turtle.webp')" }}
          className={`lg:col-span-2`}
          lokasi={'Pemenang , Lombok Utara'}
          nama={'Gili Trawangan'}
        />
      </div>
    </div>
  )
}
