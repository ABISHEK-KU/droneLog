import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePrePostChecks } from "@/context/usePrePostChecks";
import { useAircraft } from "@/context/useAircraft";
import { useLogs } from "@/context/useLogs";
import type { PrePostCheck } from "@/model/log";
import { CheckCircle, XCircle, Eye, Plus, Edit, Trash2 } from "lucide-react";

const PrePostCheck: React.FC = () => {
  const {
    checksData,
    fetchChecks,
    createPrePostCheck,
    updatePrePostCheck,
    deletePrePostCheck,
  } = usePrePostChecks();
  const { aircraftsData } = useAircraft();
  const { logsData } = useLogs();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCheck, setSelectedCheck] = useState<PrePostCheck | null>(null);
  const [detailsDialog, setDetailsDialog] = useState<boolean>(false);
  const [addEditDialog, setAddEditDialog] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<string>("");
  const [formData, setFormData] = useState({
    type: "pre" as "pre" | "post",
    drone: "",
    log: "",
    performedBy: "",
    items: [{ name: "", ok: false, notes: "" as string }],
  });

  const filteredChecks = checksData?.filter(
    (check) =>
      check.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      check.drone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      check.drone.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      check.log.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchChecks();
  }, []);

  const getItemsSummary = (items: PrePostCheck["items"]) => {
    const passed = items.filter((item) => item.ok).length;
    const total = items.length;
    return `${passed}/${total} passed`;
  };

  const handleViewDetails = (check: PrePostCheck) => {
    setSelectedCheck(check);
    setDetailsDialog(true);
  };

  const handleAddCheck = () => {
    setSelectedCheck(null);
    setSelectedDrone("");
    setFormData({
      type: "pre",
      drone: "",
      log: "",
      performedBy: "",
      items: [{ name: "", ok: false, notes: "" }],
    });
    setAddEditDialog(true);
  };

  const handleEditCheck = (check: PrePostCheck) => {
    setSelectedCheck(check);
    const droneId = check.drone._id;
    setSelectedDrone(droneId);
    setFormData({
      type: check.type,
      drone: droneId,
      log: check.log._id,
      performedBy: check.performedBy || "",
      items: check.items.map((item) => ({ ...item, notes: item.notes || "" })),
    });
    setAddEditDialog(true);
  };

  const handleDeleteCheck = (checkId: string) => {
    setSelectedCheckId(checkId);
    setDeleteDialog(true);
  };

  const handleSubmitCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      type: formData.type,
      drone: aircraftsData.find((d) => d._id === formData.drone)!,
      log: logsData.find((l) => l._id === formData.log)!,
      performedBy: formData.performedBy || undefined,
      items: formData.items,
    };

    if (selectedCheck) {
      await updatePrePostCheck(selectedCheck._id, data);
    } else {
      await createPrePostCheck(data);
    }
    setAddEditDialog(false);
    fetchChecks();
  };

  const handleConfirmDelete = async () => {
    if (selectedCheckId) {
      await deletePrePostCheck(selectedCheckId);
      setDeleteDialog(false);
      setSelectedCheckId(null);
      fetchChecks();
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", ok: false, notes: "" }],
    });
  };

  const updateItem = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-start items-center overflow-hidden">
      <div className="w-full grid grid-cols-3 justify-end place-items-end pb-10 flex-shrink-0">
        <Input
          type="search"
          placeholder="Search checks"
          className="col-start-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={handleAddCheck} className="col-start-3">
          <Plus className="w-4 h-4 mr-2" />
          Add Check
        </Button>
      </div>
      <div className="w-full flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Drone</TableHead>
              <TableHead>Log</TableHead>
              <TableHead>Items Summary</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChecks && filteredChecks.length > 0 ? (
              filteredChecks.map((check) => (
                <TableRow key={check._id}>
                  <TableCell>{check.type}</TableCell>
                  <TableCell>
                    {check.drone.name} ({check.drone.serial})
                  </TableCell>
                  <TableCell>{check.log.filename}</TableCell>
                  <TableCell>{getItemsSummary(check.items)}</TableCell>
                  <TableCell>
                    {new Date(check.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-start items-center gap-4">
                      <Edit
                        className="text-blue-500 cursor-pointer"
                        onClick={() => handleEditCheck(check)}
                      />
                      <Trash2
                        className="text-destructive cursor-pointer"
                        onClick={() => handleDeleteCheck(check._id)}
                      />
                      <Eye
                        className="text-blue-500 cursor-pointer"
                        onClick={() => handleViewDetails(check)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No pre/post checks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCheck
                ? selectedCheck.type.charAt(0).toUpperCase() +
                  selectedCheck.type.slice(1)
                : ""}{" "}
              Check Details
            </DialogTitle>
            <DialogDescription>
              Drone: {selectedCheck?.drone.name} ({selectedCheck?.drone.serial})
              | Log: {selectedCheck?.log.filename}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedCheck?.items.map((item, index) => (
                  <TableRow key={index}>
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
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={addEditDialog} onOpenChange={setAddEditDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCheck ? "Edit Check" : "Add Check"}
            </DialogTitle>
            <DialogDescription>
              {selectedCheck
                ? "Update the check details."
                : "Create a new pre/post check."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCheck}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "pre" | "post") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre">Pre-flight</SelectItem>
                    <SelectItem value="post">Post-flight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  Log
                </Label>
                <Select
                  value={formData.log}
                  onValueChange={(value) =>
                    setFormData({ ...formData, log: value })
                  }
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
                <Label htmlFor="performedBy" className="text-right">
                  Performed By
                </Label>
                <Input
                  id="performedBy"
                  value={formData.performedBy}
                  onChange={(e) =>
                    setFormData({ ...formData, performedBy: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="space-y-2">
                <Label>Check Items</Label>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(index, "name", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Select
                      value={item.ok.toString()}
                      onValueChange={(value) =>
                        updateItem(index, "ok", value === "true")
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Pass</SelectItem>
                        <SelectItem value="false">Fail</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Notes"
                      value={item.notes}
                      onChange={(e) =>
                        updateItem(index, "notes", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addItem}>
                  Add Item
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddEditDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedCheck ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Check</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this check? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrePostCheck;
