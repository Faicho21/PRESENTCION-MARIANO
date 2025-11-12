import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AlumnosTable from "../components/alumnos/AlumnosTable";
import AlumnoForm from "../components/alumnos/AlumnosForm";

const GestionUsuarios: React.FC = () => {
  const [modoFormulario, setModoFormulario] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any>(null);
  const [reload, setReload] = useState(false);

  const handleEditar = (alumno: any) => {
    setAlumnoSeleccionado(alumno);
    setModoFormulario(true);
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este alumno?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al eliminar alumno");

      toast.success("Alumno eliminado correctamente");
      setReload(!reload);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar el alumno");
    }
  };

  const handleAgregarNuevo = () => {
    setAlumnoSeleccionado(null);
    setModoFormulario(true);
  };

  const handleCancelar = () => {
    setModoFormulario(false);
    setAlumnoSeleccionado(null);
  };

  const handleExito = () => {
    setModoFormulario(false);
    setAlumnoSeleccionado(null);
    setReload(!reload);
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="bottom-right" autoClose={2500} />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-success mb-0">Gestión de Usuarios</h4>

        {!modoFormulario && (
          <button
            className="btn btn-outline-success"
            onClick={handleAgregarNuevo}
          >
            + Agregar Alumno
          </button>
        )}
      </div>

      <div className="card p-3 shadow-sm border-0">
        {modoFormulario ? (
          <AlumnoForm
            alumnoSeleccionado={alumnoSeleccionado}
            onSuccess={handleExito}
            onCancel={handleCancelar}
          />
        ) : (
          <AlumnosTable
            key={reload ? "reload" : "default"}
            onEdit={handleEditar}
            onDelete={handleEliminar}
          />
        )}
      </div>
    </div>
  );
};

export default GestionUsuarios;
