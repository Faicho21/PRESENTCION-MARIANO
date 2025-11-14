import { useState, useEffect } from "react";
import { userApi } from "../api/userApi";

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState("");

  // Historial de cursores por página:
  // page 1 = null
  // page 2 = cursor devuelto por page 1
  // page 3 = cursor devuelto por page 2
  const [cursorHistory, setCursorHistory] = useState<(number | null)[]>([null]);

  const [page, setPage] = useState(1);

  const [nextCursor, setNextCursor] = useState<number | null>(null);

  const fetchPage = async (pageIndex: number) => {
    try {
      setLoading(true);

      const cursor = cursorHistory[pageIndex - 1] ?? null;

      const result = await userApi.getPaginatedUsers({
        filter,
        cursor,
      });

      setUsers(result.users);
      setNextCursor(result.nextCursor);

      // Si avanzamos a una nueva página, guardamos el cursor para la siguiente
      if (pageIndex === cursorHistory.length && result.nextCursor) {
        setCursorHistory((prev) => [...prev, result.nextCursor]);
      }

    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cuando cambia la página:
  useEffect(() => {
    fetchPage(page);
  }, [page]);

  // Cuando cambia el filtro:
  useEffect(() => {
    setPage(1);
    setCursorHistory([null]);
    fetchPage(1);
  }, [filter]);

  const totalPages = cursorHistory.length;

  return {
    users,
    loading,
    filter,
    setFilter,

    page,
    totalPages,

    nextPage: () => {
      if (!nextCursor) return; // no hay más páginas
      setPage((p) => p + 1);
    },

    prevPage: () => {
      if (page === 1) return;
      setPage((p) => p - 1);
    }
  };
}
