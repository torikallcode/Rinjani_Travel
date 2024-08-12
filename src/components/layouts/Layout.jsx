import React, { useRef } from 'react'
import { HomePage } from '../sections/HomePage'
import { Statistik } from '../sections/Statistik'
import { NavbarDsy } from '../ui/NavbarDsy'
import { MostPopular } from '../sections/MostPopular'
import { LayananKami } from '../sections/LayananKami'
import { AboutMe } from '../sections/AboutMe'
import { ContactMe } from '../sections/ContactMe'
import { Footer } from '../sections/Footer'
import { RinjaniTrackigPackage } from '../sections/RinjaniTrackigPackage'
import { RinjaniTour } from '../sections/RinjaniTour'
import Category from '../sections/CategoryContainer'

export const Layout = () => {

  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  return (
    <div>
      <NavbarDsy className={`z-50 fixed`} />
      <HomePage />
      <section className='w-full px-5 md:px-11 xl:px-20 py-28 xl:max-w-[100rem] mx-auto'>
        <Statistik className={`w-full mb-32`} />
        <section className='w-full mb-20'>
          <MostPopular></MostPopular>
        </section>
        <section className='w-full py-14'>
          {/* <RinjaniTour></RinjaniTour> */}
          <Category></Category>
        </section>
        {/* <section className='w-full py-14'>
          <RinjaniTrackigPackage></RinjaniTrackigPackage>
        </section> */}
        <section className='w-full lg:py-14'>
          <LayananKami></LayananKami>
        </section>
      </section>
      <section className='w-full' ref={contactRef}>
        <AboutMe></AboutMe>
      </section>
      <section className='w-full px-5 md:px-11 xl:px-20 py-24 lg:py-32 xl:max-w-[100rem] mx-auto'>
        <ContactMe></ContactMe>
      </section>
      <Footer></Footer>
    </div >
  )
}
