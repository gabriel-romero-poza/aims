"use client";

// pages/logout.js
import { useEffect } from "react";
import axios from "../../utils/axios";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await axios.post("/auth/logout");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      } finally {
        router.push("/login");
      }
    };

    performLogout();
  }, [router]);

  return <p>Cerrando sesión...</p>;
}
