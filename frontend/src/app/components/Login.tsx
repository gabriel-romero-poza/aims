"use client";

import { useState } from "react";
import DNIInput from "./DNIInput";
import PasswordInput from "./PasswordInput";
import { CheckBox } from "./CheckBox";
import { Button } from "./Button";

export const Login = () => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(`http://localhost:3000/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dni,
          password,
        }),
      });

      if (!response.ok) {
        // Muestra el error que viene del servidor, si está disponible
        const errorData = await response.json();
        const error = errorData?.message || "Error al iniciar sesión";
        throw new Error(error);
      }

      const data = await response.json();

      const token = data.accessToken;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      } else {
        console.warn("LocalStorage no está disponible en este entorno.");
      }

      console.log("Inicio de sesión exitoso, token:", token);
    } catch (error: any) {
      setErrorMessage(error.message || "Ocurrió un error inesperado.");
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-center text-gray-100">
        Iniciar Sesión
      </h2>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <DNIInput value={dni} onChange={(e) => setDni(e.target.value)} />
          </div>

          <div className="mt-4">
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <CheckBox text="Recordar mi sesión" />
          </div>

          <div>
            <Button text="Iniciar Sesión" />
          </div>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-center mt-4">{errorMessage}</p>
        )}
      </form>
    </div>
  );
};

export default Login;
