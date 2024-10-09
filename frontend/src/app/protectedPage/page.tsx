// pages/pagina-siguiente.js
import axios from "../../utils/axios";
import cookies from "next-cookies";

export default function PaginaSiguiente({ user }: any) {
  return (
    <div>
      <h1>Bienvenido, {user.username}</h1>
      {/* Contenido adicional de la página */}
      <a href="/logout">Cerrar Sesión</a>
    </div>
  );
}

export async function getServerSideProps(ctx: any) {
  const { token } = cookies(ctx);

  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

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
      return {
        props: { user: res.data },
      };
    }
  } catch (error) {
    // Token inválido o expirado
  }

  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
}
