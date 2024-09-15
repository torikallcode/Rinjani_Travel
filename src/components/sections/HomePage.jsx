import React from 'react'
export const HomePage = () => {

  return (
    <section
      id='home'
      className='relative w-full h-screen gradient-mask-b-70'>
      <div
        className='absolute top-0 left-0 w-full h-full bg-center bg-cover -z-20'
        style={{ backgroundImage: "url('img/mnt41.jpg')" }}
      ></div>
      <span className='absolute top-0 left-0 w-full h-full bg-hitam-0 opacity-30 -z-10'>
      </span>
      <div className='flex flex-col items-center justify-center h-full w-full z-10 relative px-5 md:px-8 lg:px-11 xl:px-20 xl:max-w-[100rem] mx-auto'>
        <div className='flex flex-col w-full lg:flex-row lg:justify-between lg:items-center'>
          <div className='flex flex-col justify-start space-y-3'>
            <h1 className='text-5xl font-medium text-white font-tomorrow sm:text-7xl lg:text-5xl xl:text-7xl text-start drop-shadow-md'>Back to nature <br /> <span>make the future</span></h1>
            <p className='max-w-xs text-sm font-light text-white font-secondary sm:text-xl lg:text-base xl:text-base text-start drop-shadow-md sm:max-w-sm'>Selamat datang di dunia petualangan tanpa batas. Temukan keindahan dunia bersama kami!</p>
          </div>
          <div className='flex items-center justify-center'>
            <img src="img/peta-phone.png"
              alt="Peta"
              className='lg:block max-w-[25rem] w-full'
            />

          </div>

        </div>
      </div>
    </section>
  )
}
