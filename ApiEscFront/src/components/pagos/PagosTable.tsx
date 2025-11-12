import React, { useEffect, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { usePagos} from "../../hooks/usePagos";
import type { Pago } from "../../hooks/usePagos";

interface Alumno {
  id: number;
  userdetail: {
    firstName: string;
    lastName: string;
  };
}

interface Cuota {
  id: number;
  periodo: string;
  monto_a_pagar: number;
}

interface Props {
  alumnos?: Alumno[];
  cuotas?: Cuota[];
  onEdit: (pago: Pago) => void;
}

const PagosTable: React.FC<Props> = ({ alumnos = [], cuotas = [], onEdit }) => {
  const { pagos, fetchPagos, eliminarPago, loading } = usePagos();
  const [data, setData] = useState<Pago[]>([]);

  useEffect(() => {
    const load = async () => {
      await fetchPagos();
    };
    load();
  }, [fetchPagos]);

  useEffect(() => {
    setData(pagos);
  }, [pagos]);

  const handleEliminar = async (id: number) => {
    await eliminarPago(id);
  };

  const columns: ColumnDef<Pago>[] = [
    { header: "ID", accessorKey: "id" },
    {
      header: "Alumno",
      cell: ({ row }) => {
        const pago = row.original;
        const alumno = alumnos.find((a) => a.id === pago.alumno_id);
        return alumno
          ? `${alumno.userdetail.firstName} ${alumno.userdetail.lastName}`
          : `ID: ${pago.alumno_id}`;
      },
    },
    {
      header: "Cuota",
      cell: ({ row }) => {
        const pago = row.original;
        const cuota = cuotas.find((c) => c.id === pago.cuota_id);
        return cuota
          ? `${cuota.periodo} - $${cuota.monto_a_pagar}`
          : `ID: ${pago.cuota_id}`;
      },
    },
    { header: "Monto Pagado", accessorKey: "monto_pagado" },
    { header: "Método", accessorKey: "metodo" },
    {
      header: "Fecha",
      cell: ({ row }) =>
        row.original.fecha_pago
          ? new Date(row.original.fecha_pago).toLocaleDateString()
          : "-",
    },
    {
      header: "Acciones",
      cell: ({ row }) => (
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => onEdit(row.original)}
          >
            <Pencil size={16} />
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleEliminar(row.original.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
  });

  if (loading)
    return (
      <div className="text-center mt-5 text-muted">
        Cargando pagos...
      </div>
    );

  return (
    <div className="container mt-3">
      <h5 className="text-success fw-semibold mb-3">Pagos Registrados</h5>

      <div ref={parentRef} style={{ height: "60vh", overflow: "auto" }}>
        <table className="table table-striped align-middle shadow-sm">
          <thead className="table-success sticky-top">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PagosTable;
