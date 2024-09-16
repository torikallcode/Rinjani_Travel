import React from 'react'
import { AuthLayout } from '@/components/layouts/AuthLayout'

export const About = () => {
  return (
    <div className="App bg-hitam-0 ">
      <AuthLayout
        title={'About us'}
        desc={'Kenali kami lebih dalam dan pelajari misi serta visi kami dalam menyediakan petualangan yang aman dan berkesan.'}
        children={
          <>
            <div className='flex flex-col items-center justify-around w-full lg:flex-row gap-y-3 gap-x-20'>
              <div
                data-aos="fade-up"
                data-aos-once="true"
                className='xl:col-span-2 flex lg:w-[2/3] flex-col gap-y-3 justify-start items-starts lg:max-w-md xl:max-w-xl'>
                <h3 className='text-sm text-gray-300 font-secondary text-start'>About Our Agency</h3>
                <h1 className='text-3xl font-medium text-putih-0 font-tomorrow sm:text-4xl lg:text-2xl text-start'>Your Trusted Patner <br /> For Advanturef</h1>
                <p className='text-base text-gray-300 font-secondary text-start'>Grow Rinjani is a premier trekking and travel agency located in Senaru, North Lombok, Indonesia. Established in 2018 by founders Perman & Suwendi, we have been a licensed company since our inception. Our dedicated team, including experienced guides, porters, and operators, is well-trained and committed to ensuring a safe and unforgettable adventure for every client.</p>
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
            <div className='flex flex-col items-center justify-around w-full lg:flex-row-reverse gap-y-3 gap-x-20'>
              <div
                data-aos="fade-up"
                data-aos-once="true"
                className='xl:col-span-2 flex lg:w-[2/3] flex-col gap-y-3 justify-start items-starts lg:max-w-md xl:max-w-xl'>
                <h1 className='text-3xl font-medium text-putih-0 font-tomorrow sm:text-4xl lg:text-2xl text-start'>Your Reliable Partner <br /> For Treks</h1>
                <p className='text-base text-gray-300 font-secondary text-start'>Located in the heart of Senaru, North Lombok, Indonesia, Grow Rinjani is a trusted trekking and travel agency that was established in 2018 by Perman & Suwendi. We hold a valid license and take pride in our skilled team, which includes knowledgeable guides, strong porters, and efficient operators, all ready to provide you with an extraordinary trekking experience.</p>
              </div>
              <div>
                <img
                  data-aos="fade-up"
                  data-aos-once="true"
                  src="img/layanan.jpg"
                  alt=""
                  className="w-full h-full aspect-[3/2] lg:max-w-md object-cover rounded-lg"
                />
              </div>
            </div>
            <div className='flex flex-col items-center justify-around w-full lg:flex-row gap-y-3 gap-x-20'>
              <div
                data-aos="fade-up"
                data-aos-once="true"
                className='xl:col-span-2 flex lg:w-[2/3] flex-col gap-y-3 justify-start items-starts lg:max-w-md xl:max-w-xl'>
                <h1 className='text-3xl font-medium text-putih-0 font-tomorrow sm:text-4xl lg:text-2xl text-start'>Your Trusted Patner <br /> For Business</h1>
                <p className='text-base text-gray-300 font-secondary text-start'>Grow Rinjani is a trekking and travel agency based in senaru, North of Lombok Indonesia. Grow Rinjani was founded on 2018 by Perman & Suwendi, our company has been licensed since 2018, and all of our crew are trained and have experience on their respective fields such as guides, porters & oprators.</p>
              </div>
              <div>
                <img
                  data-aos="fade-up"
                  data-aos-once="true"
                  src="img/trawangan.jpg"
                  alt=""
                  className="w-full h-full aspect-[3/2] lg:max-w-md object-cover rounded-lg"
                />
              </div>
            </div>
          </>
        }
      />
    </div>

  )
}
