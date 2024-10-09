// src/app/login/layout.tsx
import cookies from "next-cookies";
import axios from "../../utils/axios";
import { Login } from "../../_components/Login/Login";
import { redirect } from "next/navigation";

const LoginLayout = async ({ children, params }: any) => {
  const { token } = cookies({
    req: { headers: { cookie: params.cookie || "" } },
  });

  if (token) {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/protected-route`,
        {
          headers: {
            Cookie: `token=${token}`,
          },
        }
      );

      if (res.status === 200) {
        // Redirige a la página siguiente si el token es válido
        redirect("/protectedPage");
      }
    } catch (error) {
      console.error("Error al verificar el token:", error);
      // Puedes manejar el error aquí si es necesario
    }
  }

  // Renderiza el contenido del login si no hay token
  return <>{children}</>;
};

export default LoginLayout;
