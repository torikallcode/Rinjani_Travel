import { Acourdion } from '@/components/fragments/Acourdion';
import { SideSupport } from '@/components/fragments/Side/SideSupport';
import { CarouselTrekking } from '@/components/ui/CarouselTrekking';
import React, { useState } from 'react';
import BookingForm from '@/components/fragments/BookingForm';

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
  children,
}) => {
  const images = [
    '/img/mandalika.webp',
    '/img/Rinjani.jpg',
    '/img/pinkbeach.jpg',
  ];

  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  // Array data untuk Acourdion
  const daysData = [
    { judulHari: daySatu, content: daySatuLengkap },
    { judulHari: dayDua, content: dayDuaLengkap },
    { judulHari: dayTiga, content: dayTigaLengkap },
    { judulHari: dayEmpat, content: dayEmpatLengkap },
  ];

  return (
    <div className={`${className} flex flex-col lg:flex-row w-full lg:gap-x-10 relative items-start`}>
      <div className='lg:w-[70%] mb-10'>
        <h1 className='mb-5 text-4xl font-medium text-putih-0 font-tomorrow'>{title}</h1>
        <p className='mb-3 text-sm text-gray-300 font-secondary'>{descLengkap}</p>
        <CarouselTrekking images={images}></CarouselTrekking>
        {children}

        {daysData.map(
          (day, index) =>
            day.content && (
              <Acourdion key={index} judulHari={day.judulHari}>
                <p className='mb-3 text-sm text-gray-300 font-secondary'>
                  {day.content}
                </p>
              </Acourdion>
            )
        )}

        <div className="relative">
          <button
            onClick={openForm}
            className="w-full mx-auto text-base text-center border-none btn bg-biru-0 text-putih-0 hover:bg-biru-0"
          >
            Booking Now
          </button>
          {isFormOpen && (
            <>
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <BookingForm onClose={closeForm} bookingName={title} />
              </div>
              <div className="fixed inset-0 z-40 bg-black opacity-50" onClick={closeForm} />
            </>
          )}
        </div>
      </div>

      <div className='w-full lg:w-[30%] sticky top-20 bg-abu-0 bg-opacity-50 rounded-lg'>
        <div className='py-3 overflow-hidden min-h-80'>
          <SideSupport />
        </div>
      </div>
    </div>
  );
};
