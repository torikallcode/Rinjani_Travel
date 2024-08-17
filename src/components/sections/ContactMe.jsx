import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram } from '../elements/icons/Instagram'
import { Facebook } from '../elements/icons/Facebook'
import { WhatsApp } from '../elements/icons/WhatsApp'
import { Email } from '../elements/icons/Email'

export const ContactMe = () => {

  const items = [{
    id: 1,
    icon: <Instagram size={32} warna={'#f2f2f2'} />,
    text: "Instagram"
  },
  {
    id: 2,
    icon: <Facebook size={32} warna={'#f2f2f2'} />,
    text: "Facebook"
  },
  {
    id: 3,
    icon: <WhatsApp size={32} warna={'#f2f2f2'} />,
    text: "Whatsapp"
  }, {
    id: 4,
    icon: <Email size={32} warna={'#f2f2f2'} />,
    text: "Email"
  }
  ]

  return (
    <div className='flex flex-col justify-center items-center w-full'>
      <div className="mb-12 xl:mb-12">
        <h1 className="text-putih-0 font-tomorrow text-3xl xl:text-3xl  text-center">Find Out The Best <br /> Travel Choice in Asia</h1>
        <p className="text-gray-500 text-center text-sm md:text-base">Lorem, ipsum dolor sit amet consectetur adipisicing elit.  Voluptatem, <br /> quia corrupti  sapiente perspiciatis quibusdam quod sequi facere cumque sint aspernatur!</p>
      </div>
      <div className='w-full flex flex-col justify-center items-center lg:flex-row lg:max-w-3xl xl:max-w-4xl gap-x-5 xl:gap-x-10 mb-10'>
        <div
          className="w-full overflow-hidden space-y-8 mb-10"
        >
          <form method="POST" action="#" className="space-y-6">
            <div className="relative">
              <input
                placeholder="Name"
                className="peer h-10 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-biru-0"
                required=""
                id="Name"
                name="Name"
                type="Name"
              />
              <label
                className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-biru-0 peer-focus:text-sm"
                for="Name"
              >Name</label
              >
            </div>
            <div className="relative">
              <input
                placeholder="Email"
                className="peer h-10 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-biru-0"
                required=""
                id="Email"
                name="Email"
                type="Email"
              />
              <label
                className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-biru-0 peer-focus:text-sm"
                for="Email"
              >Email</label
              >
            </div>
            <div className="relative">
              <input
                placeholder="pesan"
                className="peer h-10 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-biru-0"
                required=""
                id="pesan"
                name="pesan"
                type="pesan"
              />
              <label
                className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-biru-0 peer-focus:text-sm"
                for="pesan"
              >pesan</label
              >
            </div>
          </form>
          <button className='text-putih-0 font-secondary bg-biru-0 w-full py-2 rounded-lg'>Kirim</button>
        </div>
        <div className='flex flex-col w-full bg-abu-0 p-5 rounded-lg'>
          <h1 className='text-white font-tomorrow text-3xl text-left mb-5'>info</h1>
          <ul className='flex flex-col justify-center w-full gap-3'>
            {items.map((item) => {
              return (
                <li className='flex justify-start gap-x-3 items-center ' key={item.id}>
                  {item.icon}
                  <p className='text-white font-secondary text-sm'>{item.text}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

{/* <div className=''>
        <h1 id='contact' className='text-gray-300 font-tomorrow text-left'>Kontak kami</h1>
        <h1 className='text-white font-tomorrow text-3xl text-left mb-5'>Jangan ragu menghubungi kami untuk informasi lebih lanjut</h1>
        <Link to={"/"} className='mb-16'>
          <button
            className="mb-7 relative px-8 py-2 rounded-xl bg-biru-0 isolation-auto z-10 before:absolute before:w-full before:transition-all before:duration-500 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:-z-10 before:aspect-square before:hover:scale-150 overflow-hidden before:hover:duration-500 text-hitam-0 hover:border-biru-0 font-primary font-semibold text-base sm:text-2xl lg:text-lg xl:text-xl"
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
      </div> */}
{/* <div className='flex items-center justify-center w-full h-full'>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14457.123557722494!2d116.54109658007094!3d-8.656765165859417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dcc4f40a1f4bfcf%3A0xd7eaf20dbfcd8711!2sTaman%20Rinjani%20Selong!5e0!3m2!1sid!2sid!4v1714786329714!5m2!1sid!2sid"
          className='w-full h-96 rounded-lg'
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade">
        </iframe>
      </div> */}

