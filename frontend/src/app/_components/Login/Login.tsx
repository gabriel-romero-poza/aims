"use client";

import { useState } from "react";
import axios from "axios";
import DNIInput from "./DNIInput";
import PasswordInput from "./PasswordInput";
import { CheckBox } from "./CheckBox";
import { Button } from "./Button";

interface FormState {
  dni: string;
  password: string;
}

export const Login = () => {
  const [form, setForm] = useState<FormState>({ dni: "", password: "" });
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const setError = (message: string) => {
    setErrorMessage(message);
  };

  const validateForm = (): boolean => {
    if (!form.dni || !form.password) {
      setError("Por favor, complete todos los campos.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          dni: form.dni,
          password: form.password,
        }
      );

      const contentType = response.headers["content-type"];
      if (!contentType?.includes("application/json")) {
        throw new Error("Unexpected response format. Please try again.");
      }

      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData?.message || "Error al iniciar sesión");
      }

      console.log("Inicio de sesión exitoso.");
      // TODO: redirigir al usuario o realizar otras acciones tras un inicio de sesión exitoso
    } catch (error: any) {
      setError(
        error instanceof SyntaxError
          ? "Error al procesar la respuesta del servidor."
          : error.message || "Ocurrió un error inesperado."
      );
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-center text-gray-100">
        Iniciar Sesión
      </h2>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <DNIInput value={form.dni} onChange={handleChange} />
          <PasswordInput value={form.password} onChange={handleChange} />
          <CheckBox text="Recordar mi sesión" />
          <Button text="Iniciar Sesión" />
        </div>
        {errorMessage && (
          <p className="text-red-500 text-center mt-4">{errorMessage}</p>
        )}
      </form>
    </div>
  );
};

export default Login;
