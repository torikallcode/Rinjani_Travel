import React from 'react'

export const HomePage = () => {

  return (
    <section id='home' className='w-full h-screen gradient-mask-b-70  relative'>
      <div
        className='w-full h-full absolute top-0 left-0 bg-cover bg-center -z-20'
        style={{ backgroundImage: "url('img/homepage3.jpg')" }}
      ></div>
      <span className='w-full h-full bg-hitam-0 absolute top-0 left-0 opacity-30 -z-10'>

      </span>
      <div className='flex flex-col items-center justify-center h-full w-full z-10 relative px-5 md:px-8 lg:px-11 xl:px-28 xl:max-w-[100rem] mx-auto'>
        <div className='w-full flex flex-col lg:flex-row lg:justify-between lg:items-center'>
          <div className='flex justify-start flex-col space-y-3'>
            <h1 className='text-white font-tomorrow text-5xl sm:text-7xl lg:text-5xl xl:text-7xl font-medium text-start drop-shadow-md'>Back to nature <br /> <span>make the future</span></h1>
            <p className='text-white font-secondary text-xs sm:text-xl lg:text-base xl:text-base font-light text-start drop-shadow-md max-w-sm'>Travelling or travelling depends on where is your audience. Traveling is the preferred spelling in the LOMBOK.</p>
            <div>
              <button
                className="relative px-8 py-2 rounded-xl bg-transparent isolation-auto z-10 border-2 border-white before:absolute before:w-full before:transition-all before:duration-500 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-biru-0 before:-z-10 before:aspect-square before:hover:scale-150 overflow-hidden before:hover:duration-500 text-white hover:text-white hover:border-biru-0 font-primary font-medium text-base sm:text-2xl lg:text-lg xl:text-xl"
              >
                Get started →
              </button>
            </div>
          </div>
          <img src="img/peta.png" alt="" className='hidden lg:block w-72 h-72 lg:w-96 lg:h-96 xl:w-[450px] xl:h-[450px]' />
        </div>
      </div>
    </section>
  )
}
