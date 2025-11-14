// src/components/alumnos/AlumnosTable.tsx
import React, { useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Pencil } from "lucide-react";
import type { User } from "../../hooks/user.hook";

interface AlumnosTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
}

const AlumnosTable: React.FC<AlumnosTableProps> = ({
  users,
  loading,
  onEdit,
}) => {
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: "Usuario",
        accessorKey: "username",
        cell: (info) => info.row.original.username ?? "",
      },
      {
        header: "Nombre",
        accessorKey: "userdetail.firstName",
        cell: (info) => info.row.original.userdetail?.firstName ?? "",
      },
      {
        header: "Apellido",
        accessorKey: "userdetail.lastName",
        cell: (info) => info.row.original.userdetail?.lastName ?? "",
      },
      {
        header: "Email",
        accessorKey: "userdetail.email",
        cell: (info) => info.row.original.userdetail?.email ?? "",
      },
      {
        header: "Tipo",
        accessorKey: "userdetail.type",
        cell: (info) => {
          const type = info.row.original.userdetail?.type ?? "";
          const color =
            type.toLowerCase() === "admin" ? "#d9534f" : "#3ab397";
          return (
            <span style={{ color, fontWeight: 600, textTransform: "capitalize" }}>
              {type}
            </span>
          );
        },
      },
      {
        header: "Acciones",
        cell: (info) => {
          const user = info.row.original;
          return (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => onEdit(user)}
            >
              <Pencil size={16} className="me-1" />
              Editar
            </button>
          );
        },
      },
    ],
    [onEdit]
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0;

  // Loading
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-success" />
        <p className="mt-2 text-muted">Cargando alumnos...</p>
      </div>
    );
  }

  // Sin datos
  if (!loading && users.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No hay alumnos para mostrar.
      </div>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      style={{
        maxHeight: "500px",
        overflowY: "auto",
        borderRadius: "0.5rem",
      }}
    >
      <table className="table table-hover mb-0">
        <thead className="table-light sticky-top">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} style={{ fontWeight: 600 }}>
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
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: `${paddingTop}px` }} />
            </tr>
          )}

          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];

            return (
              <tr key={row.id} style={{ height: `${virtualRow.size}px` }}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            );
          })}

          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AlumnosTable;
