// pages/login.tsx

"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const Login = () => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login", // Cambia esta URL según tu configuración
        { dni, password },
        {
          withCredentials: true, // Importante para enviar y recibir cookies
        }
      );

      if (response.status === 200) {
        // Redirigir al usuario a la página deseada después del login
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err.response) {
        // El servidor respondió con un status fuera del rango 2xx
        setError(err.response.data.message || "Error en el inicio de sesión");
      } else if (err.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        setError("No se recibió respuesta del servidor");
      } else {
        // Algo sucedió al configurar la solicitud
        setError("Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 shadow-lg rounded-xl">
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-100">
          Iniciar Sesión
        </h2>

        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

        <div className="space-y-4 ">
          <label htmlFor="dni" className="block  text-gray-700">
            DNI
          </label>
          <input
            type="text"
            id="dni"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded text-black"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded text-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {loading ? "Iniciando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
};

export default Login;
