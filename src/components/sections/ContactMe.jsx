import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram } from '../elements/icons/Instagram'
import { Facebook } from '../elements/icons/Facebook'
import { WhatsApp } from '../elements/icons/WhatsApp'
import { Email } from '../elements/icons/Email'

export const ContactMe = () => {

  const items = [{
    id: 1,
    icon: <Instagram size={24} warna={'#ffffff'} />,
  },
  {
    id: 2,
    icon: <Facebook size={24} warna={'#ffffff'} />,
  },
  {
    id: 3,
    icon: <WhatsApp size={24} warna={'#ffffff'} />,
  }, {
    id: 4,
    icon: <Email size={24} warna={'#ffffff'} />,
  }

  ]

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
      <div className=''>
        <h1 id='contact' className='text-gray-300 font-tomorrow text-left'>Kontak kami</h1>
        <h1 className='text-white font-tomorrow text-3xl text-left mb-5'>Jangan ragu menghubungi kami untuk informasi lebih lanjut</h1>
        <Link to={"/"} className='mb-16'>
          <button
            className="mb-7 relative px-8 py-2 rounded-xl bg-transparent isolation-auto z-10 border-2 border-white before:absolute before:w-full before:transition-all before:duration-500 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-biru-0 before:-z-10 before:aspect-square before:hover:scale-150 overflow-hidden before:hover:duration-500 text-white hover:border-biru-0 font-primary font-medium text-base sm:text-2xl lg:text-lg xl:text-xl"
          >
            Kirim Pesanmu →
          </button>
        </Link>
        <div className='grid grid-cols-4 gap-3 sm:max-w-md'>
          {items.map((item) => {
            return (
              <Link to={"/"} key={item.id} className='aspect-[4/2] flex justify-center items-center p-3 rounded-lg bg-white bg-opacity-5 backdrop-filter backdrop-blur-lg hover:-translate-y-1 transition-all ease-in-out'>
                {item.icon}
              </Link>
            )
          })
          }
        </div>
      </div>
      <div className='flex items-end justify-center'>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14457.123557722494!2d116.54109658007094!3d-8.656765165859417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dcc4f40a1f4bfcf%3A0xd7eaf20dbfcd8711!2sTaman%20Rinjani%20Selong!5e0!3m2!1sid!2sid!4v1714786329714!5m2!1sid!2sid"
          className='w-full h-[250px]'
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </div>
  )
}



