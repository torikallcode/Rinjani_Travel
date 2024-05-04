import React from 'react'
import { Link } from 'react-router-dom'
import { Transportasi } from '../elements/icons/Transportasi'

export const ContactMe = () => {
  return (
    <div className='flex justify-bertween gap-10'>
      <div className=''>
        <h1 className='text-gray-300 font-tomorrow text-left'>Kontak kami</h1>
        <h1 className='text-white font-tomorrow text-3xl text-left mb-5'>Jangan ragu untuk menghubungi kami untuk informasi lebih lanjut</h1>
        <div className='grid grid-cols-2 gap-5 bg-yellow-400'>
          <Transportasi size={20} />
          <Transportasi size={20} />
          <Transportasi size={20} />
          <Transportasi size={20} />
        </div>
        <Link to={"/"} className='mb-16'>
          <button
            className="relative px-8 py-2 rounded-xl bg-transparent isolation-auto z-10 border-2 border-white before:absolute before:w-full before:transition-all before:duration-500 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-biru-0 before:-z-10 before:aspect-square before:hover:scale-150 overflow-hidden before:hover:duration-500 text-white hover:text-white-0 hover:border-biru-0 font-primary font-medium text-base sm:text-2xl lg:text-lg xl:text-xl"
          >
            Kirim Pesanmu →
          </button>
        </Link>
      </div>
      <div className=''>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14457.123557722494!2d116.54109658007094!3d-8.656765165859417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dcc4f40a1f4bfcf%3A0xd7eaf20dbfcd8711!2sTaman%20Rinjani%20Selong!5e0!3m2!1sid!2sid!4v1714786329714!5m2!1sid!2sid" className='w-[600px] h-[250px]' allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </div>
  )
}
