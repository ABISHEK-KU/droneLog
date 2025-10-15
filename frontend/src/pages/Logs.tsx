import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLogs } from "@/context/useLogs";
import { useIncidents } from "@/context/useIncidents";
import { usePrePostChecks } from "@/context/usePrePostChecks";
import type { Log } from "@/model/log";
import { Eye, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import LogUploadForm from "@/components/LogUploadForm";
import DeleteLog from "@/components/DeleteLog";
import LogDetailsDialog from "@/components/LogDetailsDialog";

const Logs = () => {
  const { logsData, fetchLogs } = useLogs();
  const { fetchIncidents } = useIncidents();
  const { fetchChecks } = usePrePostChecks();

  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [detailsDialog, setDetailsDialog] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredLogs = logsData?.filter(
    (log) =>
      log.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.drone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.drone.serial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (log: Log) => {
    setSelectedLog(log);
    setDetailsDialog(true);
  };

  const handleDelete = () => {
    setSelectedLogId(null);
  };

  useEffect(() => {
    fetchLogs();
    fetchIncidents();
    fetchChecks();
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-start items-center overflow-hidden">
      <div className="w-full grid grid-cols-3 justify-end place-items-end pb-10 flex-shrink-0">
        <Input
          type="search"
          placeholder="Search logs"
          className="col-start-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          className="col-start-3"
          onClick={() => setUploadOpen(true)}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Log
        </Button>
      </div>
      <div className="w-full flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Drone</TableHead>
              <TableHead>Size (KB)</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs && filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{log.filename}</TableCell>
                  <TableCell>{log.drone.name} ({log.drone.serial})</TableCell>
                  <TableCell>{(log.size / 1024).toFixed(2)}</TableCell>
                  <TableCell>{new Date(log.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex justify-start items-center gap-4">
                      <Eye
                        className="text-blue-500 cursor-pointer"
                        onClick={() => handleViewDetails(log)}
                      />
                      <Trash2
                        className="text-destructive cursor-pointer"
                        onClick={() => {
                          setSelectedLogId(log._id);
                          setDeleteDialog(true);
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <LogUploadForm
        open={uploadOpen}
        setOpen={setUploadOpen}
      />
      <DeleteLog
        open={deleteDialog}
        setOpen={setDeleteDialog}
        logId={selectedLogId}
        onClose={handleDelete}
      />
      <LogDetailsDialog
        open={detailsDialog}
        setOpen={setDetailsDialog}
        log={selectedLog}
      />
    </div>
  );
};

export default Logs;
