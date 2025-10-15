import type { Incident } from "@/model/log";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const getAllIncidents = async (): Promise<Incident[]> => {
  try {
    const response = await fetch(`${baseUrl}/incidents`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching incidents:", error);
    throw error;
  }
};

export const getIncidentById = async (id: string): Promise<Incident> => {
  try {
    const response = await fetch(`${baseUrl}/incidents/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching incident:", error);
    throw error;
  }
};

export const createIncident = async (incident: Omit<Incident, '_id' | 'createdAt' | 'updatedAt'>): Promise<Incident> => {
  try {
    const response = await fetch(`${baseUrl}/incidents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(incident),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error creating incident:", error);
    throw error;
  }
};

export const updateIncident = async (id: string, incident: Partial<Incident>): Promise<Incident> => {
  try {
    const response = await fetch(`${baseUrl}/incidents/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(incident),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error updating incident:", error);
    throw error;
  }
};

export const deleteIncident = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${baseUrl}/incidents/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting incident:", error);
    throw error;
  }
};
