import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIncidents } from "@/context/useIncidents";
import { useState } from "react";

interface DeleteIncidentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  incidentId: string | null;
  onClose: () => void;
}

const DeleteIncident: React.FC<DeleteIncidentProps> = ({ open, setOpen, incidentId, onClose }) => {
  const { deleteIncident } = useIncidents();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!incidentId) return;
    setDeleting(true);
    try {
      await deleteIncident(incidentId);
      setOpen(false);
      onClose();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Incident</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this incident? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteIncident;
