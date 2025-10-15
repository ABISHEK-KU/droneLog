import type { AddDrone, Aircraft, Drone } from "@/model/aircraft";
import React, { createContext, useContext, useState } from "react";
import { getAllDrones, editDrone as editDroneService, deleteDrone as deleteDroneService, addDrone as addDroneService } from "@/services/droneService";

const AircraftContext = createContext<Aircraft | null>(null);

export const AircraftProvider = ({ children }: { children: React.ReactNode }) => {
  const [aircraftsData, setAircraftData] = useState<Drone[]>([]);

  const fetchDrones = async () => {
    try {
      const drones = await getAllDrones();
      setAircraftData(drones);
    } catch (error) {
      console.error("Failed to fetch drones:", error);
    }
  };

  const editDrone = async (updates:Drone) => {
    try {
      const response = await editDroneService(updates);
      if(response?.status){
        fetchDrones()
      }else{
        console.error(response?.message);
      }
    } catch (error) {
      console.error("Failed to edit drone:", error);
    }
  };

  const addDrone = async (drone: AddDrone) => {
    try {
      const newDrone = await addDroneService(drone);
      setAircraftData(prev => [...prev, newDrone]);
    } catch (error) {
      console.error("Failed to add drone:", error);
    }
  };

  const deleteDrone = async (id: string) => {
    try {
      await deleteDroneService(id);
      setAircraftData(prev => prev.filter(drone => drone._id !== id));
    } catch (error) {
      console.error("Failed to delete drone:", error);
    }
  };

  const contextValue: Aircraft = {
    aircraftsData,
    fetchDrones,
    editDrone,
    deleteDrone,
    addDrone,
  };

  return (
    <AircraftContext.Provider value={contextValue}>
      {children}
    </AircraftContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAircraft = () => {
  const context = useContext(AircraftContext);
  if (!context) {
    throw new Error("useAircraft must be used within an AircraftProvider");
  }
  return context;
};
