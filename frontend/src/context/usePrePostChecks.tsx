import type { PrePostChecksContextType, PrePostCheck } from "@/model/log";
import React, { createContext, useContext, useState } from "react";
import {
  getAllPrePostChecks,
  getPrePostCheckById,
  createPrePostCheck as createPrePostCheckService,
  updatePrePostCheck as updatePrePostCheckService,
  deletePrePostCheck as deletePrePostCheckService,
} from "@/services/prePostCheckService";

const PrePostChecksContext = createContext<PrePostChecksContextType | null>(
  null
);

export const PrePostChecksProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [checksData, setChecksData] = useState<PrePostCheck[]>([]);

  const fetchChecks = async () => {
    try {
      const checks = await getAllPrePostChecks();
      setChecksData(checks);
    } catch (error) {
      console.error("Failed to fetch pre/post checks:", error);
    }
  };

  const fetchCheckById = async (id: string) => {
    try {
      return await getPrePostCheckById(id);
    } catch (error) {
      console.error("Failed to fetch pre/post check:", error);
      throw error;
    }
  };

  const createPrePostCheck = async (
    check: Omit<PrePostCheck, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newCheck = await createPrePostCheckService(check);
      setChecksData((prev) => [...prev, newCheck]);
      return newCheck;
    } catch (error) {
      console.error("Failed to create pre/post check:", error);
      throw error;
    }
  };

  const updatePrePostCheck = async (
    id: string,
    check: Partial<PrePostCheck>
  ) => {
    try {
      const updatedCheck = await updatePrePostCheckService(id, check);
      setChecksData((prev) =>
        prev.map((item) => (item._id === id ? updatedCheck : item))
      );
      return updatedCheck;
    } catch (error) {
      console.error("Failed to update pre/post check:", error);
      throw error;
    }
  };

  const deletePrePostCheck = async (id: string) => {
    try {
      await deletePrePostCheckService(id);
      setChecksData((prev) => prev.filter((check) => check._id !== id));
    } catch (error) {
      console.error("Failed to delete pre/post check:", error);
      throw error;
    }
  };

  const contextValue: PrePostChecksContextType = {
    checksData,
    fetchChecks,
    fetchCheckById,
    createPrePostCheck,
    updatePrePostCheck,
    deletePrePostCheck,
  };

  return (
    <PrePostChecksContext.Provider value={contextValue}>
      {children}
    </PrePostChecksContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePrePostChecks = () => {
  const context = useContext(PrePostChecksContext);
  if (!context) {
    throw new Error(
      "usePrePostChecks must be used within a PrePostChecksProvider"
    );
  }
  return context;
};
