import axiosClient from "../shared/api/axiosClient";

export const medicineApi = {
  list: () => axiosClient.get("/medicines").then((r) => r.data),
  create: (payload) => axiosClient.post("/medicines", payload).then((r) => r.data),
  update: (id, payload) => axiosClient.put(`/medicines/${id}`, payload).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/medicines/${id}`).then((r) => r.data),
  todaySchedule: () => axiosClient.get("/medicines/today/schedule").then((r) => r.data),
  logDose: (id, time, status) => axiosClient.post(`/medicines/${id}/log`, { time, status }).then((r) => r.data),
  adherence: () => axiosClient.get("/medicines/stats/adherence").then((r) => r.data),
};

export const prescriptionApi = {
  scan: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return axiosClient
      .post("/prescriptions/scan", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
};

export const chatApi = {
  send: (message, history) => axiosClient.post("/chat", { message, history }).then((r) => r.data),
};
