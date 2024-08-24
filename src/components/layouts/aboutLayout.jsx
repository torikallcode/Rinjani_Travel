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
          <h1 className="text-putih-0 font-tomorrow text-3xl xl:text-3xl font-semibold text-start">Tentang kami</h1>
          <p className="text-gray-200 font-secondary text-center text-sm xl:text-base max-w-3xl">Kenali kami lebih dalam dan pelajari misi serta visi kami dalam menyediakan petualangan yang aman dan berkesan.</p>
        </div>
      </section>
      <div className="flex flex-col justify-center items-center bg-hitam-0 py-32 w-full px-8 md:px-11 xl:px-20 xl:max-w-[90rem] mx-auto">
        <div className='flex flex-col justify-center items-center gap-y-28'>
          <div className='flex flex-col lg:flex-row justify-between items-center gap-y-3 gap-x-20'>
            <div
              data-aos="fade-up"
              data-aos-once="true"
              className='xl:col-span-2 flex lg:w-[2/3] flex-col gap-y-3 justify-start items-starts lg:max-w-md xl:max-w-xl'>
              <h3 className='text-gray-300 font-secondary text-start text-sm'>About Our Agency</h3>
              <h1 className='text-putih-0 font-tomorrow text-3xl sm:text-4xl lg:text-2xl font-medium text-start'>Your trusted patner <br /> for business</h1>
              <p className='text-gray-300 font-secondary text-base text-start'>Grow Rinjani is a trekking and travel agency based in senaru, North of Lombok Indonesia. Grow Rinjani was founded on 2018 by Perman & Suwendi, our company has been licensed since 2018, and all of our crew are trained and have experience on their respective fields such as guides, porters & oprators.</p>
            </div>
            <div>
              <img
                data-aos="fade-up"
                data-aos-once="true"
                src="img/Rinjani.jpg"
                alt=""
                className="w-full h-full aspect-[3/2] lg:max-w-md object-cover rounded-lg"
              />
            </div>
          </div>
          <div className='flex flex-col lg:flex-row-reverse justify-between items-center gap-y-3 gap-x-20'>
            <div
              data-aos="fade-up"
              data-aos-once="true"
              className='xl:col-span-2 flex lg:w-[2/3] flex-col gap-y-3 justify-start items-starts lg:max-w-md xl:max-w-xl'>
              <h1 className='text-putih-0 font-tomorrow text-3xl sm:text-4xl lg:text-2xl font-medium text-start'>Your trusted patner <br /> for business</h1>
              <p className='text-gray-300 font-secondary text-base text-start'>Grow Rinjani is a trekking and travel agency based in senaru, North of Lombok Indonesia. Grow Rinjani was founded on 2018 by Perman & Suwendi, our company has been licensed since 2018, and all of our crew are trained and have experience on their respective fields such as guides, porters & oprators.</p>
            </div>
            <div>
              <img
                data-aos="fade-up"
                data-aos-once="true"
                src="img/Rinjani.jpg"
                alt=""
                className="w-full h-full aspect-[3/2] lg:max-w-md object-cover rounded-lg"
              />
            </div>
          </div>
          <div className='flex flex-col lg:flex-row justify-between items-center gap-y-3 gap-x-20'>
            <div
              data-aos="fade-up"
              data-aos-once="true"
              className='xl:col-span-2 flex lg:w-[2/3] flex-col gap-y-3 justify-start items-starts lg:max-w-md xl:max-w-xl'>
              <h1 className='text-putih-0 font-tomorrow text-3xl sm:text-4xl lg:text-2xl font-medium text-start'>Your trusted patner <br /> for business</h1>
              <p className='text-gray-300 font-secondary text-base text-start'>Grow Rinjani is a trekking and travel agency based in senaru, North of Lombok Indonesia. Grow Rinjani was founded on 2018 by Perman & Suwendi, our company has been licensed since 2018, and all of our crew are trained and have experience on their respective fields such as guides, porters & oprators.</p>
            </div>
            <div>
              <img
                data-aos="fade-up"
                data-aos-once="true"
                src="img/Rinjani.jpg"
                alt=""
                className="w-full h-full aspect-[3/2] lg:max-w-md object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
      <p></p>
      <FooterDsy></FooterDsy>
    </>
  )
}
