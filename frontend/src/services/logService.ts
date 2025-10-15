import type { Log } from "@/model/log";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const getAllLogs = async (): Promise<Log[]> => {
  try {
    const response = await fetch(`${baseUrl}/logs`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
};

export const uploadLog = async (file: File, droneId: string): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append("logFile", file);
    formData.append("droneId", droneId);

    const response = await fetch(`${baseUrl}/logs/upload`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.status) {
      throw new Error(data.message || "Upload failed");
    }
  } catch (error) {
    console.error("Error uploading log:", error);
    throw error;
  }
};

export const deleteLog = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${baseUrl}/logs/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting log:", error);
    throw error;
  }
};
