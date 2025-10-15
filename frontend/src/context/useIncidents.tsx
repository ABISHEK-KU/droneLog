import type { IncidentsContextType, Incident } from "@/model/log";
import React, { createContext, useContext, useState } from "react";
import { getAllIncidents, getIncidentById, createIncident as createIncidentService, updateIncident as updateIncidentService, deleteIncident as deleteIncidentService } from "@/services/incidentService";

const IncidentsContext = createContext<IncidentsContextType | null>(null);

export const IncidentsProvider = ({ children }: { children: React.ReactNode }) => {
  const [incidentsData, setIncidentsData] = useState<Incident[]>([]);

  const fetchIncidents = async () => {
    try {
      const incidents = await getAllIncidents();
      setIncidentsData(incidents);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    }
  };

  const fetchIncidentById = async (id: string) => {
    try {
      return await getIncidentById(id);
    } catch (error) {
      console.error("Failed to fetch incident:", error);
      throw error;
    }
  };

  const createIncident = async (incident: Omit<Incident, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newIncident = await createIncidentService(incident);
      setIncidentsData(prev => [...prev, newIncident]);
      return newIncident;
    } catch (error) {
      console.error("Failed to create incident:", error);
      throw error;
    }
  };

  const updateIncident = async (id: string, incident: Partial<Incident>) => {
    try {
      const updatedIncident = await updateIncidentService(id, incident);
      setIncidentsData(prev => prev.map(item => item._id === id ? updatedIncident : item));
      return updatedIncident;
    } catch (error) {
      console.error("Failed to update incident:", error);
      throw error;
    }
  };

  const deleteIncident = async (id: string) => {
    try {
      await deleteIncidentService(id);
      setIncidentsData(prev => prev.filter(incident => incident._id !== id));
    } catch (error) {
      console.error("Failed to delete incident:", error);
      throw error;
    }
  };

  const contextValue: IncidentsContextType = {
    incidentsData,
    fetchIncidents,
    fetchIncidentById,
    createIncident,
    updateIncident,
    deleteIncident,
  };

  return (
    <IncidentsContext.Provider value={contextValue}>
      {children}
    </IncidentsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useIncidents = () => {
  const context = useContext(IncidentsContext);
  if (!context) {
    throw new Error("useIncidents must be used within an IncidentsProvider");
  }
  return context;
};
