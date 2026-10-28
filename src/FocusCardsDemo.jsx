import { FocusCards } from "@/components/ui/focus-cards";

export function FocusCardsDemo() {
  const cards = [
    {
      title: "Forest Adventure",
      src: "/img/mnt.jpg",
    },
    {
      title: "Valley of life",
      src: "/img/mnt2.jpg"
    },
    {
      title: "Sala behta hi jayega",
      src: "/img/mnt3.jpg"
    },
    {
      title: "Camping is for pros",
      src: "/img/mnt4.jpg"
    },
    {
      title: "The road not taken",
      src: "/img/mnt5.jpg"
    },
    {
      title: "The First Rule",
      src: "/img/mnt6.jpg"
    },
    {
      title: "Sala behta hi jayega",
      src: "/img/mnt7.jpg"
    },
    {
      title: "Camping is for pros",
      src: "/img/mnt8.jpg"
    },
    {
      title: "The road not taken",
      src: "/img/mnt9.jpg"
    },
    {
      title: "The First Rule",
      src: "/img/mnt10.jpg"
    },
  ];

  return <FocusCards cards={cards} />;
}
