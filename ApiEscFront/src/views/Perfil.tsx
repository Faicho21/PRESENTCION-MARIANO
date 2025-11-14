import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

const Perfil = () => {
  const { user, type, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h4>No se pudo cargar el perfil.</h4>
      </div>
    );
  }

  const detail = user.userdetail;

  return (
    <motion.div
      className="container py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="fw-bold mb-4" style={{ color: "#3ab397" }}>
        Mi Perfil
      </h2>

      {/* CARD DATOS */}
      <div className="card shadow-sm border-0 p-4 mb-4">
        <h5 className="fw-bold mb-3">{detail.firstName} {detail.lastName}</h5>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="text-muted mb-1">Usuario</label>
            <div className="fw-semibold">{user.username}</div>
          </div>

          <div className="col-md-6">
            <label className="text-muted mb-1">DNI</label>
            <div className="fw-semibold">{detail.dni}</div>
          </div>

          <div className="col-md-6">
            <label className="text-muted mb-1">Email</label>
            <div className="fw-semibold">{detail.email}</div>
          </div>

          <div className="col-md-6">
            <label className="text-muted mb-1">Tipo de usuario</label>
            <span className="badge bg-success text-white px-3 py-2">
              {detail.type}
            </span>
          </div>
        </div>
      </div>

      {/* PANEL ADMINISTRATIVO (solo admin) */}
      {type === "admin" && (
        <motion.div
          className="card shadow-sm border-0 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h5 className="fw-bold mb-3">Panel Administrativo</h5>

          <div className="row g-3">
            <div className="col-md-4">
              <Link to="/alumnos" className="text-decoration-none">
                <div className="p-3 rounded shadow-sm border">
                  <h6 className="mb-0">Gestión de Alumnos</h6>
                </div>
              </Link>
            </div>

            <div className="col-md-4">
              <Link to="/pagos" className="text-decoration-none">
                <div className="p-3 rounded shadow-sm border">
                  <h6 className="mb-0">Gestión de Pagos</h6>
                </div>
              </Link>
            </div>

            <div className="col-md-4">
              <Link to="/cuotas" className="text-decoration-none">
                <div className="p-3 rounded shadow-sm border">
                  <h6 className="mb-0">Gestión de Cuotas</h6>
                </div>
              </Link>
            </div>

            <div className="col-md-4">
              <Link to="/tarifas" className="text-decoration-none">
                <div className="p-3 rounded shadow-sm border">
                  <h6 className="mb-0">Gestión de Tarifas</h6>
                </div>
              </Link>
            </div>

            <div className="col-md-4">
              <Link to="/notificaciones" className="text-decoration-none">
                <div className="p-3 rounded shadow-sm border">
                  <h6 className="mb-0">Notificaciones</h6>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Perfil;
