import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

function Nvar() {
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const navigate = useNavigate();

  //  Detectar tipo de usuario desde el token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setTipoUsuario(payload.type?.toLowerCase() || null);
      } catch (error) {
        console.error("Token inválido:", error);
        setTipoUsuario(null);
      }
    }
  }, []);

  //  Cerrar sesión con aviso visual
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("Sesión cerrada correctamente", { autoClose: 1800 });
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <motion.nav
      className="navbar navbar-expand-lg navbar-dark shadow-sm"
      style={{ backgroundColor: "#3ab397" }}
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to="/home">
          Mi Colegio
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {/* Perfil */}
            <li className="nav-item">
              <NavLink className="nav-link" to="/perfil">
                Perfil
              </NavLink>
            </li>

            {/* Opciones del alumno */}
            {tipoUsuario === "alumno" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/mis-pagos">
                  Mis pagos
                </NavLink>
              </li>
            )}

            {/* Opciones del administrador */}
            {tipoUsuario === "admin" && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/alumnos">
                    Alumnos
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/pagos">
                    Pagos
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/carreras">
                    Carreras
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <button
            className="btn btn-outline-light px-3"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

export default Nvar;
