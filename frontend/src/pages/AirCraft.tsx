import { AirCraftForm } from "@/components/AirCraftForm";
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
import { SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";

const AirCraft = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [formType, setFormType] = useState<string>("add");

  const data = [
    {
      id: "m5gr84i9",
      amount: 316,
      status: "success",
      email: "ken99@example.com",
    },
    {
      id: "3u1reuv4",
      amount: 242,
      status: "success",
      email: "Abe45@example.com",
    },
    {
      id: "derv1ws0",
      amount: 837,
      status: "processing",
      email: "Monserrat44@example.com",
    },
    {
      id: "5kma53ae",
      amount: 874,
      status: "success",
      email: "Silas22@example.com",
    },
    {
      id: "bhqecj4p",
      amount: 721,
      status: "failed",
      email: "carmella@example.com",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-start items-center">
      <div className="w-full grid grid-cols-3 justify-end place-items-end">
        <Input
          type="search"
          placeholder="Search"
          className="col-start-2"
        />
        <Button
          className="col-start-3"
          onClick={() => {
            setOpen(!open);
          }}
        >
          Add
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.amount}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>
                <div className="flex justify-start items-center gap-4">
                  <SquarePen className="text-chart-1"></SquarePen>
                  <Trash2 className="text-destructive"></Trash2>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AirCraftForm open={open} setOpen={setOpen} type={formType} />
    </div>
  );
};

export default AirCraft;
