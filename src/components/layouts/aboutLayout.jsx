import React from 'react'
import { NavbarDsy } from '../ui/NavbarDsy'
import { Footer, Navbar } from 'flowbite-react'
import { FooterDsy } from '../ui/FooterDsy'
import { ContactMe } from '../sections/ContactMe'

export const AboutLayout = () => {
  return (
    <>
      <NavbarDsy className={'fixed z-[99999]'}></NavbarDsy>
      <section className="relative h-[50dvh] bg-center bg-cover bg-no-repeat gradient-mask-b-70" style={{ backgroundImage: "url('img/aboutme1.jpg')" }}>
        <span className='w-full h-full bg-hitam-0 absolute top-0 left-0 opacity-50 z-10'></span>
        <div className='flex flex-col items-center justify-center w-full h-full px-5 md:px-11 xl:px-20 xl:max-w-[100rem] mx-auto z-20 relative'>
          <h1 className="text-putih-0 font-tomorrow text-3xl xl:text-3xl font-semibold text-start">Kontak kami</h1>
          <p className="text-gray-200 font-secondary text-center text-sm xl:text-base max-w-3xl">Jangan ragu untuk menghubungi kami dengan pertanyaan, saran, atau untuk merencanakan perjalanan Anda berikutnya. Kami siap membantu Anda merencanakan petualangan yang sempurna.</p>
        </div>
      </section>
      <div className="bg-hitam-0 py-32 w-full px-8 md:px-11 xl:px-20 xl:max-w-[100rem] mx-auto">
        <ContactMe></ContactMe>
      </div>
      <div className='flex items-center justify-center w-full h-full '>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14457.123557722494!2d116.54109658007094!3d-8.656765165859417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dcc4f40a1f4bfcf%3A0xd7eaf20dbfcd8711!2sTaman%20Rinjani%20Selong!5e0!3m2!1sid!2sid!4v1714786329714!5m2!1sid!2sid"
          className='w-full h-72'
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
      <FooterDsy></FooterDsy>
    </>
  )
}