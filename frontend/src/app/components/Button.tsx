import React from "react";

export const Button = ({ text }: { text: string }) => {
  return (
    <button
      type="submit"
      className="relative flex justify-center w-full px-4 py-2 text-sm font-medium 
                 text-gray-100 bg-gray-700 border border-transparent rounded-md 
                 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 
                 focus:ring-gray-500"
    >
      {text}
    </button>
  );
};
