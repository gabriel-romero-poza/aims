import React from 'react';

interface DNIInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DNIInput({ value, onChange }: DNIInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    // Permite números, Backspace, Delete, Flechas y Tab
    if (!/^[0-9]$/.test(key) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Tab') {
      e.preventDefault();
    }
  };

  return (
    <input
      id="dni"
      name="dni"
      type="text"
      maxLength={8}
      inputMode="numeric"
      pattern="[0-9]*"
      required
      className="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 shadow-sm sm:text-sm"
      placeholder="DNI"
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
    />
  );
}
