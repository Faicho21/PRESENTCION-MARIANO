import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import AdminDashboard from "../components/home/AdminDashboard";
import AlumnoDashboard from "../components/home/AlumnoDashboard";

const Home = () => {
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setTipoUsuario(payload.type?.toLowerCase() || null);
      } catch (error) {
        console.error("Error al leer token:", error);
        setTipoUsuario(null);
      }
    }
    setTimeout(() => setLoading(false), 500); // simulación ligera de carga
  }, []);

  if (loading) return <SkeletonLoader />;

  return (
    <motion.div
      className="container py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {tipoUsuario === "admin" && <AdminDashboard />}
      {tipoUsuario === "alumno" && <AlumnoDashboard />}
      {!tipoUsuario && (
        <div className="alert alert-warning text-center">
          No se pudo determinar el tipo de usuario.
        </div>
      )}
    </motion.div>
  );
};

export default Home;
