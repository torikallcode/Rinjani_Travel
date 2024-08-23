import { FocusCards } from "@/components/ui/focus-cards";

export function FocusCardsDemo() {
  const cards = [
    {
      title: "Forest Adventure",
      src: "/img/aboutme.jpg",
    },
    {
      title: "Valley of life",
      src: "/img/homepage2.jpg"
    },
    {
      title: "Sala behta hi jayega",
      src: "/img/homepage3.jpg"
    },
    {
      title: "Camping is for pros",
      src: "/img/homePage.jpg"
    },
    {
      title: "The road not taken",
      src: "/img/mandalika.webp"
    },
    {
      title: "The First Rule",
      src: "/img/Rinjani.jpg"
    },
    {
      title: "Sala behta hi jayega",
      src: "/img/homepage3.jpg"
    },
    {
      title: "Camping is for pros",
      src: "/img/homePage.jpg"
    },
    {
      title: "The road not taken",
      src: "/img/mandalika.webp"
    },
    {
      title: "The First Rule",
      src: "/img/Rinjani.jpg"
    },
  ];

  console.log(cards); // Debugging: Log the cards array

  return <FocusCards cards={cards} />;
}
