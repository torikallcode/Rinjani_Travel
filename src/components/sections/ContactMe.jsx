import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram } from '../elements/icons/Instagram'
import { Facebook } from '../elements/icons/Facebook'
import { WhatsApp } from '../elements/icons/WhatsApp'
import { Email } from '../elements/icons/Email'

export const ContactMe = () => {

  const items = [{
    id: 1,
    icon: <Instagram size={24} warna={'#f2f2f2'} />,
    text: "Instagram",
    isi: "_Growrinjani"
  },
  {
    id: 2,
    icon: <Facebook size={24} warna={'#f2f2f2'} />,
    text: "Facebook",
    isi: "Growrinjani"
  },
  {
    id: 3,
    icon: <WhatsApp size={24} warna={'#f2f2f2'} />,
    text: "Whatsapp",
    isi: "+62 812 345 6789"
  }, {
    id: 4,
    icon: <Email size={24} warna={'#f2f2f2'} />,
    text: "Email",
    isi: "Growrinjani@gmail.com"
  }
  ]

  return (
    <div className='flex flex-col justify-center items-center w-full'>
      {/* <div className="mb-12 xl:mb-12">
        <h1 className="text-putih-0 font-tomorrow text-3xl xl:text-3xl  text-center">Find Out The Best <br /> Travel Choice in Asia</h1>
        <p className="text-gray-500 text-center text-sm md:text-base">Lorem, ipsum dolor sit amet consectetur adipisicing elit.  Voluptatem, <br /> quia corrupti  sapiente perspiciatis quibusdam quod sequi facere cumque sint aspernatur!</p>
      </div> */}
      <div className='w-full flex flex-col justify-center items-center lg:max-w-3xl xl:max-w-4xl gap-x-5 xl:gap-x-10 mb-10'>
        <div
          className="w-full overflow-hidden space-y-8 mb-10"
        >
          <form method="POST" action="#" className="py-10 space-y-10">
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
        <div class="flex justify-around items-center py-9 lg:py-11 lg:mx-11 w-full ">
          <a href="https://www.linkedin.com/in/m-torikal-akbar-23859a29b">
            <svg fill="#eeeeee" className='cursor-pointer hover:scale-125 transition-transform ease-out' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m20.487 17.14-4.065-3.696a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a.997.997 0 0 0-.085-1.39z"></path></svg>
          </a>
          <a href="https://github.com/torikallcode">
            <svg fill="#eeeeee" className='cursor-pointer hover:scale-125 transition-transform ease-out' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.198 4.488L3 21.116l4.759-1.249a8.981 8.981 0 0 0 4.29 1.093h.004c4.947 0 8.975-4.027 8.977-8.977a8.926 8.926 0 0 0-2.627-6.35m-6.35 13.812h-.003a7.446 7.446 0 0 1-3.798-1.041l-.272-.162-2.824.741.753-2.753-.177-.282a7.448 7.448 0 0 1-1.141-3.971c.002-4.114 3.349-7.461 7.465-7.461a7.413 7.413 0 0 1 5.275 2.188 7.42 7.42 0 0 1 2.183 5.279c-.002 4.114-3.349 7.462-7.461 7.462m4.093-5.589c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112s-.58.729-.711.879-.262.168-.486.056-.947-.349-1.804-1.113c-.667-.595-1.117-1.329-1.248-1.554s-.014-.346.099-.458c.101-.1.224-.262.336-.393.112-.131.149-.224.224-.374s.038-.281-.019-.393c-.056-.113-.505-1.217-.692-1.666-.181-.435-.366-.377-.504-.383a9.65 9.65 0 0 0-.429-.008.826.826 0 0 0-.599.28c-.206.225-.785.767-.785 1.871s.804 2.171.916 2.321c.112.15 1.582 2.415 3.832 3.387.536.231.954.369 1.279.473.537.171 1.026.146 1.413.089.431-.064 1.327-.542 1.514-1.066.187-.524.187-.973.131-1.067-.056-.094-.207-.151-.43-.263"></path></svg>
          </a>
          <a href="https://www.instagram.com/torikallcode/?hl=id">
            <svg fill="#eeeeee" className='cursor-pointer hover:scale-125 transition-transform ease-out' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm0 2v.511l-8 6.223-8-6.222V6h16zM4 18V9.044l7.386 5.745a.994.994 0 0 0 1.228 0L20 9.044 20.002 18H4z"></path></svg>
          </a>
          <a href="https://www.facebook.com/profile.php/?id=100016778295782&name=xhp_nt__fb__action__open_user">
            <Instagram warna={'#eeeeee'} className={`w-6 h-6 cursor-pointer hover:scale-125 transition-transform ease-out`}></Instagram>
          </a>
        </div>
      </div>
    </div >
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

