import { AirCraftForm } from "@/components/AirCraftForm";
import { DeleteAircraft } from "@/components/DeletAircraft";
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
import { useAircraft } from "@/context/useAircraft";
import type { AddDrone, Drone } from "@/model/aircraft";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const AirCraft = () => {
  const { aircraftsData, fetchDrones, addDrone, editDrone, deleteDrone } =
    useAircraft();

  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [formType, setFormType] = useState<string>("add");
  const [formData, setFormData] = useState<AddDrone | Drone>({
    name: "",
    modelName: "",
    serial: "",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredAircrafts = aircraftsData?.filter(
    (drone) =>
      drone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone.serial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const setEditData = (data: Drone) => {
    setFormType("edit");
    setFormData(data);
  };

  const onClose = () => {
    setFormType("add");
    setFormData({
      name: "",
      modelName: "",
      serial: "",
    });
  };

  const handleSubmit = async (data: AddDrone | Drone) => {
    if (formType === "add") {
      await addDrone(data as AddDrone);
    } else {
      await editDrone(data as Drone);
    }
    setOpen(false);
    onClose();
  };

  const handleDelete = async () => {
    if (selectedDroneId) {
      await deleteDrone(selectedDroneId);
      setDeleteDialog(false);
      setSelectedDroneId(null);
    }
  };

  useEffect(() => {
    fetchDrones();
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-start items-center overflow-hidden">
      <div className="w-full grid grid-cols-3 justify-end place-items-end pb-10 flex-shrink-0">
        <Input
          type="search"
          placeholder="Search"
          className="col-start-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          className="col-start-3"
          onClick={() => {
            setOpen(!open);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Drone
        </Button>
      </div>
      <div className="w-full flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Serial.No</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAircrafts && filteredAircrafts.length > 0 ? (
              filteredAircrafts.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.modelName}</TableCell>
                  <TableCell>{item.serial}</TableCell>
                  <TableCell>
                    <div className="flex justify-start items-center gap-4">
                      <SquarePen
                        className="text-[#1447E3]"
                        onClick={() => {
                          setEditData(item);
                          setOpen(true);
                        }}
                      ></SquarePen>
                      <Trash2
                        className="text-destructive"
                        onClick={() => {
                          setSelectedDroneId(item._id);
                          setDeleteDialog(true);
                        }}
                      ></Trash2>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No aircraft found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <AirCraftForm
        open={open}
        setOpen={setOpen}
        type={formType}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onClose={onClose}
      />
      <DeleteAircraft
        open={deleteDialog}
        setOpen={setDeleteDialog}
        onDelete={handleDelete}
        onClose={() => {
          setSelectedDroneId(null);
        }}
      />
    </div>
  );
};

export default AirCraft;
