import React from "react";
import { CardTour } from "../fragments/Cards/CardTour";

export const RinjaniTour = () => {
  return (
    <section className="w-full flex flex-col">
      <h1 className="text-putih-0 font-tomorrow text-4xl xl:text-4xl mb-12 xl:mb-12">Rinjani Tour</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-4">
        <CardTour
          image={"img/trawangan2.png"}
          className={`lg:row-span-2 lg:h-full`}></CardTour>
        <CardTour
          image={"img/mandalika.webp"}
          className={`lg:h-52`}></CardTour>
        <CardTour
          image={"img/turtle.webp"}
          className={`lg:h-52`}></CardTour>
      </div>
    </section>
  )
}