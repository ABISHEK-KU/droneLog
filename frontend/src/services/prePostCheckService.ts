import type { PrePostCheck } from "@/model/log";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const getAllPrePostChecks = async (): Promise<PrePostCheck[]> => {
  try {
    const response = await fetch(`${baseUrl}/prepostchecks`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching pre/post checks:", error);
    throw error;
  }
};

export const getPrePostCheckById = async (id: string): Promise<PrePostCheck> => {
  try {
    const response = await fetch(`${baseUrl}/prepostchecks/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching pre/post check:", error);
    throw error;
  }
};

export const createPrePostCheck = async (check: Omit<PrePostCheck, '_id' | 'createdAt' | 'updatedAt'>): Promise<PrePostCheck> => {
  try {
    const response = await fetch(`${baseUrl}/prepostchecks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(check),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error creating pre/post check:", error);
    throw error;
  }
};

export const updatePrePostCheck = async (id: string, check: Partial<PrePostCheck>): Promise<PrePostCheck> => {
  try {
    const response = await fetch(`${baseUrl}/prepostchecks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(check),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error updating pre/post check:", error);
    throw error;
  }
};

export const deletePrePostCheck = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${baseUrl}/prepostchecks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting pre/post check:", error);
    throw error;
  }
};
