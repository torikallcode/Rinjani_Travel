import React, { useRef } from 'react'
import { HomePage } from '../sections/HomePage'
import { Statistik } from '../sections/Statistik'
import { NavbarDsy } from '../ui/NavbarDsy'
import { MostPopular } from '../sections/MostPopular'
import { LayananKami } from '../sections/LayananKami'
import { AboutMe } from '../sections/AboutMe'
import { ContactMe } from '../sections/ContactMe'
import { Footer } from '../sections/Footer'

export const Layout = () => {

  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  return (
    <div>
      <NavbarDsy className={`z-50 fixed`} />
      <HomePage />
      <section className='w-full px-5 md:px-11 xl:px-28 py-28 xl:max-w-[100rem] mx-auto'>
        <Statistik className={`w-full mb-32`} />
        <section id='home' className='w-full mb-32'>
          <MostPopular></MostPopular>
        </section>
        <section className='w-full'>
          <LayananKami></LayananKami>
        </section>
      </section>
      <section className='w-full' ref={contactRef} id="contact">
        <AboutMe></AboutMe>
      </section>
      <section className='w-full px-5 md:px-11 xl:px-28  py-20 xl:max-w-[100rem] mx-auto'>
        <ContactMe></ContactMe>
      </section>
      <Footer></Footer>
    </div>
  )
}
