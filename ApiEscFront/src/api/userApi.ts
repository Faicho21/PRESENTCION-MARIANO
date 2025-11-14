import { httpClient } from "./httpClient";


export const userApi = {
  async getPaginatedUsers(filters: any) {
    const data = await httpClient.post("/user/paginated/filtered-sync", filters);

    return {
      users: data.users || [],
      nextCursor: data.next_cursor || null,
    };
  },

  async registerUserFull(data: any) {
    return await httpClient.post("/user/register/full", data);
  },

  async updateUser(id: number, data: any) {
    return await httpClient.patch(`/user/editar/${id}`, data);
  },

  async updateUserDetail(id: number, data: any) {
    return await httpClient.patch(`/userdetail/editar/${id}`, data);
  },

  async deleteUser(id: number) {
    return await httpClient.delete(`/user/eliminar/${id}`);
  },

  async getProfile() {
    return await httpClient.get("/user/profile");
  },
};
