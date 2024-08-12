import React from "react";
import { CardTour } from "../fragments/Cards/CardTour";

export const RinjaniTour = () => {
  return (
    <section className="w-full flex flex-col">
      <div className="mb-12 xl:mb-12">
        <h1 className="text-putih-0 font-tomorrow text-4xl xl:text-3xl  text-center">Finde Out The Best <br /> Travel Choice in Asia</h1>
        <p className="text-gray-500 text-center">Lorem, ipsum dolor sit amet consectetur adipisicing elit. <br /> Voluptatem, quia corrupti sapiente perspiciatis quibusdam quod sequi facere cumque sint aspernatur!</p>
      </div>
      <div className="flex justify-around items-start lg:grid-cols-3 gap-4">
        <CardTour
          image={"img/trawangan2.png"}
        ></CardTour>
        <CardTour
          image={"img/mandalika.webp"}
        ></CardTour>
        <CardTour
          image={"img/turtle.webp"}
        ></CardTour>
      </div>
    </section>
  )
}