import React from 'react'
import { CardGalery } from '../fragments/Cards/CardGalery'
import { Navbar } from '../sections/Navbar'

export const GaleryLayout = () => {
  return (
    <div>
      <Navbar></Navbar>
      <h1 className='text-white font-tomorrow text-4xl xl:text-5xl mb-12 xl:mb-12'>Galery</h1>
      <CardGalery>

      </CardGalery>
    </div>
  )
}
