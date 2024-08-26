import { Acourdion } from '@/components/fragments/Acourdion'
import { SideGalery } from '@/components/fragments/Side/SideGalery'
import { SideSummit } from '@/components/fragments/Side/SideSummit'
import { SideSupport } from '@/components/fragments/Side/SideSupport'
import { SideTour } from '@/components/fragments/Side/SIdeTour'
import { SideTrekking } from '@/components/fragments/Side/SideTrekking'
import { CarouselTrekking } from '@/components/ui/CarouselTrekking'
import React from 'react'
import BookingForm from '@/components/fragments/BookingForm'
import { useState } from 'react'

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
  dayEmpatLengkap,
  children
}) => {

  const images = [
    '/img/mandalika.webp',
    '/img/Rinjani.jpg',
    '/img/pinkbeach.jpg',
  ];

  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  return (
    <div className={`${className} flex flex-col lg:flex-row w-full lg:gap-x-10 relative items-start`}>
      <div className='lg:w-[70%] mb-10'>
        <h1 className='text-putih-0 font-tomorrow font-medium text-4xl mb-5'>{title}</h1>
        <p className='text-gray-300 font-secondary text-sm mb-3'>{descLengkap}</p>
        <CarouselTrekking images={images}></CarouselTrekking>
        {children}

        {daySatuLengkap && (
          <Acourdion judulHari={daySatu}>
            <p className='text-gray-300 font-secondary text-sm mb-3'>
              {daySatuLengkap}
            </p>
          </Acourdion>
        )}

        {dayDuaLengkap && (
          <Acourdion judulHari={dayDua}>
            <p className='text-gray-300 font-secondary text-sm mb-3'>
              {dayDuaLengkap}
            </p>
          </Acourdion>
        )}

        {dayTigaLengkap && (
          <Acourdion judulHari={dayTiga}>
            <p className='text-gray-300 font-secondary text-sm mb-3'>
              {dayTigaLengkap}
            </p>
          </Acourdion>
        )}

        {dayEmpatLengkap && (
          <Acourdion judulHari={dayEmpat}>
            <p className='text-gray-300 font-secondary text-sm mb-3'>
              {dayEmpatLengkap}
            </p>
          </Acourdion>
        )}

        <div className="relative">
          <button
            onClick={openForm}
            className="btn bg-biru-0 text-putih-0 border-none hover:bg-biru-0 w-full mx-auto text-base text-center"
          >
            Booking Now
          </button>
          {isFormOpen && (
            <>
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <BookingForm
                  onClose={closeForm}
                  bookingName={title}
                />
              </div>
              <div className="fixed inset-0 bg-black opacity-50 z-40" onClick={closeForm} />
            </>
          )}
        </div>
      </div>

      <div className='w-full lg:w-[30%] sticky top-20 bg-abu-0 bg-opacity-50 rounded-lg'>
        <div className='min-h-80 overflow-hidden py-3'>
          <SideSupport />
        </div>
      </div>
    </div>
  )
}
