// src/views/GestionUsuarios.tsx
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { toast } from "react-toastify";

import AlumnosTable from "../components/alumnos/AlumnosTable";
import AlumnosForm from "../components/alumnos/AlumnosForm";
import type { User } from "../hooks/user.hook";
import { useFetchUsers, useSearch } from "../hooks/user.hook";

const GestionUsuarios = () => {
  const BACKEND_IP = "localhost";
  const BACKEND_PORT = "8000";
  const ENDPOINT = "user/paginated/filtered-sync";
  const URL = `http://${BACKEND_IP}:${BACKEND_PORT}/${ENDPOINT}`;

  const [previousCursors, setPreviousCursors] = useState<number[]>([]);
  const [pageSize, setPageSize] = useState(20);

  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Search con debounce (usa la lógica del profe)
  const { search, setSearch } = useSearch(() => fetchUsers(0));

  const { isLoading, data, nextCursor, fetchUsers } = useFetchUsers({
    url: URL,
    search,
    pageSize,
    setPreviousCursors,
  });

  // Cargar la primera página y recargar cuando cambia pageSize
  useEffect(() => {
    fetchUsers(0);
  }, [pageSize]);

  // --------- Handlers de paginación ---------
  const handleNext = () => {
    if (nextCursor !== null) {
      fetchUsers(nextCursor);
    }
  };

  const handlePrev = () => {
    if (previousCursors.length > 0) {
      const prevCur = previousCursors[previousCursors.length - 1];
      const newPrev = previousCursors.slice(0, -1);
      setPreviousCursors(newPrev);
      fetchUsers(prevCur, true);
    } else {
      fetchUsers(0, true);
    }
  };

  // --------- Handlers del formulario ---------
  const handleAddUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleChangePageSize = (newSize: number) => {
    setPageSize(newSize);
    setPreviousCursors([]);
    fetchUsers(0, true);
  };

  return (
    <motion.div
      className="container py-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: "#3ab397" }}>
          Gestión de Alumnos
        </h2>

        <button
          className="btn btn-success d-flex align-items-center"
          style={{ backgroundColor: "#3ab397", borderColor: "#3ab397" }}
          onClick={handleAddUser}
        >
          <Plus className="me-2" size={18} />
          Agregar Alumno
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="input-group mb-4 shadow-sm">
        <span className="input-group-text bg-white">
          <Search size={18} className="text-muted" />
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre, apellido, email o usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLA */}
      <div className="card border-0 shadow-sm p-3">
        <AlumnosTable users={data} loading={isLoading} onEdit={handleEdit} />
      </div>

      {/* Controles de paginación */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="btn-group">
          <button
            className="btn btn-outline-secondary"
            onClick={handlePrev}
            disabled={isLoading}
          >
            Anterior
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={handleNext}
            disabled={isLoading || nextCursor === null}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* FORM PARA CREAR / EDITAR */}
      {showForm && (
        <AlumnosForm
          show={showForm}
          selectedUser={selectedUser}
          onClose={(successMessage: string | null = null) => {
            setShowForm(false);

            // 🔥 Refrescar tabla completa después de crear o editar
            setPreviousCursors([]);
            fetchUsers(0, true);

            // ✨ Mostrar toast si el form envió un mensaje
            if (successMessage) {
              toast.success(successMessage, { autoClose: 2000 });
            }
          }}
        />
      )}
    </motion.div>
  );
};

export default GestionUsuarios;
