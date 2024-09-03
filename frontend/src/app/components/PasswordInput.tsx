import React from "react";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PasswordInput({ value, onChange }: PasswordInputProps) {
  return (
    <input
      type="password" 
      id="password"
      name="password"
      required
      className="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
      placeholder="Password"
      value={value}
      onChange={onChange}
    />
  );
}
