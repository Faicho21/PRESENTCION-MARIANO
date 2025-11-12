import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface AlumnoFormProps {
  alumnoSeleccionado?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const AlumnoForm: React.FC<AlumnoFormProps> = ({
  alumnoSeleccionado,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    dni: "",
    firstName: "",
    lastName: "",
    email: "",
    type: "Alumno",
  });

  const [loading, setLoading] = useState(false);

  // 🔄 Cargar datos en modo edición
  useEffect(() => {
    if (alumnoSeleccionado) {
      const detail = alumnoSeleccionado.userdetail || {};
      setFormData({
        username: alumnoSeleccionado.username || "",
        password: "",
        dni: detail.dni || "",
        firstName: detail.firstName || "",
        lastName: detail.lastName || "",
        email: detail.email || "",
        type: detail.type || "Alumno",
      });
    }
  }, [alumnoSeleccionado]);

  // 🖊️ Manejar cambios de campos
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 💾 Guardar o actualizar alumno
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Sesión expirada, vuelve a iniciar sesión");
      setLoading(false);
      return;
    }

    try {
      const url = alumnoSeleccionado
        ? `http://localhost:8000/userdetail/${alumnoSeleccionado.userdetail?.id}`
        : "http://localhost:8000/users/register/full";

      const method = alumnoSeleccionado ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Error:", errorData);
        throw new Error("Error en el registro o edición del alumno");
      }

      toast.success(
        alumnoSeleccionado
          ? "Alumno actualizado correctamente"
          : "Alumno agregado correctamente"
      );

      // 🧹 Resetear formulario y actualizar tabla
      setFormData({
        username: "",
        password: "",
        dni: "",
        firstName: "",
        lastName: "",
        email: "",
        type: "Alumno",
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo registrar/editar el alumno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm p-3 bg-light">
      <h5 className="text-success fw-semibold mb-3">
        {alumnoSeleccionado ? "Editar Alumno" : "Nuevo Alumno"}
      </h5>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {!alumnoSeleccionado && (
            <>
              <div className="col-md-6">
                <label className="form-label">Usuario</label>
                <input
                  type="text"
                  className="form-control"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="col-md-4">
            <label className="form-label">DNI</label>
            <input
              type="text"
              className="form-control"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              className="form-control"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Tipo</label>
            <select
              className="form-select"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="Alumno">Alumno</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading
              ? "Guardando..."
              : alumnoSeleccionado
              ? "Actualizar"
              : "Agregar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlumnoForm;
