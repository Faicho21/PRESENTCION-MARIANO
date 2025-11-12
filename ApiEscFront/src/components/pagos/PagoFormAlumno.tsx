import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { usePagos } from "../../hooks/usePagos";
import type { NuevoPago } from "../../hooks/usePagos";

interface Cuota {
  id: number;
  periodo: string;
  monto_a_pagar: number;
  saldo_pendiente: number;
  estado: string;
}

const PagoFormAlumno: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { crearPagoAlumno } = usePagos();

  const [cuotasPendientes, setCuotasPendientes] = useState<Cuota[]>([]);
  const [formData, setFormData] = useState<NuevoPago>({
    alumno_id: 0,
    cuota_id: 0,
    monto_pagado: 0,
    metodo: "transferencia",
    comprobante: "",
  });

  const token = localStorage.getItem("token");
  const BACKEND_URL = "http://localhost:8000";

  // 🧾 Cargar cuotas pendientes del alumno autenticado
  useEffect(() => {
    const fetchCuotas = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/cuotas/mis`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const pendientes = data.filter(
          (c: Cuota) => c.estado !== "pagada"
        );
        setCuotasPendientes(pendientes);
      } catch {
        toast.error("No se pudieron obtener tus cuotas pendientes");
      }
    };
    fetchCuotas();
  }, [token]);

  // 🎛 Manejar cambios del formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "monto_pagado" ? Number(value) : value,
    }));
  };

  // 💰 Enviar pago
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cuota_id || !formData.monto_pagado) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    try {
      await crearPagoAlumno(formData);
      toast.success("Pago realizado correctamente");
      setFormData({
        alumno_id: 0,
        cuota_id: 0,
        monto_pagado: 0,
        metodo: "transferencia",
        comprobante: "",
      });
      onSuccess();
    } catch {
      toast.error("Error al registrar el pago");
    }
  };

  return (
    <div className="card p-4 shadow-sm border-0 bg-light">
      <h5 className="text-success fw-semibold mb-3">Registrar Pago</h5>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* 🔹 Seleccionar Cuota */}
          <div className="col-md-6">
            <label className="form-label">Cuota Pendiente</label>
            <select
              className="form-select"
              name="cuota_id"
              value={formData.cuota_id}
              onChange={handleChange}
              required
            >
              <option value={0}>Seleccionar cuota</option>
              {cuotasPendientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.periodo} - ${c.saldo_pendiente}
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Monto */}
          <div className="col-md-3">
            <label className="form-label">Monto a pagar</label>
            <input
              type="number"
              className="form-control"
              name="monto_pagado"
              value={formData.monto_pagado || ""}
              onChange={handleChange}
              placeholder="Monto"
              required
            />
          </div>

          {/* 🔹 Método */}
          <div className="col-md-3">
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
              placeholder="N° de comprobante o referencia"
            />
          </div>
        </div>

        {/* 🔘 Botón enviar */}
        <div className="d-flex justify-content-end mt-4">
          <button type="submit" className="btn btn-success">
            Registrar Pago
          </button>
        </div>
      </form>
    </div>
  );
};

export default PagoFormAlumno;
