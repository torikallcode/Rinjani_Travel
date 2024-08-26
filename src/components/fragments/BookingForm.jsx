import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingForm = ({ onClose }) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [people, setPeople] = useState(1);

  const handleSend = () => {
    const formattedDate = date.toISOString().split("T")[0];
    const message = `Name: ${name}\nDate: ${formattedDate}\nPeople: ${people}`;
    const whatsappUrl = `https://wa.me/+6281339879335?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    onClose(); // Close the form after sending
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-96 mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Booking Form</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 p-2 w-full border border-gray-300 rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Date:</label>
        <DatePicker
          selected={date}
          onChange={(date) => setDate(date)}
          className="mt-1 p-2 w-full border border-gray-300 rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Number of People:</label>
        <input
          type="number"
          value={people}
          onChange={(e) => setPeople(e.target.value)}
          min="1"
          className="mt-1 p-2 w-full border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex justify-between">
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
        <button
          onClick={onClose}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BookingForm;
