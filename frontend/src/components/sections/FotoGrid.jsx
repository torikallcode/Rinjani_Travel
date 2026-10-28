import React, { useState } from 'react';

// const photos = [
//   { id: 1, src: 'https://via.placeholder.com/300', alt: 'Photo 1', text: 'Text for Photo 1' },
//   { id: 2, src: 'https://via.placeholder.com/300', alt: 'Photo 2', text: 'Text for Photo 2' },
//   { id: 3, src: 'https://via.placeholder.com/300', alt: 'Photo 3', text: 'Text for Photo 3' },
//   { id: 4, src: 'https://via.placeholder.com/300', alt: 'Photo 4', text: 'Text for Photo 4' },
// ];

const cards = [
  {
    id: 1,
    text: "Forest Adventure",
    src: "/img/mnt.jpg",
  },
  {
    id: 2,
    text: "Valley of life",
    src: "/img/mnt2.jpg"
  },
  {
    id: 3,
    text: "Sala behta hi jayega",
    src: "/img/mnt3.jpg"
  },
  {
    id: 4,
    text: "Camping is for pros",
    src: "/img/mnt4.jpg"
  },
  {
    id: 5,
    text: "The road not taken",
    src: "/img/mnt5.jpg"
  },
  {
    id: 6,
    text: "The First Rule",
    src: "/img/mnt6.jpg"
  },
  {
    id: 7,
    text: "Sala behta hi jayega",
    src: "/img/mnt7.jpg"
  },
  {
    id: 8,
    text: "Camping is for pros",
    src: "/img/mnt8.jpg"
  },
  {
    id: 9,
    text: "The road not taken",
    src: "/img/mnt9.jpg"
  },
  {
    id: 10,
    text: "The First Rule",
    src: "/img/mnt10.jpg"
  },
];

export default function FotoGrid() {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((photo) => (
        <div
          key={photo.id}
          className={`relative overflow-hidden ${hoveredId && hoveredId !== photo.id ? 'blur-sm' : ''
            } ${photo.colspan ? 'col-span-2' : ''}`}
          onMouseEnter={() => setHoveredId(photo.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <img
            src={photo.src}
            className="object-cover w-full h-full transition-transform duration-500 ease-in-out transform hover:scale-110"
          />
          {/* Text overlay on hover */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xl opacity-0 hover:opacity-100 transition-opacity duration-500 ease-in-out`}
          >
            {photo.text}
          </div>
        </div>
      ))}
    </div>
  );
}
