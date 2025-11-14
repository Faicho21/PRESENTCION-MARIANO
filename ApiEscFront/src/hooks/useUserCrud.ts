// src/hooks/useUsersCrud.ts
import { useState } from "react";
import { userApi } from "../api/userApi";


export function useUsersCrud() {
  const [loading, setLoading] = useState(false);

  // -------------------------------
  // Crear usuario completo
  // -------------------------------
  const registerUser = async (data: any) => {
    try {
      setLoading(true);
      await userApi.registerUserFull(data);
    } catch (err: any) {
      console.error("Error registerUser:", err);
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Editar usuario (username)
  // -------------------------------
  const updateUser = async (id: number, data: any) => {
    try {
      setLoading(true);
      await userApi.updateUser(id, data);
    } catch (err: any) {
      console.error("Error updateUser:", err);
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Editar UserDetail
  // -------------------------------
  const updateUserDetail = async (id: number, data: any) => {
    try {
      setLoading(true);
      await userApi.updateUserDetail(id, data);
    } catch (err: any) {
      console.error("Error updateUserDetail:", err);
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Eliminar usuario
  // -------------------------------
  const deleteUser = async (id: number) => {
    try {
      setLoading(true);
      await userApi.deleteUser(id);
    } catch (err: any) {
      console.error("Error deleteUser:", err);
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    registerUser,
    updateUser,
    updateUserDetail,
    deleteUser,
  };
}
