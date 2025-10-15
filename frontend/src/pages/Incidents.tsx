import React, { useEffect, useState } from 'react';
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
import { useIncidents } from "@/context/useIncidents";
import { Trash2, Plus, Edit } from "lucide-react";
import DeleteIncident from "@/components/DeleteIncident";
import AddEditIncident from "@/components/AddEditIncident";
import type { Incident } from "@/model/log";

const Incidents: React.FC = () => {
  const { incidentsData, fetchIncidents } = useIncidents();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [addEditDialog, setAddEditDialog] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filteredIncidents = incidentsData?.filter(
    (incident) =>
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.drone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.drone.serial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    setSelectedIncidentId(null);
  };

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return (
    <div className="w-full h-full flex flex-col justify-start items-center overflow-hidden">
      <div className="w-full grid grid-cols-3 justify-end place-items-end pb-10 flex-shrink-0">
        <Input
          type="search"
          placeholder="Search incidents"
          className="col-start-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          onClick={() => {
            setSelectedIncident(null);
            setAddEditDialog(true);
          }}
          className="col-start-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Incident
        </Button>
      </div>
      <div className="w-full flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Drone</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents && filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <TableRow key={incident._id}>
                  <TableCell>{incident.title}</TableCell>
                  <TableCell>{incident.description || "N/A"}</TableCell>
                  <TableCell>{incident.severity || "N/A"}</TableCell>
                  <TableCell>{incident.drone.name} ({incident.drone.serial})</TableCell>
                  <TableCell>{new Date(incident.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex justify-start items-center gap-4">
                      <Edit
                        className="text-blue-500 cursor-pointer"
                        onClick={() => {
                          setSelectedIncident(incident);
                          setAddEditDialog(true);
                        }}
                      />
                      <Trash2
                        className="text-destructive cursor-pointer"
                        onClick={() => {
                          setSelectedIncidentId(incident._id);
                          setDeleteDialog(true);
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No incidents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DeleteIncident
        open={deleteDialog}
        setOpen={setDeleteDialog}
        incidentId={selectedIncidentId}
        onClose={handleDelete}
      />
      <AddEditIncident
        open={addEditDialog}
        setOpen={setAddEditDialog}
        incident={selectedIncident}
        onClose={() => {
          setSelectedIncident(null);
          fetchIncidents();
        }}
      />
    </div>
  );
};

export default Incidents;
