import React, { useState, memo } from "react";
import { cn } from "../../lib/utils";

export const Card = memo(({ card, index, hovered, setHovered }) => (
  <div

    onMouseEnter={() => setHovered(index)}
    onMouseLeave={() => setHovered(null)}
    className={cn(
      "rounded-lg relative bg-transparent dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out",
      hovered !== null && hovered !== index && "blur-sm scale-[0.98]",
      (index === 0 || index === 6) && "md:col-span-2" // Apply col-span-2 to the first and seventh cards
    )}
  >
    <img
      src={card.src}
      alt={card.title}
      className="object-cover absolute inset-0 opacity-70"
      style={{ width: "100%", height: "100%" }}
    />
    <div
      className={cn(
        "absolute inset-0 bg-black/50 flex items-end py-8 px-4 transition-opacity duration-300",
        hovered === index ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="text-xl md:text-2xl font-tomorrow font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
        {card.title}
      </div>
    </div>
  </div>
));

Card.displayName = "Card";

export function FocusCards({ cards = [] }) {
  console.log('Cards Prop:', cards); // Debugging: Log props cards

  const [hovered, setHovered] = useState(null);

  if (!cards.length) {
    return <div>No cards available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-[100rem] mx-auto md:px-8 w-full cursor-pointer">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
