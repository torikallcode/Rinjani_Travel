import React, { useRef } from 'react'
import { HomePage } from '../sections/HomePage'
import { Statistik } from '../sections/Statistik'
import { NavbarDsy } from '../ui/NavbarDsy'
import { MostPopular } from '../sections/MostPopular'
import { LayananKami } from '../sections/LayananKami'
import { AboutMe } from '../sections/AboutMe'
import Category from '../sections/CategoryContainer'
import { FooterDsy } from '../ui/FooterDsy'

export const Layout = () => {

  const contactRef = useRef(null);

  return (
    <div>
      <NavbarDsy
        className={`z-50 fixed`} />
      <HomePage />
      <section
        className='w-full px-5 md:px-11 xl:px-20 py-28 xl:max-w-[100rem] mx-auto'>
        <Statistik
          className={`w-full mb-32`} />
        <MostPopular
          classname={`mb-16`}
        />
        <Category
          classname={`py-14`}
        />
        <LayananKami
          classname={`lg:py-24`}
        />
      </section>
      <section
        className='w-full'
        ref={contactRef}>
        <AboutMe></AboutMe>
      </section>
      <FooterDsy></FooterDsy>
    </div >
  )
}
