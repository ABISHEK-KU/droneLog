import type { LogsContextType, Log } from "@/model/log";
import React, { createContext, useContext, useState } from "react";
import { getAllLogs, uploadLog as uploadLogService, deleteLog as deleteLogService } from "@/services/logService";

const LogsContext = createContext<LogsContextType | null>(null);

export const LogsProvider = ({ children }: { children: React.ReactNode }) => {
  const [logsData, setLogsData] = useState<Log[]>([]);

  const fetchLogs = async () => {
    try {
      const logs = await getAllLogs();
      setLogsData(logs);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const uploadLog = async (file: File, droneId: string) => {
    try {
      await uploadLogService(file, droneId);
      fetchLogs(); // Refresh logs after upload
    } catch (error) {
      console.error("Failed to upload log:", error);
      throw error;
    }
  };

  const deleteLog = async (id: string) => {
    try {
      await deleteLogService(id);
      setLogsData(prev => prev.filter(log => log._id !== id));
    } catch (error) {
      console.error("Failed to delete log:", error);
      throw error;
    }
  };

  const contextValue: LogsContextType = {
    logsData,
    fetchLogs,
    uploadLog,
    deleteLog,
  };

  return (
    <LogsContext.Provider value={contextValue}>
      {children}
    </LogsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLogs = () => {
  const context = useContext(LogsContext);
  if (!context) {
    throw new Error("useLogs must be used within a LogsProvider");
  }
  return context;
};
