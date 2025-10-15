import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIncidents } from "@/context/useIncidents";
import { useAircraft } from "@/context/useAircraft";
import { useLogs } from "@/context/useLogs";
import { useState, useEffect } from "react";
import type { Incident } from "@/model/log";

interface AddEditIncidentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  incident?: Incident | null;
  onClose: () => void;
}

const AddEditIncident: React.FC<AddEditIncidentProps> = ({ open, setOpen, incident, onClose }) => {
  const { createIncident, updateIncident } = useIncidents();
  const { aircraftsData } = useAircraft();
  const { logsData } = useLogs();
  const [saving, setSaving] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState<string>("");
  const [formData, setFormData] = useState({
    drone: "",
    log: "",
    title: "",
    description: "",
    severity: "medium" as "low" | "medium" | "high",
    createdBy: "",
  });

  useEffect(() => {
    if (incident) {
      const droneId = incident.drone._id;
      setSelectedDrone(droneId);
      setFormData({
        drone: droneId,
        log: incident.log?._id || "",
        title: incident.title,
        description: incident.description || "",
        severity: incident.severity || "medium",
        createdBy: incident.createdBy || "",
      });
    } else {
      setSelectedDrone("");
      setFormData({
        drone: "",
        log: "",
        title: "",
        description: "",
        severity: "medium",
        createdBy: "",
      });
    }
  }, [incident]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        drone: aircraftsData.find(d => d._id === formData.drone)!,
        log: formData.log ? logsData.find(l => l._id === formData.log) : undefined,
        title: formData.title,
        description: formData.description || undefined,
        severity: formData.severity,
        createdBy: formData.createdBy || undefined,
      };

      if (incident) {
        await updateIncident(incident._id, data);
      } else {
        await createIncident(data);
      }
      setOpen(false);
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{incident ? "Edit Incident" : "Add Incident"}</DialogTitle>
          <DialogDescription>
            {incident ? "Update the incident details." : "Create a new incident report."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="drone" className="text-right">
                Drone
              </Label>
              <Select
                value={formData.drone}
                onValueChange={(value) => {
                  setSelectedDrone(value);
                  setFormData({ ...formData, drone: value, log: "" });
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select drone" />
                </SelectTrigger>
                <SelectContent>
                  {aircraftsData.map((drone) => (
                    <SelectItem key={drone._id} value={drone._id}>
                      {drone.name} ({drone.serial})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="log" className="text-right">
                Log (Optional)
              </Label>
              <Select
                value={formData.log}
                onValueChange={(value) => setFormData({ ...formData, log: value })}
                disabled={!selectedDrone}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select log" />
                </SelectTrigger>
                <SelectContent>
                  {logsData
                    .filter((log) => log.drone._id === selectedDrone)
                    .map((log) => (
                      <SelectItem key={log._id} value={log._id}>
                        {log.filename}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="severity" className="text-right">
                Severity
              </Label>
              <Select value={formData.severity} onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, severity: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="createdBy" className="text-right">
                Created By
              </Label>
              <Input
                id="createdBy"
                value={formData.createdBy}
                onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : incident ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditIncident;
