import React from 'react'
import { FocusCardsDemo } from '@/FocusCardsDemo';
import { NavbarDsy } from '../ui/NavbarDsy';
import { FooterDsy } from '../ui/FooterDsy';

const images = [
  { src: 'https://via.placeholder.com/400', size: 'large' },
  { src: 'https://via.placeholder.com/200', size: 'small' },
  { src: 'https://via.placeholder.com/300', size: 'medium' },
  { src: 'https://via.placeholder.com/300', size: 'medium' },
  { src: 'https://via.placeholder.com/400', size: 'large' },
  { src: 'https://via.placeholder.com/200', size: 'small' },
];
export const GaleryLayout = () => {
  return (
    <>
      <NavbarDsy className={'fixed z-[9999]'}></NavbarDsy>
      <section className="relative h-[50dvh] bg-center bg-cover bg-no-repeat gradient-mask-b-70" style={{ backgroundImage: "url('img/aboutme1.jpg')" }}>
        <span className='w-full h-full bg-hitam-0 absolute top-0 left-0 opacity-50 z-10'></span>
        <div className='flex flex-col items-center justify-center w-full h-full px-5 md:px-11 xl:px-20 xl:max-w-[87rem] mx-auto z-20 relative'>
          <h1 className="text-putih-0 font-tomorrow text-3xl xl:text-3xl font-semibold text-center">Galery</h1>
          <p className="text-gray-200 font-secondary text-center text-sm">Lorem, ipsum dolor sit amet consectetur adipisicing elit.  Voluptatem, <br /> quia corrupti  sapiente perspiciatis quibusdam quod sequi facere cumque sint aspernatur!</p>
        </div>
      </section>
      <div className="bg-hitam-0 py-32 lg:py-16 pb-32 w-full px-8 md:px-11 xl:px-20 xl:max-w-[100rem] mx-auto">
        <section className='w-full flex flex-col '>
          <FocusCardsDemo></FocusCardsDemo>
        </section >
      </div>
      <FooterDsy></FooterDsy>
    </>
  )
}
