import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PagoForm from "../components/pagos/PagoForm";
import PagosTable from "../components/pagos/PagosTable";
import { usePagos } from "../hooks/usePagos";

interface Alumno {
  id: number;
  userdetail: {
    firstName: string;
    lastName: string;
    dni: number;
    email: string;
  };
}

interface Cuota {
  id: number;
  periodo: string;
  monto_a_pagar: number;
  estado: string;
}

const GestionPagos: React.FC = () => {
  const { fetchPagos } = usePagos();
  const [modoFormulario, setModoFormulario] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<any>(null);
  const [reload, setReload] = useState(false);

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cuotas, setCuotas] = useState<Cuota[]>([]);

  // 🔹 Cargar alumnos y cuotas al inicio
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      try {
        const [resAlumnos, resCuotas] = await Promise.all([
          fetch("http://localhost:8000/user/paginated/filtered-sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ limit: 100, last_seen_id: 0, search: "" }),
          }),
          fetch("http://localhost:8000/cuotas/todas", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const dataAlumnos = await resAlumnos.json();
        const dataCuotas = await resCuotas.json();

        setAlumnos(dataAlumnos.users || []);
        setCuotas(Array.isArray(dataCuotas) ? dataCuotas : []);
      } catch (err) {
        toast.error("Error al cargar datos iniciales");
      }
    };

    fetchData();
  }, [reload]);

  const handleEditar = (pago: any) => {
    setPagoSeleccionado(pago);
    setModoFormulario(true);
  };

  const handleNuevo = () => {
    setPagoSeleccionado(null);
    setModoFormulario(true);
  };

  const handleCancelar = () => {
    setModoFormulario(false);
    setPagoSeleccionado(null);
  };

  const handleExito = () => {
    setModoFormulario(false);
    setPagoSeleccionado(null);
    setReload(!reload);
    fetchPagos();
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="bottom-right" autoClose={2500} />

      {/* Título y botón */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-success mb-0">Gestión de Pagos</h4>

        {!modoFormulario && (
          <button
            className="btn btn-outline-success"
            onClick={handleNuevo}
          >
            + Registrar Pago
          </button>
        )}
      </div>

      <div className="card p-3 shadow-sm border-0">
        {modoFormulario ? (
          <PagoForm
            alumnos={alumnos.map(a => ({
              id: a.id,
              firstName: a.userdetail?.firstName || "",
              lastName: a.userdetail?.lastName || ""
            }))}
            cuotas={cuotas}
            pagoSeleccionado={pagoSeleccionado}
            onSuccess={handleExito}
            onCancel={handleCancelar}
          />
        ) : (
          <PagosTable
            key={reload ? "reload" : "default"}
            alumnos={alumnos}
            cuotas={cuotas}
            onEdit={handleEditar}
          />
        )}
      </div>
    </div>
  );
};

export default GestionPagos;
