import React from 'react'
import { NavbarDsy } from '../ui/NavbarDsy'
import { FooterDsy } from '../ui/FooterDsy'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useEffect } from 'react'

export const AboutLayout = () => {


  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <>
      <NavbarDsy className={'fixed z-[99999]'}></NavbarDsy>
      <section className="bg-fixed relative h-[70dvh] bg-center bg-cover bg-no-repeat gradient-mask-b-70" style={{ backgroundImage: "url('img/aboutme1.jpg')" }}>
        <span className='w-full h-full bg-hitam-0 absolute top-0 left-0 opacity-50 z-10'></span>
        <div className='flex flex-col items-center justify-center w-full h-full px-5 md:px-11 xl:px-20 xl:max-w-[100rem] mx-auto z-20 relative'>
          <h1 className="text-putih-0 font-tomorrow text-3xl xl:text-3xl font-semibold text-start">Tentag kami</h1>
          <p className="text-gray-200 font-secondary text-center text-sm xl:text-base max-w-3xl">Kenali kami lebih dalam dan pelajari misi serta visi kami dalam menyediakan petualangan yang aman dan berkesan.</p>
        </div>
      </section>
      <div className="flex flex-col justify-center items-center bg-hitam-0 py-32 w-full px-8 md:px-11 xl:px-20 xl:max-w-[90rem] mx-auto">
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-5 lg:gap-y-10 xl:gap-y-32'>
          <div
            data-aos="fade-up"
            data-aos-once="true"
            className='xl:col-span-2 flex flex-col gap-y-3 justify-start items-starts max-w-md xl:max-w-xl'>
            <h3 className='text-gray-300 font-secondary text-start text-sm sm:text-base'>About Our Agency</h3>
            <h1 className='text-putih-0 font-tomorrow text-3xl sm:text-4xl font-medium text-start'>Your trusted patner <br /> for business</h1>
            <p className='text-gray-300 font-secondary text-base text-start'>Grow Rinjani is a trekking and travel agency based in senaru, North of Lombok Indonesia. Grow Rinjani was founded on 2018 by Perman & Suwendi, our company has been licensed since 2018, and all of our crew are trained and have experience on their respective fields such as guides, porters & oprators.</p>
          </div>
          <div>
            <img
              data-aos="fade-up"
              data-aos-once="true"
              src="img/Rinjani.jpg"
              alt=""
              className="w-full h-full aspect-[3/2] object-cover rounded-lg"
            />
          </div>
          <div>
            <img
              data-aos="fade-up"
              data-aos-once="true"
              src="img/trawangan2.png"
              alt=""
              className="w-full h-full aspect-[3/2] object-cover rounded-lg"
            />
          </div>
          <div
            data-aos="fade-up"
            data-aos-once="true"
            className='flex flex-col gap-y-3 justify-start items-starts xl:col-span-2 xl:max-w-xl'>
            <p className='text-gray-300 font-secondary text-base text-start'>we have experience in Mount Rinjani since 2005 as a guide and before working on Mount Rinjani we had worked on Tour and Trevel agency at Gili Trawangan, nort of Lombok since 2000. with long experienced in M.t Rinjani Trekking Industry we know all things you need on rinjani and we will sure your fun & memorable trekking adventure on M.T Rinjani.</p>
          </div>
          <div
            data-aos="fade-up"
            data-aos-once="true"
            className='xl:col-span-2 flex flex-col gap-y-3 justify-start items-starts max-w-md xl:max-w-xl'>
            <p className='text-gray-300 font-secondary text-base text-start'>Grow Rinjani is a trekking and travel agency based in senaru, North of Lombok Indonesia. Grow Rinjani was founded on 2018 by Perman & Suwendi, our company has been licensed since 2018, and all of our crew are trained and have experience on their respective fields such as guides, porters & oprators.</p>
          </div>
          <div>
            <img
              data-aos="fade-up"
              data-aos-once="true"
              src="img/Rinjani.jpg"
              alt=""
              className="w-full h-full aspect-[3/2] object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
      <p></p>
      <FooterDsy></FooterDsy>
    </>
  )
}
