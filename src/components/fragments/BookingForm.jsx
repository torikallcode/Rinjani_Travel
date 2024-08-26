import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingForm = ({ onClose }) => {
  const [fullName, setFullName] = useState("");
  const [departureDate, setDepartureDate] = useState(new Date());
  const [people, setPeople] = useState(1);
  const [packageType, setPackageType] = useState("");
  const [contact, setContact] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleSend = () => {
    const formattedDate = departureDate.toISOString().split("T")[0];
    const message = `Full Name: ${fullName}\nDeparture Date: ${formattedDate}\nPeople: ${people}\nPackage Type: ${packageType}\nContact: ${contact}\nPickup Location: ${pickupLocation}\nNotes: ${notes}`;
    const whatsappUrl = `https://wa.me/+6281339879335?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    onClose(); // Close the form after sending
  };


  return (
    <div className="bg-[#222831] p-6 rounded-lg shadow-lg w-full sm:max-w-4xl mx-auto max-w-[23rem]">
      <h2 className="text-2xl font-bold text-[#EEEEEE] mb-6">Booking Form</h2>
      <div className="grid grid-cols-2 md:grid-cols-2 gap-x-6 gap-y-3">
        <div className="mb-4">
          <label className="block text-[#EEEEEE] text-sm font-medium">Full Name:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 p-2 w-full bg-[#393E46] text-[#EEEEEE] rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            placeholder="Enter your full name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-[#EEEEEE] text-sm font-medium">Departure Date:</label>
          <DatePicker
            selected={departureDate}
            onChange={(date) => setDepartureDate(date)}
            className="mt-1 p-2 w-full bg-[#393E46] text-[#EEEEEE] rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
          />
        </div>
        <div className="mb-4">
          <label className="block text-[#EEEEEE] text-sm font-medium">Number of People:</label>
          <input
            type="number"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            min="1"
            className="mt-1 p-2 w-full bg-[#393E46] text-[#EEEEEE] rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            placeholder="Enter number of people"
          />
        </div>
        <div className="mb-4">
          <label className="block text-[#EEEEEE] text-sm font-medium">Package Type:</label>
          <select
            value={packageType}
            onChange={(e) => setPackageType(e.target.value)}
            className="mt-1 p-2 w-full bg-[#393E46] text-[#EEEEEE] rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
          >
            <option value="" disabled>Select Package</option>
            <option value="Trekking">Trekking</option>
            <option value="Tour">Tour</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-[#EEEEEE] text-sm font-medium">Contact (Phone/Email):</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="mt-1 p-2 w-full bg-[#393E46] text-[#EEEEEE] rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            placeholder="Enter contact info"
          />
        </div>
        <div className="mb-4">
          <label className="block text-[#EEEEEE] text-sm font-medium">Pickup Location:</label>
          <input
            type="text"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            className="mt-1 p-2 w-full bg-[#393E46] text-[#EEEEEE] rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            placeholder="Enter pickup location"
          />
        </div>
        <div className="col-span-2 mb-4">
          <label className="block text-[#EEEEEE] text-sm font-medium">Additional Notes:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 p-2 w-full bg-[#393E46] text-[#EEEEEE] rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            placeholder="Enter additional notes"
          />
        </div>
      </div>
      <div className="flex justify-between mt-6 gap-x-10">
        <button
          onClick={handleSend}
          className="bg-[#00ADB5] text-[#EEEEEE] py-2 px-10 rounded-lg hover:bg-[#007a7a] transition-colors duration-300 w-full"
        >
          Send
        </button>
        <button
          onClick={onClose}
          className="bg-[#393E46] text-[#EEEEEE] py-2 px-10 rounded-lg hover:bg-[#4a545e] transition-colors duration-300 w-full"
        >
          Close
        </button>
      </div>
    </div>



  );
};

export default BookingForm;
