import React, { useEffect, useState, useRef } from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import type {ColumnDef } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface Alumno {
  id: number;
  username: string;
  userdetail: {
    firstName: string;
    lastName: string;
    dni: string;
    email: string;
    type: string;
  };
}

interface Props {
  onEdit: (alumno: Alumno) => void;
  onDelete: (id: number) => void;
}

const AlumnosTable: React.FC<Props> = ({ onEdit, onDelete }) => {
  const [data, setData] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 🔁 Cargar alumnos
  const fetchAlumnos = async (cursor: number = 0, append = false) => {
    try {
      const token = localStorage.getItem("token");
      const body = { limit: 20, last_seen_id: cursor, search };

      const res = await fetch("http://localhost:8000/user/paginated/filtered-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al cargar alumnos");
      const result = await res.json();

      if (append) {
        setData(prev => [...prev, ...result.users]);
      } else {
        setData(result.users);
      }

      setNextCursor(result.next_cursor);
    } catch (e) {
      toast.error("No se pudieron cargar los alumnos");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, [search]);

  // 🔎 Filtrado
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setLoading(true);
  };

  const columns: ColumnDef<Alumno>[] = [
    { header: "ID", accessorKey: "id" },
    {
      header: "Nombre",
      cell: ({ row }) => row.original.userdetail?.firstName || "—",
    },
    {
      header: "Apellido",
      cell: ({ row }) => row.original.userdetail?.lastName || "—",
    },
    {
      header: "DNI",
      cell: ({ row }) => row.original.userdetail?.dni || "—",
    },
    {
      header: "Email",
      cell: ({ row }) => row.original.userdetail?.email || "—",
    },
    {
      header: "Rol",
      cell: ({ row }) => row.original.userdetail?.type || "—",
    },
    {
      header: "Acciones",
      cell: ({ row }) => (
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => onEdit(row.original)}
          >
            <Pencil size={16} />
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(row.original.id)}
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

  // 📜 Cargar más al final
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 50 && nextCursor && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchAlumnos(nextCursor, true);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5 text-muted">
        <Loader2 className="spin" size={20} /> Cargando alumnos...
      </div>
    );

  return (
    <div className="container mt-3">
      <h5 className="text-success fw-semibold mb-3">Lista de Alumnos</h5>

      {/* 🔍 Filtro */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar alumno por nombre o email..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <div
        ref={parentRef}
        style={{ height: "60vh", overflow: "auto" }}
        onScroll={handleScroll}
      >
        <table className="table table-striped align-middle shadow-sm">
          <thead className="table-success sticky-top">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const row = table.getRowModel().rows[virtualRow.index];
              return (
                <tr key={row.id} style={{ transform: `translateY(${virtualRow.start}px)` }}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {isLoadingMore && (
          <div className="text-center text-muted p-2">
            <Loader2 className="spin" size={16} /> Cargando más alumnos...
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumnosTable;
