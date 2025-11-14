// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { userApi } from "../api/userApi";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [type, setType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------------
  // Cargar perfil desde backend
  // -----------------------------------
  const loadProfile = async () => {
    try {
      setLoading(true);

      const profile = await userApi.getProfile();

      setUser(profile);
      setType(profile?.userdetail?.type?.toLowerCase() ?? null);
    } catch (err) {
      console.error("Error al cargar perfil:", err);
      setUser(null);
      setType(null);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // Leer token al iniciar
  // -----------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    // Decodificar tipo del token (rápido)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload?.type) {
        setType(payload.type.toLowerCase());
      }
    } catch {}

    loadProfile();
  }, []);

  // -----------------------------------
  // Logout
  // -----------------------------------
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setType(null);
  };

  return {
    user,
    type,
    loading,
    logout,
    reloadProfile: loadProfile,
  };
}
