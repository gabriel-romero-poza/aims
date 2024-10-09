import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // URL del backend
  withCredentials: true, // Permite el envío de cookies
});

export default instance;
