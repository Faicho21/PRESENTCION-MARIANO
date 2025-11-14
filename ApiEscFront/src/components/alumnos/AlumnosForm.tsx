import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUsersCrud } from "../../hooks/useUserCrud";



interface AlumnosFormProps {
  show: boolean;
  onClose: () => void;
  selectedUser: any | null;
}

const AlumnosForm: React.FC<AlumnosFormProps> = ({
  show,
  onClose,
  selectedUser,
}) => {
  const { registerUser, updateUser, updateUserDetail } = useUsersCrud();


  const isEdit = Boolean(selectedUser);

  // ------------------------------
  // Estados del formulario
  // ------------------------------
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    dni: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  // ------------------------------
  // Cargar datos si es edición
  // ------------------------------
  useEffect(() => {
    if (isEdit && selectedUser) {
      setFormData({
        username: selectedUser.username || "",
        password: "", // no se edita
        dni: selectedUser.userdetail?.dni?.toString() || "",
        firstName: selectedUser.userdetail?.firstName || "",
        lastName: selectedUser.userdetail?.lastName || "",
        email: selectedUser.userdetail?.email || "",
      });
    }
  }, [selectedUser]);

  // ------------------------------
  // Manejo de cambios
  // ------------------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ------------------------------
  // Guardar
  // ------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit && selectedUser) {
        // Actualizar User + UserDetail
        await updateUser(selectedUser.id, {
          username: formData.username,
        });

        await updateUserDetail(selectedUser.userdetail.id, {
          dni: Number(formData.dni),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        });
      } else {
        // Crear alumno
        await registerUser({
          username: formData.username,
          password: formData.password,
          dni: Number(formData.dni),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          type: "Alumno",
        });
        
      }

      onClose();
    } catch (error: any) {
      console.error("Error al guardar alumno:", error.message);
    }
  };

  // ------------------------------
  // Si no está visible, no renderizar
  // ------------------------------
  if (!show) return null;

  // ------------------------------
  // Render modal
  // ------------------------------
  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.35)" }}
    >
      <motion.div
        className="modal-dialog modal-dialog-centered"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="modal-content border-0 shadow-lg">
          
          {/* ENCABEZADO */}
          <div
            className="modal-header"
            style={{ backgroundColor: "#3ab397", color: "white" }}
          >
            <h5 className="modal-title">
              {isEdit ? "Editar Alumno" : "Agregar Alumno"}
            </h5>
            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          {/* CUERPO */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">

              {/* Username */}
              <div className="mb-3">
                <label className="form-label">Usuario</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password solo en crear */}
              {!isEdit && (
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEdit}
                  />
                </div>
              )}

              {/* DNI */}
              <div className="mb-3">
                <label className="form-label">DNI</label>
                <input
                  type="number"
                  name="dni"
                  className="form-control"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Nombre */}
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Apellido */}
              <div className="mb-3">
                <label className="form-label">Apellido</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            {/* PIE - BOTONES */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn text-white"
                style={{ backgroundColor: "#3ab397", borderColor: "#3ab397" }}
              >
                {isEdit ? "Guardar Cambios" : "Crear Alumno"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AlumnosForm;
