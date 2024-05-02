import React from 'react'
import { Link } from 'react-router-dom'
import { Transportasi } from '../elements/icons/Transportasi'

export const ContactMe = () => {
  return (
    <div className='flex flex-col'>
      <h1 className='text-gray-300 font-tomorrow text-left'>Kontak kami</h1>
      <h1 className='text-white font-tomorrow text-3xl text-left mb-5'>Jangan ragu untuk menghubungi kami untuk informasi lebih lanjut</h1>
      <Link to={"/"} className='mb-16'>
        <button
          className="relative px-8 py-2 rounded-xl bg-transparent isolation-auto z-10 border-2 border-white before:absolute before:w-full before:transition-all before:duration-500 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-biru-0 before:-z-10 before:aspect-square before:hover:scale-150 overflow-hidden before:hover:duration-500 text-white hover:text-white-0 hover:border-biru-0 font-primary font-medium hover:font-semibold text-base sm:text-2xl lg:text-lg xl:text-xl"
        >
          Kirim Pesanmu →
        </button>
      </Link>
      <div className='flex justify-around items-center border-y border-white py-5'>
        <Transportasi size={20} />
        <Transportasi size={20} />
        <Transportasi size={20} />
        <Transportasi size={20} />
      </div>
    </div>
  )
}
