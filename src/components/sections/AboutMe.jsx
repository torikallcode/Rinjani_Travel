import React from 'react'
import { Link } from 'react-router-dom'

export const AboutMe = () => {
  return (<div className='relative w-full py-24'>
    <div
      className='absolute top-0 left-0 w-full h-full bg-center bg-cover'
      style={{ backgroundImage: "url('img/Trekking2.jpg')" }}
    ></div>
    <div className='absolute top-0 left-0 w-full h-full bg-hitam-0 opacity-60'></div>
    <div className='flex flex-col h-full w-full relative px-5 md:px-8 lg:px-11 xl:px-28 xl:max-w-[100rem] mx-auto'>
      <div className='flex flex-col w-full max-w-2xl mb-3'>
        <h1
          id='about'
          className='mb-3 text-left text-putih-0 font-tomorrow'>Tentang kami</h1>
        <h1 className='mb-3 text-4xl font-medium text-left text-putih-0 font-tomorrow'>Temukan Keajaiban Lombok Bersama Kami: Perjalanan Anda, Kenangan Abadi</h1>
        <p className='text-left text-putih-0 font-secondary sm:max-w-lg md:max-w-xl sm:text-xl lg:text-base drop-shadow-sm'>Kami adalah tim TRVL yang berbasis di Lombok, yang berkomitmen untuk membawa Anda pada petualangan tak terlupakan di pulau yang indah ini. Dengan cinta dan pengetahuan yang mendalam tentang destinasi ini, kami menyediakan layanan travel yang personal dan berkualitas tinggi, memastikan setiap momen perjalanan Anda menjadi berkesan. Dari pantai-pantai yang memikat hingga gunung-gunung yang megah, mari bersama-sama menjelajahi pesona alam dan budaya Lombok. Sambutlah petualangan baru dan kenangan abadi dengan kami!</p>
      </div>
      <div>
        <Link
          to={"/about"}
          onClick={() => window.scrollTo(0, 0)}
          className='text-base italic text-putih-0 font-tomorrow'
        >view more →</Link>
      </div>
    </div>
  </div>
  )
}
