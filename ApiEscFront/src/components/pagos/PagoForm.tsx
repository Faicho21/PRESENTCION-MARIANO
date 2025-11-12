import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { usePagos } from "../../hooks/usePagos";
import type { Pago, NuevoPago } from "../../hooks/usePagos";

interface Alumno {
  id: number;
  firstName: string;
  lastName: string;
}

interface Cuota {
  id: number;
  periodo: string;
  monto_a_pagar: number;
}

interface PagoFormProps {
  alumnos: Alumno[];
  cuotas: Cuota[];
  pagoSeleccionado?: Pago | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const PagoForm: React.FC<PagoFormProps> = ({
  alumnos,
  cuotas = [],
  pagoSeleccionado,
  onSuccess,
  onCancel,
}) => {
  const { crearPago, editarPago } = usePagos();

  const [formData, setFormData] = useState<NuevoPago>({
    alumno_id: 0,
    cuota_id: 0,
    monto_pagado: 0,
    metodo: "transferencia",
    comprobante: "",
  });

  // ✅ Cargar datos si se está editando
  useEffect(() => {
    if (pagoSeleccionado) {
      setFormData({
        alumno_id: pagoSeleccionado.alumno_id,
        cuota_id: pagoSeleccionado.cuota_id,
        monto_pagado: pagoSeleccionado.monto_pagado,
        metodo: pagoSeleccionado.metodo,
        comprobante: pagoSeleccionado.comprobante || "",
      });
    }
  }, [pagoSeleccionado]);

  // ✅ Manejar cambios de los inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "monto_pagado" ? Number(value) : value,
    }));
  };

  // ✅ Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.alumno_id || !formData.cuota_id || !formData.monto_pagado) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    try {
      if (pagoSeleccionado) {
        await editarPago(pagoSeleccionado.id, formData);
      } else {
        await crearPago(formData);
      }
      onSuccess();
    } catch {
      toast.error("Error al procesar el pago");
    }
  };

  return (
    <div className="card p-4 shadow-sm border-0 bg-light">
      <h5 className="text-success fw-semibold mb-3">
        {pagoSeleccionado ? "Editar Pago" : "Nuevo Pago"}
      </h5>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* 🔹 Seleccionar Alumno */}
          <div className="col-md-4">
            <label className="form-label">Alumno</label>
            <select
              className="form-select"
              name="alumno_id"
              value={formData.alumno_id}
              onChange={handleChange}
            >
              <option value={0}>Seleccionar</option>
              {alumnos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.firstName} {a.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Seleccionar Cuota */}
          <div className="col-md-4">
            <label className="form-label">Cuota</label>
            <select
              className="form-select"
              name="cuota_id"
              value={formData.cuota_id}
              onChange={handleChange}
            >
              <option value={0}>Seleccionar</option>
              {cuotas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.periodo} (${c.monto_a_pagar})
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Monto */}
          <div className="col-md-4">
            <label className="form-label">Monto Pagado</label>
            <input
              type="number"
              className="form-control"
              name="monto_pagado"
              value={formData.monto_pagado}
              onChange={handleChange}
              required
            />
          </div>

          {/* 🔹 Método */}
          <div className="col-md-6">
            <label className="form-label">Método</label>
            <select
              className="form-select"
              name="metodo"
              value={formData.metodo}
              onChange={handleChange}
            >
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="mercadopago">Mercado Pago</option>
            </select>
          </div>

          {/* 🔹 Comprobante */}
          <div className="col-md-6">
            <label className="form-label">Comprobante (opcional)</label>
            <input
              type="text"
              className="form-control"
              name="comprobante"
              value={formData.comprobante}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* 🔹 Botones */}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-success">
            {pagoSeleccionado ? "Actualizar" : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PagoForm;
