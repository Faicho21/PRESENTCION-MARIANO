// src/hooks/users.hook.ts
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

// ------------------------------------
// Types
// ------------------------------------
interface UseFetchUsersProps {
  url: string;
  pageSize: number;
  search: string;
  setPreviousCursors: Dispatch<SetStateAction<number[]>>;
}

export type User = {
  id: number;
  username: string;
  userdetail?: {
    firstName: string;
    lastName: string;
    email: string;
    type: string;
  };
};

// ------------------------------------
// SEARCH con debounce
// ------------------------------------
export function useSearch(callback: (value: string) => void) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      // 👉 Si borraste todo, cargar tabla inicial
      if (search.trim() === "") {
        callback("");
        return;
      }

      // 👉 Si escribís algo, filtra
      callback(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  return { search, setSearch };
}

// ------------------------------------
// FETCH USERS (cursor + paginado)
// ------------------------------------
export function useFetchUsers({
  url,
  pageSize,
  search = "",
  setPreviousCursors,
}: UseFetchUsersProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [cursor, setCursor] = useState<number>(0);

  const fetchUsers = async (
    cursorId: number = 0,
    isGoingBack: boolean = false
  ) => {
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: pageSize,
          last_seen_id: cursorId,
          search: search,
        }),
      });

      const obj = await res.json();

      if (obj.message) {
        console.log("Error backend:", obj.message);
        return;
      }

      setData(obj.users);
      setNextCursor(obj.next_cursor ?? null);

      // manejo cursor anterior para botón "Volver"
      if (!isGoingBack && cursorId !== 0) {
        setPreviousCursors((prev) => [...prev, cursor]);
      }

      setCursor(cursorId);
    } catch (error) {
      console.error("Fetch error →", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, data, nextCursor, fetchUsers };
}
