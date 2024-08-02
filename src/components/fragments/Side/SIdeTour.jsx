import React from "react";
import { DataTracking } from "@/data/DataTracking";


export const SideTour = () => {

  const limitedData = DataTracking.slice(0, 5)

  return (
    <div className="w-full rounded-md">
      <header className="w-full bg-biru-0 h-full">
        <h1 className="text-white font-tomorrow text-lg py-3 px-3 text-start">Rinjani Tour</h1>
      </header>
      <div className="w-full">
        <ul className="text-gray-300 font-secondary text-sm">
          {limitedData.map((item, index) => (
            <li key={index} className="text-gray-300 font-secondary text-sm py-2 flex items-center gap-x-3 border-b border-gray-600"> <span className="text-2xl">»</span> {item.title}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
