import React from 'react';
import { NavbarDsy } from '../ui/NavbarDsy';
import { FooterDsy } from '../ui/FooterDsy';

export const AuthLayout = ({ children, backgroundImage, title, desc }) => {
  return (
    <div>
      <NavbarDsy className={'fixed z-50'}></NavbarDsy>
      <section
        className="bg-fixed relative h-[70dvh] bg-center bg-cover bg-no-repeat gradient-mask-b-70"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <span className='absolute top-0 left-0 z-10 w-full h-full opacity-50 bg-hitam-0'></span>
        <div className='flex flex-col items-center justify-center w-full h-full px-5 md:px-11 xl:px-20 xl:max-w-[87rem] mx-auto z-20 relative'>
          <h1 className="text-3xl font-semibold text-center text-putih-0 font-tomorrow xl:text-3xl">{title}</h1>
          <p className="max-w-3xl text-sm text-center text-gray-200 font-secondary xl:text-base">
            {desc}
          </p>
        </div>
      </section>
      <div className="bg-hitam-0 py-32 lg:py-16 pb-32 w-full px-8 md:px-11 xl:px-20 xl:max-w-[90rem] mx-auto">
        <section className='flex flex-col items-center justify-center w-full'>
          {children}
        </section >
      </div>
      <FooterDsy></FooterDsy>
    </div>
  );
};
