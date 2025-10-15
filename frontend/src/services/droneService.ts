import type { Drone } from "@/model/aircraft";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const getAllDrones = async (): Promise<Drone[]> => {
  try {
    const response = await fetch(`${baseUrl}/drones/getallDrones`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching drones:", error);
    throw error;
  }
};

export const editDrone = async (
  updates:Drone
)=> {
  try {
    const response = await fetch(`${baseUrl}/drones/edit/${updates._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error editing drone:", error);
    throw error;
  }
};

export const addDrone = async (drone: {
  name: string;
  modelName: string;
  serial: string;
})=> {
  try {
    const response = await fetch(`${baseUrl}/drones/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(drone),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error adding drone:", error);
    throw error;
  }
};

export const deleteDrone = async (id: string)=> {
  try {
    const response = await fetch(`${baseUrl}/drones/delete/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting drone:", error);
    throw error;
  }
};
