import { useState, useCallback } from "react";
import { toast } from "react-toastify";

export interface Pago {
  id: number;
  alumno_id: number;
  cuota_id: number;
  monto_pagado: number;
  metodo: string;
  comprobante?: string;
  fecha_pago?: string;
}

export interface NuevoPago {
  alumno_id?: number;
  cuota_id?: number;
  monto_pagado: number;
  metodo: string;
  comprobante?: string;
}

const API_URL = "http://localhost:8000/pagos";

export const usePagos = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 🔹 Obtener todos los pagos (Admin)
  const fetchPagos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/eliminados`, { headers });
      if (!res.ok) throw new Error("Error al cargar pagos");
      const data = await res.json();
      setPagos(data);
    } catch {
      toast.error("No se pudieron obtener los pagos");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Crear nuevo pago (Admin)
  const crearPago = useCallback(async (nuevoPago: NuevoPago) => {
    try {
      const res = await fetch(`${API_URL}/nuevo`, {
        method: "POST",
        headers,
        body: JSON.stringify(nuevoPago),
      });
      if (!res.ok) throw new Error();
      toast.success("Pago registrado correctamente");
      fetchPagos();
    } catch {
      toast.error("Error al registrar el pago");
    }
  }, []);

  // 🔹 Editar pago (Admin)
  const editarPago = useCallback(async (id: number, datos: Partial<NuevoPago>) => {
    try {
      const res = await fetch(`${API_URL}/editar/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error();
      toast.success("Pago actualizado correctamente");
      fetchPagos();
    } catch {
      toast.error("Error al editar el pago");
    }
  }, []);

  // 🔹 Eliminar pago (Admin)
  const eliminarPago = useCallback(async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este pago?")) return;
    try {
      const res = await fetch(`${API_URL}/eliminar/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error();
      toast.success("Pago eliminado correctamente");
      fetchPagos();
    } catch {
      toast.error("Error al eliminar el pago");
    }
  }, []);

  // 🔹 Obtener pagos del alumno autenticado
  const misPagos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/mis`, { headers });
      if (!res.ok) throw new Error("Error al obtener tus pagos");
      const data = await res.json();
      setPagos(data);
    } catch {
      toast.error("No se pudieron obtener tus pagos");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Crear pago como alumno (autenticado)
  const crearPagoAlumno = useCallback(async (nuevoPago: NuevoPago) => {
    try {
      const res = await fetch(`${API_URL}/nuevo`, {
        method: "POST",
        headers,
        body: JSON.stringify(nuevoPago),
      });
      if (!res.ok) throw new Error();
      toast.success("Pago registrado correctamente");
      misPagos();
    } catch {
      toast.error("Error al registrar el pago");
    }
  }, []);

  return {
    pagos,
    loading,
    fetchPagos,
    crearPago,
    editarPago, // ✅ agregado
    eliminarPago,
    misPagos,
    crearPagoAlumno,
  };
};
