import { Acourdion } from '@/components/fragments/Acourdion'
import { SideGalery } from '@/components/fragments/Side/SideGalery'
import { SideSummit } from '@/components/fragments/Side/SideSummit'
import { SideSupport } from '@/components/fragments/Side/SideSupport'
import { SideTour } from '@/components/fragments/Side/SIdeTour'
import { SideTrekking } from '@/components/fragments/Side/SideTrekking'
import { CarouselTrekking } from '@/components/ui/CarouselTrekking'
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

  const images = [
    'https://via.placeholder.com/600/92c952',
    'https://via.placeholder.com/600/771796',
    'https://via.placeholder.com/600/24f355',
  ];

  return (
    <div className={`${className} flex flex-col lg:flex-row w-full lg:gap-x-10`}>
      <div className='lg:w-[70%] mb-10'>
        <h1 className='text-putih-0 font-tomorrow font-medium text-4xl max-w-xs mb-5'>{title}</h1>
        <p className='text-gray-300 font-secondary text-sm mb-3'>{descLengkap}</p>
        {/* <CarouselTrekking images={images}></CarouselTrekking> */}
        <Acourdion>
          <p className='text-gray-300 font-secondary text-sm mb-3'>
            <span className='font-semibold text-base text-putih-0'>{daySatu}</span>{daySatuLengkap}
          </p>
        </Acourdion>
        <Acourdion>
          <p className='text-gray-300 font-secondary text-sm mb-3'>
            <span className='font-semibold text-base text-putih-0'>{dayDua}</span>{dayDuaLengkap}
          </p>
        </Acourdion>
        <Acourdion>
          <p className='text-gray-300 font-secondary text-sm mb-3'>
            <span className='font-semibold text-base text-putih-0'>{dayTiga}</span>{dayTigaLengkap}
          </p>
        </Acourdion>
        <Acourdion>
          <p className='text-gray-300 font-secondary text-sm mb-3'>
            <span className='font-semibold text-base text-putih-0'>{dayEmpat}</span>{dayEmpatLengkap}
          </p>
        </Acourdion>

        {children}
        <button className="btn bg-biru-0 text-putih-0 border-none hover:bg-biru-0 w-full mx-auto text-base text-center">Booking Now</button>
      </div>
      <div className='w-full lg:w-[30%]'>
        <div className='min-h-80 mb-7  overflow-hidden rounded-lg'>
          <SideSupport />
        </div>
        <div className='min-h-80 mb-7 overflow-hidden rounded-lg'>
          <SideGalery />
        </div>
        <div className='min-h-80 mb-7 overflow-hidden rounded-lg'>
          <SideTrekking />
        </div>
        <div className='min-h-80 mb-7 overflow-hidden rounded-lg'>
          <SideTour />
        </div>
        <div className='min-h-80 mb-7 overflow-hidden rounded-lg'>
          <SideSummit />
        </div>
      </div>
    </div>
  )
}
