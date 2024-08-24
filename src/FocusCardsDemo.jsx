import { FocusCards } from "@/components/ui/focus-cards";

export function FocusCardsDemo() {
  const cards = [
    {
      title: "Forest Adventure",
      src: "/img/homepage2.jpg",
    },
    {
      title: "Valley of life",
      src: "/img/homepage3.jpg"
    },
    {
      title: "Sala behta hi jayega",
      src: "/img/homePage.jpg"
    },
    {
      title: "Camping is for pros",
      src: "/img/mandalika.webp"
    },
    {
      title: "The road not taken",
      src: "/img/layanan.jpg"
    },
    {
      title: "The First Rule",
      src: "/img/Rinjani.jpg"
    },
    {
      title: "Sala behta hi jayega",
      src: "/img/pinkbeach.jpg"
    },
    {
      title: "Camping is for pros",
      src: "/img/Rinjani.jpg"
    },
    {
      title: "The road not taken",
      src: "/img/DesaSade.jpg"
    },
    {
      title: "The First Rule",
      src: "/img/trawangan2.png"
    },
  ];

  console.log(cards); // Debugging: Log the cards array

  return <FocusCards cards={cards} />;
}
