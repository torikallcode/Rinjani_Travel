import React from 'react'

export const AboutMe = () => {
  return (<div className='w-full relative py-24'>
    <div
      className='w-full h-full absolute top-0 left-0 bg-cover bg-center'
      style={{ backgroundImage: "url('img/aboutme1.jpg')" }}
    ></div>
    <div className='w-full h-full bg-black absolute top-0 left-0 opacity-40'></div>
    <div className='flex flex-col h-full w-full relative px-5 md:px-8 lg:px-11 xl:px-28 xl:max-w-[100rem] mx-auto'>
      <div className='w-full flex flex-col max-w-2xl'>
        <h1 className='text-white font-tomorrow text-left mb-3'>Tentang kami</h1>
        <h1 className='text-white font-tomorrow text-4xl text-left mb-3 font-medium'>Temukan Keajaiban Lombok Bersama Kami: Perjalanan Anda, Kenangan Abadi</h1>
        <p className='text-white font-secondary sm:max-w-lg md:max-w-xl sm:text-xl lg:text-base text-left drop-shadow-sm'>Kami adalah tim TRVL yang berbasis di Lombok, yang berkomitmen untuk membawa Anda pada petualangan tak terlupakan di pulau yang indah ini. Dengan cinta dan pengetahuan yang mendalam tentang destinasi ini, kami menyediakan layanan travel yang personal dan berkualitas tinggi, memastikan setiap momen perjalanan Anda menjadi berkesan. Dari pantai-pantai yang memikat hingga gunung-gunung yang megah, mari bersama-sama menjelajahi pesona alam dan budaya Lombok. Sambutlah petualangan baru dan kenangan abadi dengan kami!</p>
      </div>
    </div>
  </div>
  )
}
