import React from "react";

export const SideSupport = () => {
  return (
    <div className="w-full rounded-md">
      <header className="w-full bg-biru-0 h-full">
        <h1 className="text-white font-tomorrow text-lg py-3 px-3 text-start">Support</h1>
      </header>
      <div className="w-full">
        <ul className="text-gray-300 font-secondary text-sm">
          <li className="py-4 px-3 border-b border-gray-500 flex justify-start">
            <p className="w-1/4">Phone</p>
            <p className="mx-4">:</p>
            <p>+6281770570669</p>
          </li>
          <li className="py-4 px-3 border-b border-gray-500 flex justify-start">
            <p className="w-1/4">Mobile</p>
            <p className="mx-4">:</p>
            <p>+6281770570669</p>
          </li>
          <li className="py-4 px-3 border-b border-gray-500 flex justify-start">
            <p className="w-1/4">WhatsApp</p>
            <p className="mx-4">:</p>
            <p>+6281770570669</p>
          </li>
          <li className="py-4 px-3 border-b border-gray-500 text-center">Growrinjani@gmail.com</li>
          <li className="py-3 px-3 border-b border-gray-500 text-center">Jl.Pariwisata, Karang Bajo, Bayan, Kabupaten Lombok Utara, Nusa Tenggara Barat, 83354. Indonesia</li>
        </ul>
      </div>
    </div>
  )
}