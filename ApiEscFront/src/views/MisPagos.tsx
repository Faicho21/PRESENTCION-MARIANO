import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import SkeletonLoader from "../components/ui/SkeletonLoader";

interface Pago {
  id: number;
  periodo: string;
  monto_pagado: number;
  metodo: string;
  fecha_pago: string;
}

const MisPagos: React.FC = () => {
  const BACKEND_IP = "localhost";
  const BACKEND_PORT = "8000";
  const token = localStorage.getItem("token");

  const [pagos, setPagos] = useState<Pago[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [descargando, setDescargando] = useState<boolean>(false);
  const [nombreAlumno, setNombreAlumno] = useState<string>("");

  // Cargar datos del alumno y pagos
  useEffect(() => {
    if (!token) return;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const userLocal = localStorage.getItem("user");

    if (userLocal) {
      const user = JSON.parse(userLocal);
      const nombre = `${user.userdetail?.firstName || ""} ${user.userdetail?.lastName || ""}`;
      setNombreAlumno(nombre);
    }

    fetch(`http://${BACKEND_IP}:${BACKEND_PORT}/pago/mis_pagos`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener pagos");
        return res.json();
      })
      .then((data) => setPagos(Array.isArray(data) ? data : []))
      .catch(() => setMensaje("No se pudieron cargar tus pagos."))
      .finally(() => setLoading(false));
  }, [token]);

  // Exportar PDF
  const exportarPDF = () => {
    setDescargando(true);
    const fechaActual = new Date().toLocaleDateString("es-AR");
    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.text(`Alumno: ${nombreAlumno}`, 14, 12);
    doc.text(`Fecha: ${fechaActual}`, 14, 20);
    doc.text("Historial de Pagos", 14, 30);

    autoTable(doc, {
      startY: 36,
      head: [["ID", "Periodo", "Monto Pagado", "Método", "Fecha"]],
      body: pagos.map((p) => [
        p.id,
        p.periodo || "-",
        `$${p.monto_pagado}`,
        p.metodo,
        new Date(p.fecha_pago).toLocaleDateString("es-AR"),
      ]),
    });

    doc.save(`mis_pagos_${nombreAlumno}.pdf`);
    setTimeout(() => setDescargando(false), 1000);
  };

  return (
    <div className="container mt-4">
      <motion.div
        className="p-4 bg-light border rounded shadow-sm mb-4"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h5 className="fw-semibold text-center text-success mb-0">Mis Pagos</h5>
      </motion.div>

      {mensaje && (
        <motion.div
          className="alert alert-danger text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {mensaje}
        </motion.div>
      )}

      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn border-success text-success"
          onClick={exportarPDF}
          disabled={descargando}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f1f3f5")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          {descargando ? "Descargando..." : "Descargar PDF"}
        </button>
      </div>

      {/* Mostrar skeleton mientras carga */}
      {loading ? (
        <SkeletonLoader rows={6} columns={5} type="table" />
      ) : pagos.length === 0 ? (
        <div className="text-center text-muted mt-3">
          No tienes pagos registrados aún.
        </div>
      ) : (
        <motion.div
          className="table-responsive bg-light border rounded shadow-sm p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <table className="table table-sm table-striped align-middle">
            <thead className="table-success sticky-top">
              <tr>
                <th>ID</th>
                <th>Periodo</th>
                <th>Monto Pagado</th>
                <th>Método</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.periodo || "-"}</td>
                  <td>${p.monto_pagado}</td>
                  <td>{p.metodo}</td>
                  <td>
                    {p.fecha_pago
                      ? new Date(p.fecha_pago).toLocaleDateString("es-AR")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default MisPagos;
