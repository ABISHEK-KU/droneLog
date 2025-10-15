import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIncidents } from "@/context/useIncidents";
import { usePrePostChecks } from "@/context/usePrePostChecks";
import type { Log } from "@/model/log";
import { CheckCircle, XCircle } from "lucide-react";

interface LogDetailsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  log: Log | null;
}

const LogDetailsDialog: React.FC<LogDetailsDialogProps> = ({ open, setOpen, log }) => {
  const { incidentsData } = useIncidents();
  const { checksData } = usePrePostChecks();

  if (!log) return null;

  const relatedIncidents = incidentsData.filter(incident => incident.log?._id === log._id);
  const relatedChecks = checksData.filter(check => check.log._id === log._id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Details: {log.filename}</DialogTitle>
          <DialogDescription>
            Drone: {log.drone.name} ({log.drone.serial}) | Size: {(log.size / 1024).toFixed(2)} KB
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Incidents ({relatedIncidents.length})</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedIncidents.length > 0 ? (
                  relatedIncidents.map((incident) => (
                    <TableRow key={incident._id}>
                      <TableCell>{incident.title}</TableCell>
                      <TableCell>{incident.description || "N/A"}</TableCell>
                      <TableCell>{incident.severity}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No incidents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Pre Checks ({relatedChecks.filter(check => check.type === 'pre').length})</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedChecks.filter(check => check.type === 'pre').length > 0 ? (
                  relatedChecks.filter(check => check.type === 'pre').map((check) =>
                    check.items.map((item, index) => (
                      <TableRow key={`${check._id}-${index}`}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          {item.ok ? (
                            <CheckCircle className="text-green-500" />
                          ) : (
                            <XCircle className="text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>{item.notes || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No pre checks found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Post Checks ({relatedChecks.filter(check => check.type === 'post').length})</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedChecks.filter(check => check.type === 'post').length > 0 ? (
                  relatedChecks.filter(check => check.type === 'post').map((check) =>
                    check.items.map((item, index) => (
                      <TableRow key={`${check._id}-${index}`}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          {item.ok ? (
                            <CheckCircle className="text-green-500" />
                          ) : (
                            <XCircle className="text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>{item.notes || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No post checks found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailsDialog;
