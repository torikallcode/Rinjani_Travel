import React from 'react'
import { CardLayananKami } from '../fragments/Cards/CardLayananKami'
import { Akomodasi } from '../elements/icons/Akomodasi'
import { Transportasi } from '../elements/icons/Transportasi'
import { Paketwisata } from '../elements/icons/Paketwisata'
import { Ansuransi } from '../elements/icons/Ansuransi'

export const LayananKami = () => {

  const items = [{
    icon: <Akomodasi size={40} />,
    title: 'Akomodasi',
    desc: 'Temukan hotel impian Anda di destinasi wisata favorit!'
  }, {
    icon: <Transportasi size={40} />,
    title: 'Transportasi',
    desc: 'Jelajahi destinasi wisata dengan mudah dan nyaman'
  }, {
    icon: <Paketwisata size={40} />,
    title: 'Paket Wisata',
    desc: 'Dapatkan pengalaman wisata yang tak terlupakan'
  }, {
    icon: <Ansuransi size={40} />,
    title: 'Asuransi',
    desc: 'Lindungi diri Anda dan keluarga Anda dengan asuransi'
  }

  ]

  return (
    <div
      className='w-full flex flex-col '>
      <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-5 content-end'>
        <div
          data-aos="fade-up"
          data-aos-once="true"
          className='flex flex-col justify-start sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-xl'>
          <h1 className='text-putih-0 font-tomorrow text-4xl xl:text-5xl mb-12 xl:mb-12'>Layanan Kami</h1>
          <p className='text-putih-0 font-secondary text-base sm:text-xl lg:text-base xl:text-base'>Selamat datang di pusat solusi perjalanan kami! Temukan akomodasi eksklusif, transportasi nyaman, paket wisata tak terlupakan, dan asuransi perjalanan terpercaya untuk petualangan lancar dan tak terlupakan Anda.</p>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 w-full'>
          {items.map((item, index) => (
            <CardLayananKami key={index} icon={item.icon} title={item.title} desc={item.desc} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Akomodasi
// <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M19 2H9c-1.103 0-2 .897-2 2v6H5c-1.103 0-2 .897-2 2v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zM5 12h6v8H5v-8zm14 8h-6v-8c0-1.103-.897-2-2-2H9V4h10v16z"></path><path d="M11 6h2v2h-2zm4 0h2v2h-2zm0 4.031h2V12h-2zM15 14h2v2h-2zm-8 .001h2v2H7z"></path></svg>

// Transportasi
{/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="m20.772 10.156-1.368-4.105A2.995 2.995 0 0 0 16.559 4H7.441a2.995 2.995 0 0 0-2.845 2.051l-1.368 4.105A2.003 2.003 0 0 0 2 12v5c0 .753.423 1.402 1.039 1.743-.013.066-.039.126-.039.195V21a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2h12v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2.062c0-.069-.026-.13-.039-.195A1.993 1.993 0 0 0 22 17v-5c0-.829-.508-1.541-1.228-1.844zM4 17v-5h16l.002 5H4zM7.441 6h9.117c.431 0 .813.274.949.684L18.613 10H5.387l1.105-3.316A1 1 0 0 1 7.441 6z"></path><circle cx="6.5" cy="14.5" r="1.5"></circle><circle cx="17.5" cy="14.5" r="1.5"></circle></svg> */ }

// Paket wisata
{/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M3 20h18a1 1 0 0 0 .864-1.504l-7-12c-.359-.615-1.369-.613-1.729 0L9.866 12.1l-1.02-1.632A.998.998 0 0 0 8 10h-.001a1 1 0 0 0-.847.47l-5 8A1 1 0 0 0 3 20zM14 8.985 19.259 18h-5.704l-2.486-3.987L14 8.985zm-5.999 3.9L11.197 18H4.805l3.196-5.115zM6 8c1.654 0 3-1.346 3-3S7.654 2 6 2 3 3.346 3 5s1.346 3 3 3zm0-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path></svg> */ }

// Ansuransi
// <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M11.63 21.91A.9.9 0 0 0 12 22a1 1 0 0 0 .41-.09C22 17.67 21 7 21 6.9a1 1 0 0 0-.55-.79l-8-4a1 1 0 0 0-.9 0l-8 4A1 1 0 0 0 3 6.9c0 .1-.92 10.77 8.63 15.01zM5 7.63l7-3.51 7 3.51c.05 2-.27 9-7 12.27C5.26 16.63 4.94 9.64 5 7.63z"></path><path d="M11.06 16h2v-3h3.01v-2h-3.01V8h-2v3h-3v2h3v3z"></path></svg>