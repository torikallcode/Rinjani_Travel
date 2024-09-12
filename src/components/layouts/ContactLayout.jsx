import React from 'react'
import { NavbarDsy } from '../ui/NavbarDsy'
import { Footer, Navbar } from 'flowbite-react'
import { FooterDsy } from '../ui/FooterDsy'
import { ContactMe } from '../sections/ContactMe'

export const ContactLayout = () => {
  return (
    <>
      <NavbarDsy className={'fixed z-[99999]'}></NavbarDsy>
      <section className="bg-fixed relative h-[70dvh] bg-center bg-cover bg-no-repeat gradient-mask-b-70" style={{ backgroundImage: "url('img/aboutme1.jpg')" }}>
        <span className='absolute top-0 left-0 z-10 w-full h-full opacity-50 bg-hitam-0'></span>
        <div className='flex flex-col items-center justify-center w-full h-full px-5 md:px-11 xl:px-20 xl:max-w-[100rem] mx-auto z-20 relative'>
          <h1 className="text-3xl font-semibold text-putih-0 font-tomorrow xl:text-3xl text-start">Kontak kami</h1>
          <p className="max-w-3xl text-sm text-center text-gray-200 font-secondary xl:text-base">Jangan ragu untuk menghubungi kami dengan pertanyaan, saran, atau untuk merencanakan perjalanan Anda berikutnya. Kami siap membantu Anda merencanakan petualangan yang sempurna.</p>
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