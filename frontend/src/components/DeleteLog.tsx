import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLogs } from "@/context/useLogs";
import { useState } from "react";

interface DeleteLogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  logId: string | null;
  onClose: () => void;
}

const DeleteLog: React.FC<DeleteLogProps> = ({ open, setOpen, logId, onClose }) => {
  const { deleteLog } = useLogs();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!logId) return;
    setDeleting(true);
    try {
      await deleteLog(logId);
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
          <DialogTitle>Delete Log</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this log? This action cannot be undone.
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

export default DeleteLog;
