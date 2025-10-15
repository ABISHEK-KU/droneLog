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
import { useAircraft } from "@/context/useAircraft";
import { useLogs } from "@/context/useLogs";
import { useState } from "react";

interface LogUploadFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const LogUploadForm: React.FC<LogUploadFormProps> = ({ open, setOpen }) => {
  const { aircraftsData } = useAircraft();
  const { uploadLog } = useLogs();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDroneId, setSelectedDroneId] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !selectedDroneId) return;
    setUploading(true);
    try {
      await uploadLog(selectedFile, selectedDroneId);
      setOpen(false);
      setSelectedFile(null);
      setSelectedDroneId("");
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
    setSelectedDroneId("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Log</DialogTitle>
          <DialogDescription>
            Select a log file and the associated drone to upload.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="drone" className="text-right">
              Drone
            </Label>
            <Select value={selectedDroneId} onValueChange={setSelectedDroneId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a drone" />
              </SelectTrigger>
              <SelectContent>
                {aircraftsData?.map((drone) => (
                  <SelectItem key={drone._id} value={drone._id}>
                    {drone.name} ({drone.serial})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              File
            </Label>
            <Input
              id="file"
              type="file"
              accept=".tlog,.ulg,.bin,.log"
              onChange={handleFileChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || !selectedDroneId || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogUploadForm;
